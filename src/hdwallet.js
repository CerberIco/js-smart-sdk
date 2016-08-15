"use strict";
import * as StellarBase from "stellar-base";
import * as StellarSdk from './index';
import {HDKey} from "stellar-base";
import {Server} from "./server";
import BigNumber from 'bignumber.js';
import isString from 'lodash/isString';

let toBluebirdRes = require("bluebird").resolve;
let toBluebirdRej = require("bluebird").reject;

const ONE = 10000000;
const MAX_INT64 = '9223372036854775807';
const PRIVATEKEY_LENGTH = 32;
const PUBLICKEY_LENGTH = 32;
const CHAINCODE_LENGTH = 32;
const SEED_LENGTH = 32;
const MASTERPUBLIC_LENGTH = 64;
const SERIALIZE_LENGTH = 80; //Length of serialized wallet without index list

let decodeMnemo = HDKey.getSeedFromMnemonic,
    strDecode   = StellarBase.decodeCheck,
    strEncode   = StellarBase.encodeCheck,
    genMaster   = HDKey.fromMasterSeed,
    xdr         = StellarBase.xdr;

export class HDWallet {

    /**
     * Implementation of `HDWallet` based on ed25519 curve.
     *
     * Use more convenient methods to create `HDWallet` object:
     * * `{@link HDWallet.setByPhrase}` by mnemonic phrase
     * * `{@link HDWallet.setByStrKey}` by seed, MasterPublic or serialized wallet
     *
     * @constructor
     * @param url {string} server url
     */
    constructor(url) {
        this.ver = null;
        this.firstWithMoney = null;
        this.firstUnused = null;
        this.mpubCounter = 0;
        this.indexList = null;
        this.seed = null;
        this.hdk = null;
        this._serverURL = url;
    }

    static _version() {
        return {
            accountId: {byte: 0x30, str: "accountId"},  // "G" in base32
            seed:      {byte: 0x90, str: "seed"},       // "S" in base32
            mpriv:     {byte: 0x60, str: "mpriv"},      // "M" in base32
            mpub:      {byte: 0x78, str: "mpub"},       // "P" in base32
            privWallet:{byte: 0xb0, str: "privWallet"}, // "W" in base32
            pubWallet: {byte: 0xc8, str: "pubWallet"}}; // "Z" in base32
    }

    static _path() {
        return {
            own:    {private: "m/1/", public: "M/1/"},
            others: {private: "m/2/", public: "M/2/"},
            self:             "M/" };
    }

    static _accountBalanceLimit() { return new BigNumber("500").mul(ONE); }
    static _branchAhead() { return 5; }
    static _lookAhead() { return 20; }
    static _maxIndex() { return 2147000000; }
    static _maxListLen() { return 50; }

    /**
     * Decode mnemonic and create HDWallet by seed
     * @param str {string} Mnemonic phrase for example:
     *       "fix forget despair friendship blue grip ..."
     * @param url {string} server url
     * @returns {*}
     */
    static setByPhrase(str, url) {
        return this.setByRawSeed(decodeMnemo(str), url);
    }

    /**
     * Check version of Base32 key, decode and setup HDWallet
     * @param str {string} Base32 key
     * @param url {string} server url
     * @returns {*}
     */
    static setByStrKey(str, url) {
        switch (str[0]) {
            case "P": {
                let key = strDecode(this._version().mpub.str, str);
                return this.setByMPublic(key, url);
            }
            case "S": {
                let key = strDecode(this._version().seed.str, str);
                return this.setByRawSeed(key, url);
            }
            case "W": {
                let key = strDecode(this._version().privWallet.str, str);
                return this._xdrDeserialize(this._version().mpriv.byte, key, url);
            }
            case "Z": {
                let key = strDecode(this._version().pubWallet.str, str);
                return this._xdrDeserialize(this._version().mpub.byte, key, url);
            }
            default : {
                toBluebirdRej(new Error ("Invalid version of StrKey"));
            }
        }
    }

