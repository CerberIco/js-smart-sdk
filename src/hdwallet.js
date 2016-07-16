import * as StellarBase from "stellar-base";
import {HDKey} from "stellar-base";

var decodeMnemo = HDKey.getSeedFromMnemonic,
    strDecode   = StellarBase.decodeCheck,
    strEncode   = StellarBase.encodeCheck,
    genMaster   = HDKey.fromMasterSeed;

const version = {
        accountId: {byte: 0x30, str: "accountId"},  // "G" in base32
        seed:      {byte: 0x90, str: "seed"},       // "S" in base32
        mpriv:     {byte: 0x60, str: "mpriv"},      // "M" in base32
        mpub:      {byte: 0x78, str: "mpub"},       // "P" in base32
        privWallet:{byte: 0xb0, str: "privWallet"}, // "W" in base32
        pubWallet: {byte: 0xc8, str: "pubWallet"}}, // "Z" in base32
    lookAhead = 4,
    branchAhead = 3,
    maxListLen = 50,
    maxIndex = 2147000000,
    accountBalanceLimit = 500;

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

    /**
     * Decode mnemonic and create HDWallet by seed
     * @param str {string} Mnemonic phrase for example:
     *       "fix forget despair friendship blue grip ..."
     * @returns {*}
     * @constructor
     */
    static SetByPhrase(str){
        return this.SetBySeed(decodeMnemo(str));
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
                let key = strDecode(version.mpub.str, str);
                return this.SetByMPublic(key);
            }
            case "S": {
                let key = strDecode(version.seed.str, str);
                return this.SetBySeed(key);
            }
            case "W": {
                let key = strDecode(version.privWallet.str, str);
                return this.deserialize(version.mpriv.byte, key);
            }
            case "Z": {
                let key = strDecode(version.pubWallet.str, str);
                return this.deserialize(version.mpub.byte, key);
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
    static SetBySeed(seed){
        let hdw = {};
        if (typeof seed == "string"){
            hdw.hd = genMaster(new Buffer(seed, "hex"), version.mpriv.byte);
            hdw.seed = new Buffer(seed, "hex");
        } else{
            hdw.hd = genMaster(seed, version.mpriv.byte);
            hdw.seed = seed;
        }
        hdw.ver = version.mpriv.byte;
        return this.setAllIndex(hdw);
    }

    /**
     * Create HDWallet from decoded MasterPublicKey{publicKey, chainCode}
     * @param rawKey {object} Buffer
     * @returns {HDWallet}
     * @constructor
     */
    static SetByMPublic(rawKey){
        let hdw = {};
        let mpub = new HDKey();
        mpub.versions  = version.mpub.byte;
        mpub.chainCode = rawKey.slice(0, 32);
        mpub.setPublicKey(rawKey.slice(32));
        hdw.ver = version.mpub.byte;
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
        if (ver == version.mpriv.byte)
            hdw.hd = hdw.hd = genMaster(hdw.seed, version.mpriv.byte);
        else if (ver == version.mpub.byte)
            hdw.hd.publicKey = wallet.slice(0, 32);

        hdw.hd.chainCode = wallet.slice(32, 64);
        hdw.firstWithMoney = wallet.readUInt32BE(64, 68);
        hdw.firstUnused = wallet.readUInt32BE(68, 72);
        listLen = wallet.readUInt32BE(72, 76);
        if ((listLen > maxListLen) || (listLen * 4 !== wallet.length))
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

        if (hdw.ver == version.mpriv.byte){
            path = "m/1/";
            hdw.indexList = [];
            hdw.indexList.push(0);
            this.updateBranchIndexes("M/2/", hdw.hd, hdw.indexList);
         } else if (hdw.ver == version.mpub.byte) {
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
        let stopIndex = branchAhead;
        for ( let i = 0; i < stopIndex; i++) {
            let indexPair = {f_w_m: indexList[i], f_u: indexList[i]};
            if (this.updateAddressIndexes(path + i, hd, indexPair) === false) {
                indexList.push(0);
                continue;
            }
            indexList.push(0);
            stopIndex = min(i + branchAhead, maxListLen);
            indexList[i] = indexPair.f_w_m;
        }

        indexList.splice(indexList.length - branchAhead + 1, branchAhead);
    }

    /**
     * Check branch for account with money.
     * @param branchPath {string}
     *  @param hd{HDKey}
     * @param indexPair{object} Pair of indexes {1stWithMoney, 1stUnused}.
     * @returns {boolean} If branch has no account return "true"
     */
    static updateAddressIndexes(branchPath, hd, indexPair){
        let currentIndex = min(indexPair.f_w_m, indexPair.f_u);
        if (indexPair.f_w_m < indexPair.f_u)
            currentIndex = indexPair.f_w_m;
        else
            currentIndex = indexPair.f_u;

        indexPair.f_w_m = 0;
        indexPair.f_u = 0;
        for ( let stopIndex = currentIndex + lookAhead; currentIndex < stopIndex; currentIndex++){
            let derivedKey = hd.derive(branchPath + currentIndex),
                accountID  = strEncode(version.accountId.str, derivedKey.publicKey),
                accountStatus = this.checkAccount(accountID);
            if (accountStatus.valid === false){
                continue;
            }
            stopIndex = min(currentIndex + lookAhead, maxIndex);
            if ((accountStatus.balance > 0) && indexPair.f_w_m === 0){
                indexPair.f_w_m = currentIndex;
                if (!indexPair.indexingF_u)
                    return true;
            }
            indexPair.f_u = currentIndex + 1;
        }
        return currentIndex > lookAhead;
    }

    /**
     * Check account status in ledger.
     * @param accountId {string} Base32-encoded PublicKey: GBDAF3F6LSTEJ5PSQONOQ76G...
     * @returns {{valid: boolean, hasBalance: boolean, balance: number}}
     */
    static checkAccount(accountId){
        let id = strDecode(version.accountId.str, accountId);
        let isValid = (id.readUInt8(0) & 7) === 0,
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
    serialize(){
        let ver,
            listLen = this.indexList.length,
            LEN = 76 + listLen * 4,
            buffer = new Buffer(LEN);
        if (this.verB == version.mpriv.byte) {
            this.seed.copy(buffer, 0);
            ver = version.privWallet.str;
        }
        else if (this.verB == version.mpub.byte) {
            this.hdkey.publicKey.copy(buffer, 0);
            ver = version.pubWallet.str;
        }
        this.hdkey.chainCode.copy(buffer, 32);
        buffer.writeUInt32BE(this.firstWithMoney, 64);
        buffer.writeUInt32BE(this.firstUnused, 68);
        buffer.writeUInt32BE(listLen, 72);
        for (let i = 0, j = 0; i < listLen; i++, j += 4) {
            buffer.writeUInt32BE(this.indexList[i], 72 + 4 + j);
        }
        return strEncode(ver, buffer);
    }

    /**
     * Makes a list from one branch to make a payment of a given amount.
     * @param list {object} Array of pair {privateKey, amount}.
     * @param path {string} Branch in which "search in deep" account with money.
     * @param sum {number} Amount.
     * @returns {boolean}
     */
    findMoneyInBranch(list, path, sum){
        let currentSum = 0,
            currentLookAhead = lookAhead;

        for (let i = 0, j = (list.length - 1); i < currentLookAhead; i++) {
            let derivedKey = this.hdkey.derive(path + i),
                accountID = strEncode(version.accountId.str, derivedKey.publicKey),
                accountStatus = HDWallet.checkAccount(accountID);

            if (accountStatus.hasBalance) {
                if (currentSum + accountStatus.balance < sum) {
                    currentSum += accountStatus.balance;
                    list[j].key = strEncode(version.seed.str, derivedKey.privateKey);
                    list[j].balance = accountStatus.balance;
                    list.push({key: "0", balance: 0});
                    currentLookAhead = min(i + lookAhead, maxIndex);
                    j++;
                }
                else if (currentSum + accountStatus.balance >= sum) {
                    let delta = sum - currentSum;
                    list[j].key = strEncode(version.seed.str, derivedKey.privateKey);
                    list[j].balance = delta;
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Makes a list from all branches to make a payment of a given amount.
     * @param sum {number} Amount.
     * @returns {*[]} Array of pair {accountID, amount}.
     */
    makeWithdrawalList(sum) {
        let path = ["m/1/", "m/2/"],
            list = [{key: "0", balance: 0}],
            currentBranchAhead = branchAhead,
            currentPath = path[0],
            isComplete  = this.findMoneyInBranch(list, currentPath, sum);
        if (isComplete) {
            return list;
        }
        for (let d = 0; d < currentBranchAhead; d++) {
            currentPath = path[1] + d + "/";
            isComplete = this.findMoneyInBranch(list, currentPath, sum);
            if (isComplete)
                break;
            else
                currentBranchAhead = min(d + currentBranchAhead, maxListLen);
        }
        return list;
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
            currentLookAhead = lookAhead;

        if (this.verB == version.mpriv.byte){
            path = "m/1/";
        } else if (this.verB == version.mpub.byte) {
            path = "M/";
        } else
            throw new Error("Version of HDWallet mismatch");

        for (let i = this.firstUnused, j = 0; i < (i + currentLookAhead); i++) {
            let derivedKey = this.hdkey.derive(path + i),
                accountID = strEncode(version.accountId.str, derivedKey.publicKey),
                accountStatus = HDWallet.checkAccount(accountID);
            if (!accountStatus.valid) {
                if (currentSum + accountBalanceLimit < sum) {
                    currentSum += accountBalanceLimit;
                    list[j].key = strEncode(version.accountId.str, derivedKey.publicKey);
                    list[j].balance = accountBalanceLimit;
                    list.push({key: "0", balance: 0});
                    currentLookAhead++;
                    j++;
                }
                else if (currentSum + accountBalanceLimit >= sum) {
                    let delta = sum - currentSum;
                    list[j].key = strEncode(version.accountId.str, derivedKey.publicKey);
                    list[j].balance = delta;
                    break;
                }
            }
        }

        return list;
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

        if (this.verB == version.mpriv.byte){
            path = "m/1/";
            this.indexList.push(0);
            HDWallet.updateBranchIndexes("M/2/", this.hdkey, this.indexList);
        } else if (this.verB == version.mpub.byte) {
            path = "M/";
        } else
            throw new Error("Version of HDWallet mismatch");
        HDWallet.updateAddressIndexes(path, this.hdkey, indexPair);
        this.firstWithMoney = indexPair.f_w_m;
        this.firstUnused = indexPair.f_u;
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
}

function min(a, b) {
    if (a < b)
        return a;
    else
        return b;
}