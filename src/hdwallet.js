"use strict";
import * as StellarBase from "stellar-base";
import * as StellarSdk from './index';
import {HDKey} from "stellar-base";
import {Server} from "./server";

let toBluebirdRes = require("bluebird").resolve;
let toBluebirdRej = require("bluebird").reject;


let decodeMnemo = HDKey.getSeedFromMnemonic,
    strDecode   = StellarBase.decodeCheck,
    strEncode   = StellarBase.encodeCheck,
    genMaster   = HDKey.fromMasterSeed;

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

    static _accountBalanceLimit() { return 500; }
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
                return this._deserialize(this._version().mpriv.byte, key, url);
            }
            case "Z": {
                let key = strDecode(this._version().pubWallet.str, str);
                return this._deserialize(this._version().mpub.byte, key, url);
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
     * < Key[32]||Chain[32]||1stWithMoney[4]||1stUnused[4]||listLen[4]||list[4*listLen]>
     * @param url {string} server url
     * @returns {HDWallet}
     */
    static _deserialize(ver, wallet, url) {
        let hdw = new HDWallet(url),
            listLen;
        hdw.ver = ver;
        hdw.hdk = {};
        hdw.indexList = [];
        hdw.hdk.versions = ver;
        hdw.seed = wallet.slice(0, 32);
        if (ver == this._version().mpriv.byte)
            hdw.hdk = hdw.hdk = genMaster(hdw.seed, this._version().mpriv.byte);
        else if (ver == this._version().mpub.byte)
            hdw.hdk.publicKey = wallet.slice(0, 32);

        hdw.hdk.chainCode = wallet.slice(32, 64);
        hdw.firstWithMoney = wallet.readUInt32BE(64, 68);
        hdw.firstUnused = wallet.readUInt32BE(68, 72);
        listLen = wallet.readUInt32BE(72, 76);
        if ((listLen > this._maxListLen()) || (listLen * 4 + 76 > wallet.length + 5))
            throw new Error("Invalid serialized wallet");
        for (let i = 0, j =0; i < listLen; i++, j += 4) {
            hdw.indexList[i] = wallet.readUInt32BE(76 + j, 76 + 4 + j);
        }
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
        mpub.chainCode = rawKey.slice(0, 32);
        mpub._setPublicKey(rawKey.slice(32, 64));
        hdw.ver = this._version().mpub.byte;
        hdw.hdk = mpub;
        return hdw.totalRefresh();
    }

    /**
     * Setup all indexes in 0 and make Refresh of HDW.
     *
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
            path = "M/1/";

            return HDWallet._updateIndexesInOtherBranches("M/2/", this, this.indexList)
                .then(list => {
                    this.indexList = list.slice();
                    
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
        if (typeof path == "number")
            return this.hdk.getMasterPub("M/2/" + path);
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
        return this.getMPub(this.indexList.length);
    }

    /**
     * Calculate total balance of wallet for getting asset.
     * @param asset {Asset}
     * @returns {number} balance
     */
    getBalance(asset) {
        let path = ["M/1/", "M/2/"],
            self = this,
            data = {},
            otherBranchIndex = 0;

        data.asset = asset.code;
        data.balance = 0;
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
                            if (respList[i][j].asset == data.asset)
                                currentBalance += respList[i][j].balance;
                        }
                    }

                    if (currentBalance === data.balance) {
                        if(otherBranchIndex < self.indexList.length) {
                            _index = self.indexList[otherBranchIndex];
                            _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                            data.path = path[1] + otherBranchIndex + "/";
                            otherBranchIndex++;
                            
                            return findMoney(_index, _stopIndex);
                        }
                        if (otherBranchIndex >= self.indexList.length)
                            return currentBalance;
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
     * < Key[32]||Chain[32]||1stWithMoney[4]||1stUnused[4]||listLen[4]||list[4*listLen]>
     * @returns {string} For example: WADDF3F6LSTEJ5PSQONOQ76G...
     */
    serialize() {
        let ver,
            listLen = this.indexList.length,
            LEN = 76 + listLen * 4,
            buffer = new Buffer(LEN);

        if (this.ver == HDWallet._version().mpriv.byte) {
            this.seed.copy(buffer, 0);
            ver = HDWallet._version().privWallet.str;
        } else if (this.verB == HDWallet._version().mpub.byte) {
            this.hdk.publicKey.copy(buffer, 0);
            ver = HDWallet._version().pubWallet.str;
        }

        this.hdk.chainCode.copy(buffer, 32);
        buffer.writeUInt32BE(this.firstWithMoney, 64);
        buffer.writeUInt32BE(this.firstUnused, 68);
        buffer.writeUInt32BE(listLen, 72);

        for (let i = 0, j = 0; i < listLen; i++, j += 4) {
            buffer.writeUInt32BE(this.indexList[i], 72 + 4 + j);
        }
        return StellarBase.encodeWithoutPad(ver, buffer);
    }

    /**
     * Create and submit transaction.
     * @param invoice {*[]} Array of pair {accountID, amount}
     * @param asset {Asset} XDR.Asset
     * @returns {Promise.<TResult>|*}
     */
    doPayment(invoice, asset) {
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
        let amount = 0;
        let self = this;
        for (let i = 0; i < invoice.length; i++) {
            if (StellarBase.Keypair.isValidPublicKey(invoice[i].key) === false)
                throw new Error("Invalid public key in invoice list");
            amount += invoice[i].amount;
        }

        return self.makeWithdrawalList(amount, asset)
            .then(withdrawal => {
                let paymentList = HDWallet._makePaymentListOpt(invoice, withdrawal);
                let keypair = HDKey.getHDKeyForSigning(paymentList[0].source),
                    server = new Server(self._serverURL);

                return server.loadAccount(keypair.accountId())
                    .then(account => {
                        let transaction = new StellarSdk.TransactionBuilder(account);
                        for (let i = 0; i < paymentList.length; i++) {
                            console.log(paymentList[i].amount, "==", paymentList[i].amount.toString());
                            transaction.addOperation(StellarSdk.Operation.payment({
                                destination: paymentList[i].dest,
                                source: HDKey.getHDKeyForSigning(paymentList[i].source).accountId(),
                                asset: asset,
                                amount: paymentList[i].amount.toString()
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
     * @param amount {number} Amount.
     * @returns {*[]} Array of pair {accountID, amount}.
     */
    makeInvoiceList(amount){
        let path, self = this,
            data = {},
            invoiceList = [],
            _index = this.firstUnused,
            _stopIndex = HDWallet._lookAhead() + this.firstUnused;
        data.amount = amount;
        data.currentSum = 0;

        if (self.ver == HDWallet._version().mpriv.byte){
            path = "M/1/";
        } else if (self.ver == HDWallet._version().mpub.byte) {
            path = "M/";
        } else
            throw new Error("Version of HDWallet mismatch");

        function makingList(index, stopIndex) {
            let accountList = [];

            data.addend = [];
            for (let i = index, l = 0; i < stopIndex; i++, l++){
                let derivedKey = self.hdk.derive(path + i);
                accountList[l]  = derivedKey.accountId();
                data.addend.push(HDWallet._accountBalanceLimit());
            }

            return HDWallet._checkAccounts(accountList, self._serverURL)
                .then(respList => {
                    data.accountList = [];

                    for (let i = 0; i < respList.length; i++) {
                        if (respList[i][0].isValid === false) {
                            data.accountList.push(accountList[i]);
                        }
                    }
                    
                    if (HDWallet._sumCollecting(data, invoiceList) === true)
                        return invoiceList;
                    
                    _index += HDWallet._lookAhead();
                    _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                    return makingList(_index, _stopIndex);
                });
        }
        return makingList(_index, _stopIndex);
    }

    /**
     * Makes a list from all branches to make a payment of a given amount.
     * @param amount {number}
     * @param asset {Asset}
     * @returns {*[]} Array of pair {accountID, amount}.
     */
    makeWithdrawalList(amount, asset) {
        let path = ["m/1/", "m/2/"],
            withdrawalList = [], self = this,
            data = {}, otherBranchIndex = 0;
        data.amount = amount;
        data.asset = asset.code;
        data.currentSum = 0;
        data.path = path[0];
        data.f_w_m = this.firstWithMoney;
        
        function completeList(_data) {

            if (otherBranchIndex > self.indexList.length + 2)
                return toBluebirdRej(new Error("Not enough money!"));

            return self._findMoneyInBranch(withdrawalList, _data)
                .then(result => {
                    if (result == amount)
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
                    data.addend = [];

                    for (let i = 0; i < respList.length; i++) {
                        if (respList[i][0].isValid === false) 
                            continue;
                        
                        for (let j = 0; j < respList[i].length; j++) {
                            if ((respList[i][j].asset == data.asset) && (respList[i][j].balance !== 0)) {
                                data.accountList.push(privateKeyList[i]);
                                data.addend.push(respList[i][j].balance);
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
        let firstWithMoneyOld = indexPairOld.f_w_m;
        let indexPair = {};

        indexPair.f_w_m = -1;
        indexPair.f_u = 0;
        indexPair.indexingF_u = true;

        function request() {
            let accountList = [];
            for (let i = _index, l = 0; i < _stopIndex; i++, l++) {
                let derivedKey = hdw.hdk.derive(branchPath + i);
                accountList[l] = strEncode(self._version().accountId.str, derivedKey.publicKey);
            }

            return self._checkAccounts(accountList, hdw._serverURL)
                .then(respList => {

                    for (let i = 0; i < respList.length; i++) {
                        if (respList[i][0].isValid === false) {
                            continue;
                        }
                        if ((respList[i][0].balance > 0) && (indexPair.f_w_m === -1)) {
                            indexPair.f_w_m = i;

                            if (indexPair.indexingF_u === false) {
                                indexPair.f_u = -1;
                                return indexPair;
                            }
                        }
                        indexPair.f_u = _index + i + 1;
                    }
                    
                    if (indexPair.f_w_m < firstWithMoneyOld)
                        indexPair.f_w_m = firstWithMoneyOld;

                    if (indexPair.f_u <= _index)
                        return indexPair;
                    
                    _index += self._lookAhead();
                    _stopIndex = _index + self._lookAhead();
                    return request();

                 });
        }
        return request();
    }

    static _checkAccounts(request, url) {
        if (request.length === 0)
            toBluebirdRej("Invalid request - ", request);
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
                            asset: data.asset.asset_code,
                            balance: parseInt(account.balance) });
                    });
                });

                for (let i = 0; i < responseList.length; i++ ){
                    if ( typeof responseList[i] == "string"){
                        responseList[i] = [ {   isValid: false,
                                balance: 0 } ];
                    }
                }
                return responseList;
            });
    }


    static _sumCollecting ( data, list ) {
        for (let i = 0; i < data.accountList.length; i++) {
            if (data.currentSum + data.addend[i] < data.amount) {
                data.currentSum += data.addend[i];
                list.push({
                    key: data.accountList[i],
                    amount: data.addend[i]
                });
            }
            else if (data.currentSum + data.addend[i] >= data.amount) {
                let delta = data.amount - data.currentSum;
                data.currentSum += delta;
                list.push({
                    key: data.accountList[i],
                    amount: delta
                });
                return true;
            }
        }
        return false;
    }

    static _makePaymentList(invoice, withdrawal){
        let opList = [],
            sentAmount = 0,
            receivedAmount = 0,
            sourceRest = 0,
            destRest = 0;

        for (let wI = 0, iI = 0; wI < withdrawal.length;) {
            let toSend;
            if (sourceRest === 0)
                sourceRest = withdrawal[wI].amount;

            if (destRest === 0)
                toSend = sourceRest;
            else if (destRest > sourceRest)
                toSend = sourceRest;
            else if (destRest <= sourceRest)
                toSend = destRest;

            sentAmount += toSend;
            opList.push({ dest: invoice[iI].key,
                source: withdrawal[wI].key,
                amount: toSend });

            destRest = invoice[iI].amount - (toSend + receivedAmount);
            receivedAmount += toSend;

            if (sentAmount == withdrawal[wI].amount) {
                sentAmount = 0;
                sourceRest = 0;
                wI++;
            } else
                sourceRest = withdrawal[wI].amount - sentAmount;

            if (receivedAmount == invoice[iI].amount) {
                receivedAmount = 0;
                destRest = 0;
                iI++;
            } else
                destRest = invoice[iI].amount - receivedAmount;
        }
        return opList;
    }

    static _makePaymentListOpt(invoice, withdrawal) {
        let opList = [];

        for (let wI = 0, iI = 0; wI < withdrawal.length;) {
            let op_amount = this._min(withdrawal[wI].amount, invoice[iI].amount);

            opList.push({ dest: invoice[iI].key,
                source: withdrawal[wI].key,
                amount: op_amount });

            withdrawal[wI].amount -= op_amount;
            invoice[iI].amount -= op_amount;

            if (withdrawal[wI].amount === 0 )
                wI++;

            if (invoice[iI].amount === 0)
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

}