    /**
     * Deserialize HDWallet from serialized byteArray.
     * @param ver {number} version of HDWallet
     * @param wallet {object} ByteArray
     * Data Structure of serialized wallet
     * < Key[32]||Chain[32]||1stWithMoney[4]||1stUnused[4]||mpubCounter[4]||listLen[4]||list[4*listLen]>
     * @param url {string} server url
     * @returns {HDWallet}
     */
    static _deserialize(ver, wallet, url) {
        let hdw = new HDWallet(url),
            listLen, offset = 0;
        hdw.ver = ver;
        hdw.hdk = {};
        hdw.indexList = [];
        hdw.hdk.versions = ver;
        
        if (ver == this._version().mpriv.byte) {
            hdw.seed = wallet.slice(offset, SEED_LENGTH);
            hdw.hdk = hdw.hdk = genMaster(hdw.seed, this._version().mpriv.byte);
            offset += SEED_LENGTH;
        }
        else if (ver == this._version().mpub.byte) {
            hdw.hdk.publicKey = wallet.slice(offset, PUBLICKEY_LENGTH);
            offset += PUBLICKEY_LENGTH;
        }

        hdw.hdk.chainCode = wallet.slice(offset, offset + CHAINCODE_LENGTH);
        offset += CHAINCODE_LENGTH;
        hdw.firstWithMoney = wallet.readUInt32BE(offset, offset + 4);
        offset += 4;
        hdw.firstUnused = wallet.readUInt32BE(offset, offset + 4);
        offset += 4;
        hdw.mpubCounter = wallet.readUInt32BE(offset, offset + 4);
        offset += 4;
        listLen = wallet.readUInt32BE(offset, offset + 4);
        offset += 4;
        
        if ((listLen > this._maxListLen()) || (listLen * 4 + offset > wallet.length + 5))
            return toBluebirdRej(new Error("Invalid serialized wallet"));
        for (let i = 0, j =0; i < listLen; i++, j += 4) {
            hdw.indexList[i] = wallet.readUInt32BE(offset + j, offset + 4 + j);
        }
        return toBluebirdRes(hdw);
    }
    
    /**
     * Deserialize HDWallet from serialized byteArray.
     * @param ver {number} version of HDWallet
     * @param rawWallet {object} xdr.HdWalletSerialization
     * @param url {string} server url
     * @returns {HDWallet}
     */
    static _xdrDeserialize(ver, rawWallet, url) {
        let hdw = new HDWallet(url);
        let xdrWallet = xdr.HdWalletSerialization.fromXDR(rawWallet);
        hdw.ver = ver;
        hdw.hdk = {};
        hdw.indexList = [];
        hdw.hdk.versions = ver;

        if (ver == this._version().mpriv.byte) {
            hdw.seed = new Buffer(xdrWallet.key());
            hdw.hdk = hdw.hdk = genMaster(hdw.seed, this._version().mpriv.byte);

        }
        else if (ver == this._version().mpub.byte) {
            hdw.hdk.publicKey = new Buffer(xdrWallet.key());

        }

        hdw.chainCode = new Buffer(xdrWallet.chainCode());
        hdw.firstWithMoney = xdrWallet.firstWithMoney();
        hdw.firstUnused = xdrWallet.firstUnused();
        hdw.mpubCounter = xdrWallet.mpubCounter();
        hdw.indexList = xdrWallet.indexList();

        return toBluebirdRes(hdw);
    }

    /**
     * Create HDWallet from Seed
     * @param seed {object} Buffer or hexString
     * @param url {string} server url
     * @returns {HDWallet}
     */
    static setByRawSeed(seed, url) {
        let hdw = new HDWallet(url);
        if (typeof seed == "string"){
            hdw.hdk = genMaster(new Buffer(seed, "hex"), this._version().mpriv.byte);
            hdw.seed = new Buffer(seed, "hex");
        } else{
            hdw.hdk = genMaster(seed, this._version().mpriv.byte);
            hdw.seed = seed;
        }

        hdw.ver = this._version().mpriv.byte;
        return hdw.totalRefresh();
    }

