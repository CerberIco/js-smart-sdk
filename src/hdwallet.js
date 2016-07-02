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
    lookAhead = 20,
    branchDeep = 20,
    cashLimit = 500;

export class HDWallet{

    constructor(hdw){

        this.verB = hdw.ver;
        this.firstWithMoney = hdw.f_w_m;
        this.firstUnused = hdw.f_u;
        this.map = hdw.map;
        this.otherChainCount = hdw.otherChainCount;
        this.hdkey = hdw.hd;
        if (this.verB == versionBytes.mpriv)
            this.key = hdw.hd.privateKey;
        else if (this.verB == versionBytes.mpub)
            this.key = hdw.hd.publicKey;
    }

    static SetBy(str){
        // TODO: нужно ли оно? Если да исправить.
        if (str.length == 32)
            return this.bySeed(str);
        else if (str.length == 109)
            return this.byStrKey(str);
        else
            return this.byPhrase(str);
    }

    static byStrKey(str){
        let verB, verStr, key;
        switch (str[0]) {
            case "M": {
                verStr = "mpriv";
                verB   = versionBytes.mpriv;
                key = strDecode(verStr, str);
                return this.initKey(verB, key);
            }
            case "P": {
                verStr = "mpub";
                verB   = versionBytes.mpub;
                key = strDecode(verStr, str);
                return this.initKey(verB, key);
            }
            case "S": {
                verStr = "seed";
                key = strDecode(verStr, str);
                return this.bySeed(key.toString("hex"));
            }
            case "W": {
                verStr = "privW";
                verB   = versionBytes.mpriv;
                key = strDecode(verStr, str);
                return this.bySerWallet(verB, key);
            }
            case "Z": {
                verStr = "pubW";
                verB   = versionBytes.mpub;
                key = strDecode(verStr, str);
                return this.bySerWallet(verB, key);
            }
            default : {
                throw new Error ("Invalid version of StrKey");
            }
        }

    }

    static byPhrase(str){
        return this.bySeed(decodeMnemo(str));
    }

    static bySeed(seed){
        let hdw = {};
        if (typeof seed == "string")
            hdw.hd = genMaster(new Buffer(seed, "hex"), versionBytes.mpriv);
        else{
            hdw.hd = genMaster(seed, versionBytes.mpriv);
            // throw new Error("Invalid type of seed");
        }
        return this.setAllIndex(hdw);
    }

