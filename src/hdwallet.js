import * as StellarBase from "stellar-base";
import {HDKey} from "stellar-base";
import {Server} from "./server";


var encodeMnemo = StellarBase.getMnemonicFromSeed,
    decodeMnemo = StellarBase.getSeedFromMnemonic,
    strDecode   = StellarBase.decodeCheck,
    strEncode   = StellarBase.encodeCheck,
    genMaster   = HDKey.fromMasterSeed,
    server = new Server('http://127.0.0.1:8000');

const versionBytes = {
    accountId: 0x30,    // "G" in base32
    seed:      0x90,    // "S" in base32
    mpriv:     0x60,    // "M" in base32
    mpub:      0x78,    // "P" in base32
    privW:     0xb0,    // "W" in base32
    pubW:      0xc8 },  // "Z" in base32

    versionStr = {
        accountId:      "accountId",    // "G" in base32
        seed:           "seed",         // "S" in base32
        mpriv:          "mpriv",        // "M" in base32
        mpub:           "mpub",         // "P" in base32
        privWallet:     "privWallet",   // "W" in base32
        pubWallet:      "pubWallet" },  // "Z" in base32

    lookAhead = 20,
    branchAhead = 20,
    accountBalanceLimit = 500;

export class HDWallet{

    constructor(hdw){

        this.verB = hdw.ver;
        this.firstWithMoney = hdw.f_w_m;
        this.firstUnused = hdw.f_u;
        this.map = hdw.map;
        this.seed = hdw.seed;
        this.hdkey = hdw.hd;
    }

    static SetByStrKey(str){
        let verB, verStr, key;
        switch (str[0]) {
            case "P": {
                verStr = versionStr.mpub;
                verB   = versionBytes.mpub;
                key = strDecode(verStr, str);
                return this.initKey(verB, key);
            }
            case "S": {
                verStr = versionStr.seed;
                key = strDecode(verStr, str);
                return this.SetBySeed(key);
            }
            case "W": {
                verStr = versionStr.privWallet;
                verB   = versionBytes.mpriv;
                key = strDecode(verStr, str);
                return this.deserialize(verB, key);
            }
            case "Z": {
                verStr = versionStr.pubWallet;
                verB   = versionBytes.mpub;
                key = strDecode(verStr, str);
                return this.deserialize(verB, key);
            }
            default : {
                throw new Error ("Invalid version of StrKey");
            }
        }
    }

    static SetByPhrase(str){
        return this.SetBySeed(decodeMnemo(str));
    }

    static SetBySeed(seed){
        let hdw = {};
        if (typeof seed == "string"){
            hdw.hd = genMaster(new Buffer(seed, "hex"), versionBytes.mpriv);
            hdw.seed = new Buffer(seed, "hex");
        } else{
            hdw.hd = genMaster(seed, versionBytes.mpriv);
            hdw.seed = seed;
        }
        hdw.ver = versionBytes.mpriv;
        return this.setAllIndex(hdw);
    }

    static deserialize(ver, wallet){
        let hdw = {}, mapLen;
        hdw.ver = ver;
        hdw.hd = {};
        hdw.map = [];
        hdw.hd.versions = ver;
        hdw.seed = wallet.slice(0, 32);

        if (ver == versionBytes.mpriv)
            hdw.hd = hdw.hd = genMaster(hdw.seed, versionBytes.mpriv);
        else if (ver == versionBytes.mpub)
            hdw.hd.publicKey = wallet.slice(0, 32);

        hdw.hd.chainCode = wallet.slice(32, 64);
        hdw.f_w_m = wallet.readUInt32BE(64, 68);
        hdw.f_u = wallet.readUInt32BE(68, 72);
        mapLen = wallet.readUInt32BE(72, 76);

        for (let i = 0, j =0; i < mapLen; i++, j += 4) {
            hdw.map[i] = wallet.readUInt32BE(76 + j, 76 + 4 + j);
        }
        return new this(hdw);
    }

    static initKey(ver, rawKey){
        let hdw = {};
        let masterKP = new HDKey();
        masterKP.versions  = ver;
        masterKP.chainCode = rawKey.slice(0, 32);

        if (ver == versionBytes.mpriv)
            masterKP.setPrivateKey(rawKey.slice(32));
        else if (ver == versionBytes.mpub)
            masterKP.setPublicKey(rawKey.slice(32));
        else
            throw new Error('Version mismatch: does not match private or public');
        hdw.ver = ver;
        hdw.hd = masterKP;
        return this.setAllIndex(hdw);
    }

    static setAllIndex(hdw){

        let path,
            f_w_m  = uint32(0),
            f_u    = 0,
            currentLookAhead = lookAhead;
        if (hdw.ver == versionBytes.mpriv){
            path = "m/1/";
            hdw.map = this.getPublicMap(hdw.hd);
         } else if (hdw.ver == versionBytes.mpub) {
            path = "M/";
        } else
            throw new Error("Invalid ver");
        for (let i = 0; i < currentLookAhead; i++){
            let derivedKey = hdw.hd.derive(path + i),
                accountID  = strEncode(versionStr.accountId, derivedKey.publicKey),
                accountStatus = this.checkAccount(accountID);
            if (!accountStatus[0]){
                currentLookAhead++;
            } else if (accountStatus[1] && f_w_m === 0)
                    f_w_m = i;
            f_u = i + 1;
        }
        hdw.f_w_m = f_w_m;
        hdw.f_u = f_u;

        return new this(hdw);
    }