    /**
     * Create HDWallet from decoded MasterPublicKey {chainCode, publicKey}
     * @param rawKey {object} Buffer
     * @param url {string} server url
     * @returns {HDWallet}
     */
    static setByMPublic(rawKey, url) {
        let hdw = new HDWallet(url);
        let mpub = new HDKey();
        mpub.versions  = this._version().mpub.byte;
        mpub.chainCode = rawKey.slice(0, CHAINCODE_LENGTH);
        mpub._setPublicKey(rawKey.slice(CHAINCODE_LENGTH, MASTERPUBLIC_LENGTH));
        hdw.ver = this._version().mpub.byte;
        hdw.hdk = mpub;
        return hdw.totalRefresh();
    }

    /**
     * Setup all indexes in 0 and make Refresh of HDW.
     */
    totalRefresh() {
        this.firstUnused = 0;
        this.firstWithMoney = 0;
        this.indexList = [];
        return this.refresh();
    }

    /**
     * Update all indexes of HDWallet.
     */
    refresh() {
        let path,
            indexPair = { };

        indexPair.f_w_m = this.firstWithMoney;
        indexPair.f_u =  this.firstUnused;
        indexPair.indexingF_u = true;

        if (this.ver == HDWallet._version().mpriv.byte){
            path = HDWallet._path().own.public;

            return HDWallet._updateIndexesInOtherBranches(HDWallet._path().others.public, this, this.indexList)
                .then(list => {
                    this.indexList = list.slice();
                    if(this.mpubCounter < this.indexList.length)
                        this.mpubCounter = this.indexList.length;
                    
                    return HDWallet._updateIndexesInOwnBranch(path, this, indexPair)
                        .then(resultPair => {
                            this.firstWithMoney = resultPair.f_w_m;
                            this.firstUnused = resultPair.f_u;

                            return this;
                        });
                });
        }
        else if (this.ver == HDWallet._version().mpub.byte) {
            path = "M/";
            return HDWallet._updateIndexesInOwnBranch(path, this, indexPair)
                .then(resultPair => {
                    this.firstWithMoney = resultPair.f_w_m;
                    this.firstUnused = resultPair.f_u;
                    
                    return this;
                });
        } else
            return toBluebirdRej(new Error("Version of HDWallet mismatch"));
    }

    /**
     * Return Base32 encoded MasterPublicKey
     * @param path {number} or {string}
     * @return {string}
     */
    getMPub(path) {
        if (this.ver !== HDWallet._version().mpriv.byte)
            throw new Error("Version of HDWallet mismatch");

        if (typeof path == "number")
            return this.hdk.getMasterPub(HDWallet._path().others.public + path);
        if (typeof path == "string")
            return this.hdk.getMasterPub(path);
        else
            throw new Error("Invalid argument! Must be index (type = number) or path (type = string).");
    }

    /**
     * Return Base32 encoded MasterPublicKey for unused branch
     * @return {string}
     */
    getMPublicNew() {
        if (this.ver !== HDWallet._version().mpriv.byte)
            throw new Error("Version of HDWallet mismatch");
        let index = this.mpubCounter;
        this.mpubCounter +=1;
        return this.getMPub(index);
    }