    static bySerWallet(v, w){
        let hdw = {}, mapLen;
        hdw.ver = v;
        hdw.hd = {};
        hdw.map = [];
        hdw.hd.versions = v;
        if (v == versionBytes.mpriv)
            key.hd.privateKey = w.slice(0, 32);
        else if (v == versionBytes.mpub)
            key.hd.publicKey = w.slice(0, 32);
        hdw.hd.chainCode = w.slice(32, 64);
        hdw.f_w_m = w.readUInt8(64);
        hdw.f_u = w.readUInt8(68);
        hdw.otherChainCount = w.readUInt8(72);
        mapLen = w.readUInt8(76);
        for (let i = 0, j =0; i < mapLen * 8; i++, j += 4) {
            hdw.map[i][0] = w.readUInt32BE(76 + j);
            hdw.map[i][1] = w.readUInt32BE(80 + j);
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

        // if (hdw.ver !== versionBytes.mpriv){
        //     throw new Error("Invalid ver");
        // }
        let path   = "m/1/",
            f_w_m  = 0,
            f_u    = 0,
            ahead = lookAhead;
        for (let i = 0; i < ahead; i++){
            let derivedKey = hdw.hd.derive(path + i),
                accountID  = strEncode("accountId", derivedKey.publicKey),
                accountStatus = this.checkAccount(accountID);
            if (!accountStatus[0]){
                ahead++;
            } else if (accountStatus[1] && f_w_m === 0)
                    f_w_m = i;
            f_u = i;
        }
        hdw.f_w_m = f_w_m;
        hdw.f_u = f_u;
        // hdw.map = this.getPublicMap(hdw.hd);
        return new this(hdw);
    }

    static getPublicMap(hd) {
        let path = "m/2/",
            ahead = lookAhead,
            deep = branchDeep,
            map = [];
        for (let d = 0, j = 0; d < deep; d++){
            let jT = j;
            for (let i = 0; i < ahead; i++) {
                let derivedKey = hd.derive(path + d + "/" + i),
                    accountID = strEncode("accountId", derivedKey.publicKey),
                    accountStatus = this.checkAccount(accountID),
                    pair = [2];
                if (!accountStatus[0]) {
                    ahead++;
                } else if (accountStatus[1] && map[j][1] === 0){
                    map[j][0] = d;
                    map[j][1] = i;
                    j++;
                }
            }
            if (j == jT)
                deep++;
        }
    }


    saveState(){
        let ver,
            mapLen = this.map.length,
            LEN = 81 + mapLen * 8,
            buffer = new Buffer(LEN);
        if (this.verB == versionBytes.mpriv) {
            this.hdkey.privateKey.copy(buffer, 0);
            ver = "privW";
        }
        else if (this.verB == versionBytes.mpub) {
            this.hdkey.publicKey.copy(buffer, 10);
            ver = "pubW";
        }
        this.hdkey.chainCode.copy(buffer, 32);
        buffer.writeUInt32BE(this.firstWithMoney, 64);
        buffer.writeUInt32BE(this.firstUnused, 68);
        buffer.writeUInt32BE(this.otherChainCount, 72);
        buffer.writeUInt32BE(mapLen, 76);
        for (let i = 0; i < mapLen; i++) {
            buffer.writeUInt32BE(this.map[i][0], 76 + 4);
            buffer.writeUInt32BE(this.map[i][1], 76 + 8);
        }
        return strEncode(ver, buffer.toString("hex"));
    }

    makeWithdrawList(sum) {
        let path = "m/1/",
            list = [],
            templSum = 0,
            lookAh = lookAhead;
        for (let i = 0, j = 0; i < lookAh; i++) {
            let derivedKey = this.hd.derive(path + i),
                accountID = strEncode("accountId", derivedKey.publicKey),
                accountStatus = this.checkAccount(accountID);
            if (accountStatus[1]) {
                if (templSum + account[2] < sum) {
                    templSum += account[2];
                    list[j][0] = derivedKey.privateKey;
                    list[j][1] = account[2];
                    lookAh++;
                    j++;
                } else if (templSum + account[2] >= sum) {
                    let d = sum - templSum;
                    list[j][0] = derivedKey.privateKey;
                    list[j][1] = d;
                    break;
                }
            }
        }
        return list;
    }

    makeInvoiceList(sum){
        let path = "M/",
            list = [],
            templSum = 0,
            lookAh = lookAhead;
        for (let i = this.f_u, j = 0; i < lookAh; i++) {
            let derivedKey = this.hd.derive(path + i),
                accountID = strEncode("accountId", derivedKey.publicKey),
                accountStatus = this.checkAccount(accountID);
            if (!accountStatus[0]) {
                if (templSum + cashLimit < sum) {
                    templSum += cashLimit;
                    list[j][0] = derivedKey.publicKey;
                    list[j][1] = cashLimit;
                    lookAh++;
                    j++;
                } else if (templSum + cashLimit >= sum) {
                    let d = sum - templSum;
                    list[j][0] = derivedKey.publicKey;
                    list[j][1] = d;
                    break;
                }
            }
        }
        return list;
    }

    static checkAccount(accountId){
        let id = strDecode("accountId", accountId);
        let    a = (id.readInt8(0) & 1) > 0,
            b = (id.readInt8(0) & 2) > 0,
            c = id.readInt8(0) ^ 5;
        return [a, a && b, c];
    }
}
