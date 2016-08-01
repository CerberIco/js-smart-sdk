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

export class HDWallet{
    
    constructor(url){
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
            pubWallet: {byte: 0xc8, str: "pubWallet"}};// "Z" in base32
    }
    static _lookAhead() {
        return 20;
    }
    static _branchAhead() {
        return 5;
    }
    static _maxListLen() {
        return 50;
    }
    static _maxIndex() {
        return 2147000000;
    }
    static _accountBalanceLimit() {
        return 500;
    }
    static _min(a, b) {
        if (a < b)
            return a;
        else
            return b;
    }
    
    /**
     * Decode mnemonic and create HDWallet by seed
     * @param str {string} Mnemonic phrase for example:
     *       "fix forget despair friendship blue grip ..."
     * @param url
     * @returns {*}
     */
    static SetByPhrase(str, url){
        return this.setBySeed(decodeMnemo(str), url);
    }

    /**
     * Check version of Base32 key, decode and setup HDWallet
     * @param str {string} Base32 key
     * @param url
     * @returns {*}
     */
    static SetByStrKey(str, url){
        switch (str[0]) {
            case "P": {
                let key = strDecode(this._version().mpub.str, str);
                return this.setByMPublic(key, url);
            }
            case "S": {
                let key = strDecode(this._version().seed.str, str);
                return this.setBySeed(key, url);
            }
            case "W": {
                let key = strDecode(this._version().privWallet.str, str);
                return this.deserialize(this._version().mpriv.byte, key, url);
            }
            case "Z": {
                let key = strDecode(this._version().pubWallet.str, str);
                return this.deserialize(this._version().mpub.byte, key, url);
            }
            default : {
                throw new Error ("Invalid version of StrKey");
            }
        }
    }

	/**
     * Deserialize HDWallet from serialized byteArray.
     * @param ver {number} version of HDWallet
     * @param wallet {object} ByteArray  
     * < Key[32]||Chain[32]||1stWithMoney[4]||1stUnused[4]||listLen[4]||list[4*listLen]>
     * @param url
     * @returns {HDWallet}
     */
    static deserialize(ver, wallet, url){
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
    * @param url
    * @returns {HDWallet}
    */
    static setBySeed(seed, url){
        let hdw = new HDWallet(url);
        if (typeof seed == "string"){
            hdw.hdk = genMaster(new Buffer(seed, "hex"), this._version().mpriv.byte);
            hdw.seed = new Buffer(seed, "hex");
        } else{
            hdw.hdk = genMaster(seed, this._version().mpriv.byte);
            hdw.seed = seed;
        }
        hdw.ver = this._version().mpriv.byte;
        return this._setAllIndex(hdw);
    }

    /**
     * Create HDWallet from decoded MasterPublicKey {chainCode, publicKey}
     * @param rawKey {object} Buffer
     * @param url
     * @returns {HDWallet}
     */
    static setByMPublic(rawKey, url){
        let hdw = new HDWallet(url);
        let mpub = new HDKey();
        mpub.versions  = this._version().mpub.byte;
        mpub.chainCode = rawKey.slice(0, 32);
        mpub.setPublicKey(rawKey.slice(32, 64));
        hdw.ver = this._version().mpub.byte;
        hdw.hdk = mpub;
        return this._setAllIndex(hdw);
    }

    /**
     * Setup indexes for all branches and create HDWallet.
     * @param hdw {HDWallet} HDWallet without indexes.
     * @returns {HDWallet}
     */
    static _setAllIndex(hdw){
        let path, self = this,
            indexPair = {f_w_m: 0, f_u:  0, indexingF_u: true};

        if (hdw.ver == this._version().mpriv.byte){
            path = "m/1/";
            let indexList = [];
            indexList.push(0);

            return self._updateBranchIndexes("M/2/", hdw, indexList)
            	.then(list => {
                    hdw.indexList = list.slice();
            		return self._updateAddressIndexes(path, hdw, indexPair)
            		.then(result => {
        				hdw.firstWithMoney = indexPair.f_w_m;
        				hdw.firstUnused = indexPair.f_u;
        				return hdw;
            		});


            	});
        } else if (hdw.ver == this._version().mpub.byte) {
            path = "M/";
            return self._updateAddressIndexes(path, hdw, indexPair)
            		.then(result => {
        				hdw.firstWithMoney = indexPair.f_w_m;
        				hdw.firstUnused = indexPair.f_u;
        				return hdw;
            		});
        } else
            return toBluebirdRej(new Error("Invalid ver"));
    }

    /**
     *
     * @param path
     * @param hdw
     * @param indexList
     * @returns {*}
     */
    static _updateBranchIndexes(path, hdw, indexList){
    	let _index = 0, sliceCounter = 0;
    	let _stopIndex = this._branchAhead();
    	let self = this;
        function indexing(index, stopIndex) {
    		let indexPair = {f_w_m: indexList[index], f_u: indexList[index], indexingF_u: false};
    		return self._updateAddressIndexes(path + index + "/", hdw, indexPair)
                .then(result => {

    				if ((result === 0) && (index < stopIndex)) {
    					indexList.push(0);
                		sliceCounter += 1;
                        _index += 1;
                		return indexing(_index, _stopIndex);
                	}
                	else if ((result === 1) && (index < stopIndex)) {
                		indexList.push(0);
                        sliceCounter = 0;
                		indexList[index] = indexPair.f_w_m;
                		_stopIndex = self._min(index + self._branchAhead(), self._maxListLen());
                		_index += 1;
                		return indexing(_index, _stopIndex);
                	}    				
    				return indexList.slice(0, indexList.length - sliceCounter - 1);
    			});
    	}
        return indexing(_index, _stopIndex);
    }

    /**
     * Check branch for account with money.
     * @param branchPath {string}
     * @param hdw{HDWallet}
     * @param indexPair{object} Pair of indexes {1stWithMoney, 1stUnused}.
     * @returns {*}
     */
  	static _updateAddressIndexes(branchPath, hdw, indexPair){
        let _index = this._min(indexPair.f_w_m, indexPair.f_u);
        let _stopIndex = this._lookAhead() + _index;
        let self = this;
        indexPair.f_w_m = -1;
        indexPair.f_u = 0;

        function request() {
        	let accountList = [];
        	for (let index = _index, l = 0; l < _stopIndex; index++, l++) {
            	let derivedKey = hdw.hdk.derive(branchPath + index);
            	accountList[l] = strEncode(self._version().accountId.str, derivedKey.publicKey);
        	}

        	return self._checkAccount(accountList, hdw._serverURL)
        		.then(respList => {
                    if (respList === 0)
                        return 0;
                    let res = self._indexSetting(respList, indexPair);
        			switch (res){
        			case  true:  return 1;
        			case false:  {
            			_index += self._lookAhead();
            			_stopIndex = _index + self._lookAhead();
            			request();
            		} 
            	} });
        }
        return request();
    }

    /**
     *
     * @param request
     * @param url
     * @returns {Promise.<TResult>|*}
     * @private
     */
    static _checkAccount(request, url){
        if (request.length === 0)
            toBluebirdRej("Invalid request");
        let server = new Server(url);
        return server
            .getBalances(request)           
            .then(response => {
                let assets = response.assets;
                if (assets.length === 0)
                    return 0;
                let responseList = request.slice();

                assets.forEach( function(data) {
                    data.balances.forEach( function(account) {

                        let pos = request.indexOf(account.account_id);

                        if ( typeof responseList[pos] == "string")
                            responseList[pos] = [];
                    
                        responseList[pos].push({   
                            asset: data.asset.asset_code,
                            balance: account.balance });    
                    }); 
                });
              
                for (let i = 0; i < responseList.length; i++ ){
                    if ( typeof responseList[i] == "string"){
                	    responseList[i] = -1;
                    }
                }
                return responseList;
            });
    }

    /**
     *
     * @param accountStatus
     * @param indexPair
     * @returns {boolean}
     */
  	static _indexSetting(accountStatus, indexPair) {
        let resp = false;
        for (let index = 0; index < accountStatus.length; index++) {
            if (accountStatus[index] == -1) {
                continue;
            }
            if ((accountStatus[index][0].balance > 0) && (indexPair.f_w_m === -1)) {
                indexPair.f_w_m = index;
                resp = true;
                if (indexPair.indexingF_u === false) {
                    indexPair.f_u = -1;
                    return resp;
                }
            }
       	    indexPair.f_u = index + 1;
   	    }
   	    return resp;
    }

    /**
     * Setup all indexes in 0 and make Refresh of HDW.
     * @constructor
     */
    TotalRefresh(){
        this.firstUnused = 0;
        this.firstWithMoney = 0;
        this.indexList = [];
        this.Refresh();
    }

    /**
     * Update all indexes of HDWallet.
     * @constructor
     */
    Refresh(){ //TODO: Уточни касательно Refresh и наличия возвращаемого значения!!
        let path,
            indexPair = {
                f_w_m: this.firstWithMoney,
                f_u:  this.firstUnused,
                indexingF_u: true};

        if (this.ver == HDWallet._version().mpriv.byte){
            path = "m/1/";
            this.indexList.push(0);
            return HDWallet._updateBranchIndexes("M/2/", this, this.indexList)
            	.then(list => {
            		
                    this.indexList = list.slice();
            		return HDWallet._updateAddressIndexes(path, this, indexPair)
            		.then(result => {
        				this.firstWithMoney = indexPair.f_w_m;
        				this.firstUnused = indexPair.f_u;
        				return this;
            		});
            	});
        } else if (this.ver == HDWallet._version().mpub.byte) {
            path = "M/";
            return HDWallet._updateAddressIndexes(path, this, indexPair)
            		.then(result => {
        				this.firstWithMoney = indexPair.f_w_m;
        				this.firstUnused = indexPair.f_u;
        				return this;
            		});
        } else
            return toBluebirdRej(new Error("Version of HDWallet mismatch"));
    }

    /**
     * @return {string}
     */
    GetMPublicNew(){
        return this.GetMPub(this.indexList.length + 1);
    }

    /**
     * @return {string}
     */
    GetMPub(path){
        if (typeof path == "number")
            return this.hdk.getMasterPub("M/" + path);
        if (typeof path == "string")
            return this.hdk.getMasterPub(path);
        else
            throw new Error("Invalid argument! Must be index (type = number) or path (type = string).");
    }

	/**
     * Makes a list for getting amount.
     * @param amount {number} Amount.
     * @returns {*[]} Array of pair {accountID, amount}.
     */
    MakeInvoiceList(amount){
        let path, self = this,
            data = {},
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
            let accountList = [],
                list = [];
            data.addend = [];
            for (let i = index, l = 0; i < stopIndex; i++, l++){
                let derivedKey = self.hdk.derive(path + i);
                accountList[l]  = derivedKey.accountId();
                data.addend.push(HDWallet._accountBalanceLimit());
            }

            return HDWallet._checkAccount(accountList, self._serverURL)
                .then(respList => {
                    if (respList === 0) {
                        data.accountList = accountList;

                    } else {
                        data.accountList = [];
                        for (let i = 0; i < respList.length; i++) {
                            if (respList[i] === -1) {
                                data.accountList.push(accountList[i]);
                            }
                        }
                    }

                    if (HDWallet._sumCollecting(data, list) === true){
                        return list;
                    }
                    _index += HDWallet._lookAhead();
                    _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                    return makingList(_index, _stopIndex);
                });   
        }
        return makingList(_index, _stopIndex);
    }

    /**
     * Makes a list from all branches to make a payment of a given amount.
     * @param amount {number} Amount.
     * @param asset
     * @returns {*[]} Array of pair {accountID, amount}.
     */
    MakeWithdrawalList(amount, asset) {
        let path = ["m/1/", "m/2/"],
            list = [], self = this,
            data = {}, d = 0;
        data.amount = amount;
        data.asset = asset.code;
        data.currentSum = 0;
        data.path = path[0];
        data.f_w_m = this.firstWithMoney;

        function completeList(_data) {
            if (d >= self.indexList.length)
                return toBluebirdRej(new Error("Not enough money!"));
            return self._findMoneyInBranch(list, _data)
                .then(result => {
                    if (result === amount) {
                        return list;
                    }
                    data.f_w_m = self.indexList[d];
                    data.path = path[1] + d + "/";
                    data.amount = amount - result;
                    d++;

                    return self._findMoneyInBranch(list, data);

                    }
                );
        }

        return completeList(data);
    }

    /**
     * Makes a list from one branch to make a payment of a given amount.

     */
    _findMoneyInBranch(list, data) {
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
            if (accountList.length === 0) {
                return toBluebirdRes(data.currentSum);
            }
            return HDWallet._checkAccount(accountList, self._serverURL)
                .then(respList => {
                    if (respList === 0) {
                        return data.currentSum;
                    }
                    data.accountList = [];
                    data.addend = [];

                    for (let i = 0; i < respList.length; i++) {
                        if (respList[i] !== -1) {
                            for (let j = 0; j < respList[i].length; j++) {
                                if (respList[i][j].asset == data.asset) {
                                    data.accountList.push(privateKeyList[i]);
                                    data.addend.push(respList[i][j].balance % 1000);
                                }
                            }
                        }
                    }

                    if (HDWallet._sumCollecting(data, list) === true) {
                        return data.currentSum;
                    }
                    _index += HDWallet._lookAhead();
                    _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                    return makingList(_index, _stopIndex);
                });
        }

        return makingList(_index, _stopIndex);
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
    
    DoPayment(invoice, asset) {
        let server = new Server(this._serverURL);
        return this.createTX(invoice, asset)
            .then(txEnvelope => {
                return server.submitTransaction(txEnvelope);
            });
    }
    
    createTX(invoice, asset) {
        let amount = 0;
        let self = this;
        for (let i = 0; i < invoice.length; i++) {
            if (StellarBase.Keypair.isValidPublicKey(invoice[i].key) === false)
                throw new Error("Invalid public key in invoice list");
            amount += invoice[i].amount;
        }

        return self.MakeWithdrawalList(amount, asset)
            .then(withdrawal => {
                let paymentList = HDWallet._makePaymentList(invoice, withdrawal);
                console.log(paymentList[0].source);
                let keypair = HDKey.getKeyPair(paymentList[0].source),
                    server = new Server(self._serverURL);

                return server.loadAccount(keypair.accountId())
                    .then(account => {
                        let transaction = new StellarSdk.TransactionBuilder(account);
                        for (let i = 0; i < paymentList.length; i++) {
                            transaction.addOperation(StellarSdk.Operation.payment({
                                destination: paymentList[i].dest,
                                source: HDKey.getKeyPair(paymentList[i].source).accountId(),
                                asset: asset,
                                amount: paymentList[i].amount.toString()
                            }));
                        }
                        let txEnvelope = transaction.build();

                        for (let i = 0; i < withdrawal.length; i++) {
                            txEnvelope.sign(HDKey.getKeyPair(withdrawal[i].key));
                        }
                        return txEnvelope;
                    });
            });
    }

    static _makePaymentList(invoice, withdrawal){
        let opList = [],
            sentAmount = 0,
            receivedAmount = 0,
            sourceRest = 0,
            destRest = 0;

        for (let wI = 0, iI = 0, i = 0; wI < withdrawal.length;) {
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

            i++;
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
}