    /**
     * Calculate total balance of wallet for getting asset.
     * @param asset {Asset}
     * @returns {string} balance
     */
    getBalance(asset) {
        let path = [],
            self = this,
            data = {},
            isPublic = false,
            otherBranchIndex = 0;

        if (this.ver == HDWallet._version().mpriv.byte)
            path = [HDWallet._path().own.public, HDWallet._path().others.public];
        else if (this.ver == HDWallet._version().mpub.byte) {
            path = [HDWallet._path().self];
            isPublic = true;
        }

        data.asset = asset.code;
        data.balance = new BigNumber(0);
        data.path = path[0];
        let _index = this.firstWithMoney,
            _stopIndex = _index + HDWallet._lookAhead();

        function findMoney(index, stopIndex) {
            let accountList = [];
            for (let i = index, l = 0; i < stopIndex; i++, l++) {
                let derivedKey = self.hdk.derive(data.path + i);
                accountList[l] = strEncode(HDWallet._version().accountId.str, derivedKey.publicKey);
            }

            return HDWallet._checkAccounts(accountList, self._serverURL)
                .then(respList => {
                    let currentBalance = data.balance;
                    
                    for (let i = 0; i < respList.length; i++) {
                        if (respList[i][0].isValid === false) 
                            continue;
                        
                        for (let j = 0; j < respList[i].length; j++) {
                            if (respList[i][j].asset.asset_code == data.asset)
                                currentBalance = currentBalance.plus(respList[i][j].balance);
                        }
                    }

                    if (currentBalance.equals(data.balance)) {
                        if (isPublic === true)
                            return HDWallet._fromAmount(currentBalance);

                        if(otherBranchIndex < self.indexList.length) {
                            _index = self.indexList[otherBranchIndex];
                            _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                            data.path = path[1] + otherBranchIndex + "/";
                            otherBranchIndex++;
                            
                            return findMoney(_index, _stopIndex);
                        }
                        if (otherBranchIndex >= self.indexList.length)
                            return HDWallet._fromAmount(currentBalance);
                    }
                    
                    data.balance = currentBalance;
                    _index += HDWallet._lookAhead();
                    _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                    return findMoney(_index, _stopIndex);
                });
        }

        return findMoney(_index, _stopIndex);
    }

    /**
     * Serialize HDWallet into Base32-encoded string.
     * < Key[32]||Chain[32]||1stWithMoney[4]||1stUnused[4]||mpubCounter[4]||listLen[4]||list[4*listLen]>
     * @returns {string} For example: WADDF3F6LSTEJ5PSQONOQ76G...
     */
    _serializeOld() {
        let ver, offset = 0,
            listLen = this.indexList.length,
            LEN = SERIALIZE_LENGTH + listLen * 4,
            buffer = new Buffer(LEN);

        if (this.ver == HDWallet._version().mpriv.byte) {
            this.seed.copy(buffer, offset);
            ver = HDWallet._version().privWallet.str;
            offset += PRIVATEKEY_LENGTH;
        } else if (this.ver == HDWallet._version().mpub.byte) {
            this.hdk.publicKey.copy(buffer, offset);
            ver = HDWallet._version().pubWallet.str;
            offset += PUBLICKEY_LENGTH;
        }

        this.hdk.chainCode.copy(buffer, offset);
        offset += CHAINCODE_LENGTH;
        buffer.writeUInt32BE(this.firstWithMoney, offset);
        offset += 4;
        buffer.writeUInt32BE(this.firstUnused, offset);
        offset += 4;
        buffer.writeUInt32BE(this.mpubCounter, offset);
        offset += 4;
        buffer.writeUInt32BE(listLen, offset);

        for (let i = 0, j = 0; i < listLen; i++, j += 4) {
            buffer.writeUInt32BE(this.indexList[i], offset + 4 + j);
        }
        return StellarBase.encodeWithoutPad(ver, buffer);
    }

    serialize() {
        let key, ver;
        if (this.ver == HDWallet._version().mpriv.byte) {
            key = this.seed;
            ver = HDWallet._version().privWallet.str;
        } 
        else if (this.ver == HDWallet._version().mpub.byte) {
            key = this.hdk.publicKey;
            ver = HDWallet._version().pubWallet.str;
        }
        let xdrWallet = new xdr.HdWalletSerialization({
            key:            key,
            chainCode:      this.hdk.chainCode, 
            firstWithMoney: this.firstWithMoney, 
            firstUnused:    this.firstUnused, 
            mpubCounter:    this.mpubCounter, 
            indexList:      this.indexList  });
        
        return strEncode(ver, xdrWallet.toXDR());
    }

    /**
     * Create and submit transaction.
     * @param invoice {*[]} Array of pair {accountID, amount}
     * @param asset {Asset} XDR.Asset
     * @returns {Promise.<TResult>|*}
     */
    doPayment(invoice, asset) {
        if (this.ver !== HDWallet._version().mpriv.byte)
            return toBluebirdRej(new Error("Version of HDWallet mismatch"));

        let server = new Server(this._serverURL);
        return this.createTx(invoice, asset)
            .then(txEnvelope => {
                return server.submitTransaction(txEnvelope);
            });
    }