    static getPublicMap(hd) {
        let path = "M/2/",
            currentLookAhead = lookAhead,
            currentBranchAhead = branchAhead,
            map = [];
        for (let d = 0, j = 0; d < currentBranchAhead; d++){
            let jT = j;
            map[j] = 0;
            for (let i = 0; i < currentLookAhead; i++) {
                let derivedKey = hd.derive(path + d + "/" + i),
                    accountID = strEncode(versionStr.accountId, derivedKey.publicKey),
                    accountStatus = this.checkAccount(accountID);

                if (!accountStatus[0]) {
                    currentLookAhead++;
                } else if (accountStatus[1] && map[j] === 0){
                    map[j] = i;
                    j++;
                    break;
                }

            }

            if (j == jT)
                currentBranchAhead++;
        }
        return map;
    }


    static checkAccount(accountId){
        let id = strDecode(versionStr.accountId, accountId);
        let    a = (id.readUInt32BE(0) & 1) > 0,
            b = (id.readUInt32BE(0) & 2) > 0,
            c = id.readUInt32BE(0) ^ 5;
        return [a, a && b, c];
    }

    serialize(){
        let ver,
            mapLen = this.map.length,
            LEN = 76 + mapLen * 4,
            buffer = new Buffer(LEN);
        if (this.verB == versionBytes.mpriv) {
            this.seed.copy(buffer, 0);
            ver = versionStr.privWallet;
        }
        else if (this.verB == versionBytes.mpub) {
            this.hdkey.publicKey.copy(buffer, 0);
            ver = versionStr.pubWallet;
        }
        this.hdkey.chainCode.copy(buffer, 32);
        buffer.writeUInt32BE(this.firstWithMoney, 64);
        buffer.writeUInt32BE(this.firstUnused, 68);
        buffer.writeUInt32BE(mapLen, 72);
        for (let i = 0, j = 0; i < mapLen; i++, j += 4) {
            buffer.writeUInt32BE(this.map[i], 72 + 4 + j);
        }
        return strEncode(ver, buffer);
    }

    makeWithdrawalList(sum) {
        let path = ["m/1/", "m/2/"],
            list = [],
            pair = [],
            currentSum = 0,
            currentLookAhead = lookAhead,
            currentBranchAhead = branchAhead;

        pair[0] = 0;
        pair[1] = 0;
        for (let p = 0; p < 2; p++) {
            let currentPath = path[p];

            for (let d = 0, jd = 0; d < currentBranchAhead; d++) {
                let jT = jd;
                if (p == 1 )
                    currentPath = currentPath + d + "/";

                for (let i = 0, j = 0; i < currentLookAhead; i++) {
                    let derivedKey = this.hdkey.derive(currentPath + i),
                        accountID = strEncode(versionStr.accountId, derivedKey.publicKey),
                        accountStatus = HDWallet.checkAccount(accountID);
                    if (accountStatus[1]) {
                        if (currentSum + accountStatus[2] < sum) {
                            currentSum += accountStatus[2];
                            pair[0] = strEncode(versionStr.seed, derivedKey.privateKey);
                            pair[1] = accountStatus[2];
                            list[j] = pair.slice();
                            currentLookAhead++;
                            j++;
                            jd++;
                        } else if (currentSum + accountStatus[2] >= sum) {
                            let delta = sum - currentSum;
                            pair[0] = strEncode(versionStr.seed, derivedKey.privateKey);
                            pair[1] = delta;
                            list[j] = pair.slice();
                            return list;
                        }}}

                if (jd == jT)
                    currentBranchAhead++;
            }}

        return list;
    }

    makeInvoiceList(sum){
        let path,
            list = [],
            pair = [],
            currentSum = 0,
            currentLookAhead = lookAhead;

        pair[0] = 0;
        pair[1] = 0;

        if (this.verB == versionBytes.mpriv){
            path = "m/1/";
        } else if (this.verB == versionBytes.mpub) {
            path = "M/";
        }

        for (let i = this.firstUnused, j = 0; i < (i + currentLookAhead); i++) {
            let derivedKey = this.hdkey.derive(path + i),
                accountID = strEncode(versionStr.accountId, derivedKey.publicKey),
                accountStatus = HDWallet.checkAccount(accountID);
            if (!accountStatus[0]) {
                if (currentSum + accountBalanceLimit < sum) {
                    currentSum += accountBalanceLimit;
                    pair[0] = strEncode(versionStr.accountId, derivedKey.publicKey);
                    pair[1] = accountBalanceLimit;
                    list[j] = pair.slice();
                    currentLookAhead++;
                    j++;
                } else if (currentSum + accountBalanceLimit >= sum) {
                    let delta = sum - currentSum;
                    pair[0] = strEncode(versionStr.accountId, derivedKey.publicKey);
                    pair[1] = delta;
                    list[j] = pair.slice();
                    break;
                }
            }
        }

        return list;
    }
}