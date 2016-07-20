import * as StellarBase from "stellar-base";
import {HDKey} from "stellar-base";

// Docker
// let server = new StellarSdk.Server('http://127.0.0.1:8000');
//let server = new StellarSdk.Server('http://192.168.59.103:32773');
// let master = StellarSdk.Keypair.master();

var decodeMnemo = HDKey.getSeedFromMnemonic,
    strDecode   = StellarBase.decodeCheck,
    strEncode   = StellarBase.encodeCheck,
    genMaster   = HDKey.fromMasterSeed;

export class HDWallet{
    /**
     *
     * @param hdw
     */
    constructor(hdw){

        this.verB = hdw.ver;
        this.firstWithMoney = hdw.firstWithMoney;
        this.firstUnused = hdw.firstUnused;
        this.indexList = hdw.indexList;
        this.seed = hdw.seed;
        this.hdkey = hdw.hd;
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
        return 10;
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

    /**
     * Decode mnemonic and create HDWallet by seed
     * @param str {string} Mnemonic phrase for example:
     *       "fix forget despair friendship blue grip ..."
     * @returns {*}
     * @constructor
     */
    static SetByPhrase(str){
        return this.setBySeed(decodeMnemo(str));
    }

    /**
     * Check version of Base32 key, decode and setup HDWallet
     * @param str {string} Base32 key
     * @returns {*}
     * @constructor
     */
    static SetByStrKey(str){
        switch (str[0]) {
            case "P": {
                let key = strDecode(this._version().mpub.str, str);
                return this.setByMPublic(key);
            }
            case "S": {
                let key = strDecode(this._version().seed.str, str);
                return this.setBySeed(key);
            }
            case "W": {
                let key = strDecode(this._version().privWallet.str, str);
                return this.deserialize(this._version().mpriv.byte, key);
            }
            case "Z": {
                let key = strDecode(this._version().pubWallet.str, str);
                return this.deserialize(this._version().mpub.byte, key);
            }
            default : {
                throw new Error ("Invalid version of StrKey");
            }
        }
    }

    /**
    * Create HDWallet from Seed
    * @param seed {object} Buffer or hexString
    * @returns {HDWallet}
    * @constructor
    */
    static setBySeed(seed){
        let hdw = {};
        if (typeof seed == "string"){
            hdw.hd = genMaster(new Buffer(seed, "hex"), this._version().mpriv.byte);
            hdw.seed = new Buffer(seed, "hex");
        } else{
            hdw.hd = genMaster(seed, this._version().mpriv.byte);
            hdw.seed = seed;
        }
        hdw.ver = this._version().mpriv.byte;
        return this.setAllIndex(hdw);
    }

    /**
     * Create HDWallet from decoded MasterPublicKey {chainCode, publicKey}
     * @param rawKey {object} Buffer
     * @returns {HDWallet}
     * @constructor
     */
    static setByMPublic(rawKey){
        let hdw = {};
        let mpub = new HDKey();
        mpub.versions  = this._version().mpub.byte;
        mpub.chainCode = rawKey.slice(0, 32);
        mpub.setPublicKey(rawKey.slice(32, 64));
        hdw.ver = this._version().mpub.byte;
        hdw.hd = mpub;
        return this.setAllIndex(hdw);
    }

    /**
     * Deserialize HDWallet from serialized byteArray.
     * @param ver {number} version of HDWallet
     * @param wallet {object} ByteArray  
     * < Key[32]||Chain[32]||1stWithMoney[4]||1stUnused[4]||listLen[4]||list[4*listLen]>
     * @returns {HDWallet}
     */
    static deserialize(ver, wallet){
        let hdw = {}, listLen;
        hdw.ver = ver;
        hdw.hd = {};
        hdw.indexList = [];
        hdw.hd.versions = ver;
        hdw.seed = wallet.slice(0, 32);
        if (ver == this._version().mpriv.byte)
            hdw.hd = hdw.hd = genMaster(hdw.seed, this._version().mpriv.byte);
        else if (ver == this._version().mpub.byte)
            hdw.hd.publicKey = wallet.slice(0, 32);

        hdw.hd.chainCode = wallet.slice(32, 64);
        hdw.firstWithMoney = wallet.readUInt32BE(64, 68);
        hdw.firstUnused = wallet.readUInt32BE(68, 72);
        listLen = wallet.readUInt32BE(72, 76);
        if ((listLen > this._maxListLen()) || (listLen * 4 + 76 > wallet.length + 5))
            throw new Error("Invalid serialized wallet");
        for (let i = 0, j =0; i < listLen; i++, j += 4) {
            hdw.indexList[i] = wallet.readUInt32BE(76 + j, 76 + 4 + j);
        }
        return new this(hdw);
    }

    /**
     * Setup indexes for all branches and create HDWallet.
     * @param hdw {object} HDWallet without indexes.
     * @returns {HDWallet}
     */
    static setAllIndex(hdw){
        let path,
            indexPair = {f_w_m: 0, f_u:  0, indexingF_u: true};
        if (hdw.ver == this._version().mpriv.byte){
            path = "m/1/";
            hdw.indexList = [];
            hdw.indexList.push(0);
            this.updateBranchIndexes("M/2/", hdw.hd, hdw.indexList);
         } else if (hdw.ver == this._version().mpub.byte) {
            path = "M/";
        } else
            throw new Error("Invalid ver");
        this.updateAddressIndexes(path, hdw.hd, indexPair);
        hdw.firstWithMoney = indexPair.f_w_m;
        hdw.firstUnused = indexPair.f_u;
        return new this(hdw);
    }

    /**
     * Make list of pair {1stWithMoney, 1stUnused} for all branches.
     * @param path {string}  root of branches in which "searching in deep" account with money.
     * @param hd {HDKey}
     * @param indexList {object} Array of pair {1stWithMoney, 1stUnused}
     */
    static updateBranchIndexes(path, hd, indexList){
        let stopIndex = this._branchAhead();
        for ( let i = 0; i < stopIndex; i++) {
            let indexPair = {f_w_m: indexList[i], f_u: indexList[i]};
            if (this.updateAddressIndexes(path + i, hd, indexPair) === false) {
                indexList.push(0);
                continue;
            }
            indexList.push(0);
            stopIndex = this._min(i + this._branchAhead(), this._maxListLen());
            indexList[i] = indexPair.f_w_m;
        }
        indexList.splice(indexList.length - this._branchAhead + 1, this._branchAhead);
    }

    /**
     * Check branch for account with money.
     * @param branchPath {string}
     *  @param hd{HDKey}
     * @param indexPair{object} Pair of indexes {1stWithMoney, 1stUnused}.
     * @returns {boolean} If branch has no account return "true"
     */
    static updateAddressIndexes(branchPath, hd, indexPair){
        let currentIndex = this._min(indexPair.f_w_m, indexPair.f_u);
        if (indexPair.f_w_m < indexPair.f_u)
            currentIndex = indexPair.f_w_m;
        else
            currentIndex = indexPair.f_u;

        indexPair.f_w_m = 0;
        indexPair.f_u = 0;
        for ( let stopIndex = currentIndex + this._lookAhead(); currentIndex < stopIndex; currentIndex++){
            let derivedKey = hd.derive(branchPath + currentIndex),
                accountID  = strEncode(this._version().accountId.str, derivedKey.publicKey),
                accountStatus = this.checkAccount(accountID);
            if (accountStatus.valid === false){
                continue;
            }
            stopIndex = this._min(currentIndex + this._lookAhead(), this._maxIndex());
            if ((accountStatus.balance > 0) && indexPair.f_w_m === 0){
                indexPair.f_w_m = currentIndex;
                if (!indexPair.indexingF_u)
                    return true;
            }
            indexPair.f_u = currentIndex + 1;
        }
        return currentIndex > this._lookAhead();
    }

    /**
     * Check account status in ledger.
     * @param accountId {string} Base32-encoded PublicKey: GBDAF3F6LSTEJ5PSQONOQ76G...
     * @returns {{valid: boolean, hasBalance: boolean, balance: number}}
     */
    static checkAccount(accountId){
        let id = strDecode(this._version().accountId.str, accountId);
        let isValid = (id.readUInt8(0) & 31) === 0,
            hasBalance = (id.readUInt8(1) & 1) > 0,
            balance = 0;
            if (isValid && hasBalance)
                balance = id.readUInt8(0) ^ 5 + 8;
        return {valid: isValid, hasBalance: (isValid && hasBalance), balance: balance};
    }


    /**
     * Serialize HDWallet into Base32-encoded string.
     * < Key[32]||Chain[32]||1stWithMoney[4]||1stUnused[4]||listLen[4]||list[4*listLen]>
     * @returns {string} For example: WADDF3F6LSTEJ5PSQONOQ76G...
     */
    Serialize(){
        let ver,
            listLen = this.indexList.length,
            LEN = 76 + listLen * 4,
            buffer = new Buffer(LEN);
        if (this.verB == HDWallet._version().mpriv.byte) {
            this.seed.copy(buffer, 0);
            ver = HDWallet._version().privWallet.str;
        }
        else if (this.verB == HDWallet._version().mpub.byte) {
            this.hdkey.publicKey.copy(buffer, 0);
            ver = HDWallet._version().pubWallet.str;
        }
        this.hdkey.chainCode.copy(buffer, 32);
        buffer.writeUInt32BE(this.firstWithMoney, 64);
        buffer.writeUInt32BE(this.firstUnused, 68);
        buffer.writeUInt32BE(listLen, 72);
        for (let i = 0, j = 0; i < listLen; i++, j += 4) {
            buffer.writeUInt32BE(this.indexList[i], 72 + 4 + j);
        }
        return StellarBase.encodeWithoutPad(ver, buffer);
    }

    /**
     * Makes a list from all branches to make a payment of a given amount.
     * @param sum {number} Amount.
     * @returns {*[]} Array of pair {accountID, amount}.
     */
    makeWithdrawalList(sum) {
        let path = ["m/1/", "m/2/"],
            list = [{key: "0", balance: 0}],
            currentBranchAhead = HDWallet._branchAhead(),
            currentPath = path[0],
            result  = this.findMoneyInBranch(list, currentPath, sum);
        if (result === sum) {
            return list;
        }
        let rest = result;
        for (let d = 0; d < currentBranchAhead; d++) {
            currentPath = path[1] + d + "/";
            let res = this.findMoneyInBranch(list, currentPath, rest);
            if (res === rest)
                break;
            currentBranchAhead = HDWallet._min(d + currentBranchAhead, HDWallet._maxListLen());
            rest = res;
        }
        return list;
    }

    /**
     * Makes a list from one branch to make a payment of a given amount.
     * @param list {object} Array of pair {privateKey, amount}.
     * @param path {string} Branch in which "search in deep" account with money.
     * @param sum {number} Amount.
     * @returns {number} restSum
     */
    findMoneyInBranch(list, path, sum){
        let currentSum = 0,
            currentLookAhead = HDWallet._lookAhead();
        for (let i = 0, j = (list.length - 1); i < currentLookAhead; i++) {
            let derivedKey = this.hdkey.derive(path + i),
                accountID = strEncode(HDWallet._version().accountId.str, derivedKey.publicKey),
                accountStatus = HDWallet.checkAccount(accountID);
            if ( (accountStatus.hasBalance === true) && (accountStatus.balance !== 0) ) {
                if (currentSum + accountStatus.balance < sum) {
                    currentSum += accountStatus.balance;
                    list[j].key = strEncode(HDWallet._version().seed.str, derivedKey.privateKey);
                    list[j].balance = accountStatus.balance;
                    list.push({key: "0", balance: 0});
                    currentLookAhead = HDWallet._min(i + HDWallet._lookAhead(), HDWallet._maxIndex());
                    j++;
                }
                else if (currentSum + accountStatus.balance >= sum) {
                    let delta = sum - currentSum;
                    list[j].key = strEncode(HDWallet._version().seed.str, derivedKey.privateKey);
                    list[j].balance = delta;
                    return currentSum + delta;
                }
            }
            //TODO: Change increment, must use FirstUnusedIndex as max. Or not???
            currentLookAhead = HDWallet._min(i + HDWallet._lookAhead(), HDWallet._maxIndex());
        }
        return currentSum;
    }

    /**
     * Makes a list for getting amount.
     * @param sum {number} Amount.
     * @returns {*[]} Array of pair {accountID, amount}.
     */
    makeInvoiceList(sum){
        let path,
            list = [{key: "0", balance: 0}],
            currentSum = 0,
            currentLookAhead = HDWallet._lookAhead();

        if (this.verB == HDWallet._version().mpriv.byte){
            path = "m/1/";
        } else if (this.verB == HDWallet._version().mpub.byte) {
            path = "M/";
        } else
            throw new Error("Version of HDWallet mismatch");

        for (let i = this.firstUnused, j = 0; i < (i + currentLookAhead); i++) {
            let derivedKey = this.hdkey.derive(path + i),
                accountID = strEncode(HDWallet._version().accountId.str, derivedKey.publicKey),
                accountStatus = HDWallet.checkAccount(accountID);
            if (!accountStatus.valid) {
                if (currentSum + HDWallet._accountBalanceLimit() < sum) {
                    currentSum += HDWallet._accountBalanceLimit();
                    list[j].key = strEncode(HDWallet._version().accountId.str, derivedKey.publicKey);
                    list[j].balance = HDWallet._accountBalanceLimit();
                    list.push({key: "0", balance: 0});
                    currentLookAhead++;
                    j++;
                }
                else if (currentSum + HDWallet._accountBalanceLimit() >= sum) {
                    let delta = sum - currentSum;
                    list[j].key = strEncode(HDWallet._version().accountId.str, derivedKey.publicKey);
                    list[j].balance = delta;
                    break;
                }
            }
        }

        return list;
    }

    static _min(a, b) {
        if (a < b)
            return a;
        else
            return b;
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
    Refresh(){
        let path,
            indexPair = {
                f_w_m: this.firstWithMoney,
                f_u:  this.firstUnused,
                indexingF_u: true};

        if (this.verB == HDWallet._version().mpriv.byte){
            path = "m/1/";
            this.indexList.push(0);
            HDWallet.updateBranchIndexes("M/2/", this.hdkey, this.indexList);
        } else if (this.verB == HDWallet._version().mpub.byte) {
            path = "M/";
        } else
            throw new Error("Version of HDWallet mismatch");
        HDWallet.updateAddressIndexes(path, this.hdkey, indexPair);
        this.firstWithMoney = indexPair.f_w_m;
        this.firstUnused = indexPair.f_u;
    }

    GetMPublicNew(){
        return this.GetMPub(this.indexList.length + 1);
    }

    GetMPub(index){
        return this.getMPub("M/" + index);
    }

    getMPub(path){
        return this.hdkey.getMasterPub(path);
    }

    doPayment(mpub, amount){
        let withdrawal = this.makeWithdrawalList(amount),
            destHDW = HDWallet.SetByStrKey(mpub),
            invoice = destHDW.makeInvoiceList(amount);
       
        let txList = [],
            sentAmount = 0,
            receivedAmount = 0,
            sourceRest = 0,
            destRest = 0;

        for (let wI = 0, iI = 0, i = 0; wI < withdrawal.length;) {
            let toSend;
            if (sourceRest === 0)
                sourceRest = withdrawal[wI].balance;

            if (destRest === 0)
                toSend = sourceRest;
            else if (destRest > sourceRest)
                toSend = sourceRest;
            else if (destRest <= sourceRest)
                toSend = destRest;

            sentAmount += toSend;

            i++;
            txList.push({ dest: invoice[iI].key,
                        source: withdrawal[wI].key,
                        amount: toSend });

            destRest = invoice[iI].balance - (toSend + receivedAmount);
            receivedAmount += toSend;

            if (sentAmount == withdrawal[wI].balance) {
                sentAmount = 0;
                sourceRest = 0;
                wI++;
            } else
                sourceRest = withdrawal[wI].balance - sentAmount;

            if (receivedAmount == invoice[iI].balance) {
                receivedAmount = 0;
                destRest = 0;
                iI++;
            } else
                destRest = invoice[iI].balance - receivedAmount;
        }
        
        for (let i = 0; i < txList.length; i++) 
            HDWallet.createTx(txList[i]);
    }
    
    static createTx(txData) {
    let keypair = StellarSdk.Keypair.fromSeed(txData.source);
    let account = server.loadAccount(keypair.accountId());
    let transaction = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.payment({
            destination: txData.dest,
            asset: StellarSdk.Asset.native(),
            amount: txData.amount
        }))
        .build();
    transaction.sign(keypair);
    }
    
}