    /**
     * Create transaction envelope.
     * @param invoice {*[]} Array of pair {accountID, amount}
     * @param asset {Asset} XDR.Asset
     * @returns {Promise.<TResult>|*} txEnvelope
     */
    createTx(invoice, asset) {
        if (this.ver !== HDWallet._version().mpriv.byte)
            return toBluebirdRej(new Error("Version of HDWallet mismatch"));

        let amount = new BigNumber(0);
        let self = this;
        for (let i = 0; i < invoice.length; i++) {
            if (StellarBase.Keypair.isValidPublicKey(invoice[i].key) === false)
                return toBluebirdRej(new Error("Invalid invoice"));
            amount = amount.plus(invoice[i].amount);
        }

        return self.makeWithdrawalList(amount, asset)
            .then(withdrawal => {
                let paymentList = HDWallet._makePaymentList(invoice, withdrawal);
                let keypair = HDKey.getHDKeyForSigning(paymentList[0].source),
                    server = new Server(self._serverURL);

                return server.loadAccount(keypair.accountId())
                    .then(account => {
                        let transaction = new StellarSdk.TransactionBuilder(account);
                        for (let i = 0; i < paymentList.length; i++) {
                            transaction.addOperation(StellarSdk.Operation.payment({
                                destination: paymentList[i].dest,
                                source: HDKey.getHDKeyForSigning(paymentList[i].source).accountId(),
                                asset: asset,
                                amount: HDWallet._fromAmount(paymentList[i].amount)
                            }));
                        }
                        let txEnvelope = transaction.build();

                        for (let i = 0; i < withdrawal.length; i++) {
                            txEnvelope.sign(HDKey.getHDKeyForSigning(withdrawal[i].key));
                        }
                        return txEnvelope;
                    });
            });
    }

    /**
     * Makes a list for getting amount.
     * @param strAmount {string} Amount.
     * @returns {*[]} Array of pair {accountID, amount}.
     */
    makeInvoiceList(strAmount){
        let path,
            invoiceList = [],
            amount = HDWallet._toAmount(strAmount),
            index = this.firstUnused;

        if (this.ver == HDWallet._version().mpriv.byte)
            path = HDWallet._path().own.public;
        else if (this.ver == HDWallet._version().mpub.byte)
            path = HDWallet._path().self;
        else
            throw new Error("Version of HDWallet mismatch");

        let numberOfAddresses = amount.divToInt(HDWallet._accountBalanceLimit()).toNumber();
        let piece = amount.mod(HDWallet._accountBalanceLimit());
        let stopIndex = numberOfAddresses + index;

        while (index < stopIndex) {
            let derivedKey = this.hdk.derive(path + index);
            invoiceList.push({
                key: derivedKey.accountId(),
                amount: HDWallet._accountBalanceLimit()
            });
            index++;
        }

        if(!(piece.isZero())) {
            let derivedKey = this.hdk.derive(path + index);
            invoiceList.push({
                key: derivedKey.accountId(),
                amount: piece
            });
        }

        return invoiceList;
    }

    /**
    * Create list of pair private keys
    * and balances, for all accounts with money.
    * @returns {*[]} Array of pair {key, balances}
    */
    getKeysForAccountsWithMoney() {
        if (this.ver !== HDWallet._version().mpriv.byte)
            return toBluebirdRej(new Error("Version of HDWallet mismatch"));

        let path = [HDWallet._path().own.private, HDWallet._path().others.private],
            self = this,
            otherBranchIndex = 0;
        let currentPath = path[0];
        let resultList = [];

        let _index = this.firstWithMoney,
            _stopIndex = _index + HDWallet._lookAhead();

        function findMoney(index, stopIndex) {
            let accountList = [];
            let privateKeyList = [];

            for (let i = index, l = 0; i < stopIndex; i++, l++) {
                let derivedKey = self.hdk.derive(currentPath + i);
                accountList[l] = strEncode(HDWallet._version().accountId.str, derivedKey.publicKey);
                privateKeyList[l] =  strEncode(HDWallet._version().mpriv.str, derivedKey.privateKey);
            }

            return HDWallet._checkAccounts(accountList, self._serverURL)
                .then(respList => {
                    let isEmpty = true;
                    for (let i = 0; i < respList.length; i++) {
                        let balances = [];
                        if (respList[i][0].isValid === false) continue;
                        isEmpty = false;

                        for (let j = 0; j < respList[i].length; j++) {
                            if (respList[i][j].balance.isZero() === true) continue;
                            balances.push({ asset: respList[i][j].asset,
                                balance: HDWallet._fromAmount(respList[i][j].balance) });
                        }

                        if (balances.length !== 0)
                            resultList.push({key: privateKeyList[i], balances: balances});
                    }

                    if (isEmpty === true) {
                        if(otherBranchIndex < self.indexList.length) {
                            _index = self.indexList[otherBranchIndex];
                            _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                            currentPath = path[1] + otherBranchIndex + "/";
                            otherBranchIndex++;

                            return findMoney(_index, _stopIndex);
                        }
                        if (otherBranchIndex >= self.indexList.length)
                            return resultList;
                    }

                    _index += HDWallet._lookAhead();
                    _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                    return findMoney(_index, _stopIndex);
                });
        }

        return findMoney(_index, _stopIndex);
    }
    
    /**
    * Create list of accountId and balances,
    * for all accounts with money.
    * @returns {*[]} Array of pair {account_id, balances}
    */
    getAccountIdsWithMoney() {
        let path = [],
            self = this,
            isPublic = false,
            otherBranchIndex = 0;

        let resultList = [];

        if (this.ver == HDWallet._version().mpriv.byte)
            path = [HDWallet._path().own.public, HDWallet._path().others.public];
        else if (this.ver == HDWallet._version().mpub.byte) {
            path = [HDWallet._path().self];
            isPublic = true;
        }

        let currentPath = path[0];
        let _index = this.firstWithMoney,
            _stopIndex = _index + HDWallet._lookAhead();

        function findMoney(index, stopIndex) {
            let accountList = [];

            for (let i = index, l = 0; i < stopIndex; i++, l++) {
                let derivedKey = self.hdk.derive(currentPath + i);
                accountList[l] = strEncode(HDWallet._version().accountId.str, derivedKey.publicKey);
            }

            return HDWallet._checkAccounts(accountList, self._serverURL)
                .then(respList => {
                    let isEmpty = true;

                    for (let i = 0; i < respList.length; i++) {
                        let balances = [];
                        if (respList[i][0].isValid === false) continue;
                        isEmpty = false;

                        for (let j = 0; j < respList[i].length; j++) {
                            if (respList[i][j].balance.isZero() === true) continue;
                            balances.push({ asset: respList[i][j].asset,
                                balance: HDWallet._fromAmount(respList[i][j].balance) });
                        }

                        if (balances.length !== 0)
                            resultList.push({account_id: accountList[i], balances: balances});
                    }

                    if (isEmpty === true) {
                        if (isPublic === true)
                        return resultList;

                        if(otherBranchIndex < self.indexList.length) {
                            _index = self.indexList[otherBranchIndex];
                            _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                            currentPath = path[1] + otherBranchIndex + "/";
                            otherBranchIndex++;

                            return findMoney(_index, _stopIndex);
                        }
                        if (otherBranchIndex >= self.indexList.length)
                            return resultList;
                    }

                    _index += HDWallet._lookAhead();
                    _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                    return findMoney(_index, _stopIndex);
                });
        }

        return findMoney(_index, _stopIndex);
    }

    /**
     * Makes a list from all branches to make a payment of a given amount.
     * @param amount {BigNumber}
     * @param asset {Asset}
     * @returns {*[]} Array of pair {accountID, amount}.
     */
    makeWithdrawalList(amount, asset) {
        if (this.ver !== HDWallet._version().mpriv.byte)
            return toBluebirdRej(new Error("Version of HDWallet mismatch"));

        let path = [HDWallet._path().own.private, HDWallet._path().others.private],
            withdrawalList = [], self = this,
            data = {}, otherBranchIndex = 0;
        data.amount = amount;
        data.asset = asset.code;
        data.currentSum = new BigNumber(0);
        data.path = path[0];
        data.f_w_m = this.firstWithMoney;
        
        function completeList(_data) {

            if (otherBranchIndex > self.indexList.length)
                return toBluebirdRej(new Error("Not enough money!"));

            return self._findMoneyInBranch(withdrawalList, _data)
                .then(result => {
                    if (result.equals(data.amount))
                        return withdrawalList;

                    data.f_w_m = self.indexList[otherBranchIndex];
                    data.path = path[1] + otherBranchIndex + "/";
                    otherBranchIndex++;

                    return completeList(data);
                });
        }

        return completeList(data);
    }

    _findMoneyInBranch(withdrawalList, data) {
        let self = this,
            _index = data.f_w_m,
            _stopIndex = HDWallet._lookAhead() + _index;

        function makingList(index, stopIndex) {
            let accountList = [],
                privateKeyList = [];
            
            for (let i = index, l = 0; i < stopIndex; i++, l++) {
                let derivedKey = self.hdk.derive(data.path + i);
                accountList[l] = strEncode(HDWallet._version().accountId.str, derivedKey.publicKey);
                privateKeyList[l] = strEncode(HDWallet._version().mpriv.str, derivedKey.privateKey);
            }

            return HDWallet._checkAccounts(accountList, self._serverURL)
                .then(respList => {
                    data.accountList = [];
                    data.balance = [];

                    for (let i = 0; i < respList.length; i++) {
                        if (respList[i][0].isValid === false) 
                            continue;
                        
                        for (let j = 0; j < respList[i].length; j++) {
                            if ((respList[i][j].asset.asset_code == data.asset) && !(respList[i][j].balance.isZero())) {
                                data.accountList.push(privateKeyList[i]);
                                if(respList[i][j].balance.gt(HDWallet._accountBalanceLimit()))
                                    data.balance.push(HDWallet._accountBalanceLimit());
                                else
                                    data.balance.push(respList[i][j].balance);
                            }
                        }
                    }

                    if (data.accountList.length === 0)
                        return data.currentSum;

                    if (HDWallet._sumCollecting(data, withdrawalList) === true)
                        return data.currentSum;
                    
                    _index += HDWallet._lookAhead();
                    _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                    return makingList(_index, _stopIndex);
                });
        }

        return makingList(_index, _stopIndex);
    }

    static _updateIndexesInOtherBranches(path, hdw, indexList){
        let self = this;
        let _index = 0;
        let _stopIndex = this._branchAhead();
        let indexListLen = indexList.length;

        function indexing(index, stopIndex) {
            if (indexListLen <= _index)
                indexList.push(0);

            let indexPair = {f_w_m: indexList[index], f_u: indexList[index], indexingF_u: false};

            return self._updateIndexesInOwnBranch(path + index + "/", hdw, indexPair)
                .then(resultIndexPair => {
                    _index += 1;

                    if(_index  >= stopIndex)
                        return indexList.slice(0, indexList.length - self._branchAhead());

                    if (resultIndexPair.f_u === 0)
                        return indexing(_index, _stopIndex);

                    indexList[index] = resultIndexPair.f_w_m;
                    
                    _stopIndex = self._min(_index + self._branchAhead(), self._maxListLen());

                    return indexing(_index, _stopIndex);

                });
        }
        return indexing(_index, _stopIndex);
    }

    static _updateIndexesInOwnBranch(branchPath, hdw, indexPairOld){
        let _index = this._min(indexPairOld.f_w_m, indexPairOld.f_u);
        let _stopIndex = this._lookAhead() + _index;
        let self = this;
        let f_w_mFound = false;
        let indexPair = {};

        indexPair.f_w_m = _index;
        indexPair.f_u = 0;
        indexPair.indexingF_u = indexPairOld.indexingF_u;

        function request() {
            let accountList = [];
            for (let i = _index, l = 0; i < _stopIndex; i++, l++) {
                let derivedKey = hdw.hdk.derive(branchPath + i);
                accountList[l] = strEncode(self._version().accountId.str, derivedKey.publicKey);
            }

            return self._checkAccounts(accountList, hdw._serverURL)
                .then(respList => {
                    for (let i = 0; i < respList.length; i++) {
                        if (respList[i][0].isValid === false)
                            continue;

                        if ( !(respList[i][0].balance.isZero()) && (f_w_mFound === false)) {
                            indexPair.f_w_m = _index + i;
                            f_w_mFound = true;
                            if (indexPair.indexingF_u === false) {
                                indexPair.f_u = -1;
                                return indexPair;
                            }
                        }
                        indexPair.f_u = _index + i + 1;
                    }

                    if (indexPair.f_u <= _index) {
                        return indexPair;
                    }

                    _index += self._lookAhead();
                    _stopIndex = _index + self._lookAhead();
                    return request();
                 });
        }
        return request();
    }

    static _checkAccounts(request, url) {
        if (request.length === 0)
            toBluebirdRej("Invalid request");
        let server = new Server(url);
        return server.getBalances(request)
            .then(response => {
                let assets = response.assets;
                let responseList = request.slice();

                assets.forEach( function(data) {
                    data.balances.forEach( function(account) {
                        let pos = request.indexOf(account.account_id);

                        if ( typeof responseList[pos] == "string")
                            responseList[pos] = [];
                        responseList[pos].push({
                            isValid: true,
                            asset: data.asset,
                            balance: HDWallet._toAmount(account.balance) });
                    });
                });

                for (let i = 0; i < responseList.length; i++ ){
                    if ( typeof responseList[i] == "string"){
                        responseList[i] = [ {   isValid: false } ];
                    }
                }
                return responseList;
            });
    }

    static _sumCollecting ( data, list ) {
        for (let i = 0; i < data.accountList.length; i++) {
            if (data.currentSum.plus(data.balance[i]).lessThan(data.amount) ) {
                data.currentSum = data.currentSum.plus(data.balance[i]);
                list.push({
                    key: data.accountList[i],
                    amount: data.balance[i]
                });
            }
            else if (data.currentSum.plus(data.balance[i]).gte(data.amount)) {
                let delta = data.amount.minus(data.currentSum);
                data.currentSum = data.currentSum.plus(delta);
                list.push({
                    key: data.accountList[i],
                    amount: delta
                });
                return true;
            }
        }
        return false;
    }

    static _makePaymentList(invoice, withdrawal) {
        let opList = [];

        for (let wI = 0, iI = 0; wI < withdrawal.length;) {
            let op_amount = this._minAmount(withdrawal[wI].amount, invoice[iI].amount);

            opList.push({ dest: invoice[iI].key,
                source: withdrawal[wI].key,
                amount: op_amount });

            withdrawal[wI].amount = withdrawal[wI].amount.minus(op_amount);
            invoice[iI].amount = invoice[iI].amount.minus(op_amount);

            if (withdrawal[wI].amount.isZero() )
                wI++;

            if (invoice[iI].amount.isZero())
                iI++;
        }

        return opList;
    }

    static _min(a, b) {
        if (a < b)
            return a;
        else
            return b;
    }

    static _minAmount(a, b) {
        if (a.lessThan(b))
            return a;
        else
            return b;
    }

    static _isValidAmount(value) {
        if (!isString(value)) {
            return false;
        }

        let amount;
        try {
            amount = new BigNumber(value);
        } catch (e) {
            return false;
        }

        // < 0
        if (amount.isNegative()) {
            return false;
        }

        // > Max value
        if (amount.times(ONE).greaterThan(new BigNumber(MAX_INT64).toString())) {
            return false;
        }

        // Decimal places (max 7)
        if (amount.decimalPlaces() > 7) {
            return false;
        }

        // Infinity
        if (!amount.isFinite()) {
            return false;
        }

        // NaN
        if (amount.isNaN()) {
            return false;
        }

        return true;
    }

    static _toAmount(value) {
        if (this._isValidAmount(value))
            return new BigNumber(value).mul(ONE);
        throw new Error("Invalid amount - " + value + "!");
    }

    static _fromAmount(value) {
        return new BigNumber(value).div(ONE).toString();
    }
    
}