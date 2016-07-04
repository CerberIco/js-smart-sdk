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
        this.seed = hdw.seed;
        this.hdkey = hdw.hd;
        if (this.verB == versionBytes.mpriv)
            this.key = hdw.hd.privateKey;
        else if (this.verB == versionBytes.mpub)
            this.key = hdw.hd.publicKey;
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
                return this.bySeed(key);
            }
            case "W": {
                verStr = "privW";
                verB   = versionBytes.mpriv;
                key = strDecode(verStr, str);
                return this.deserialize(verB, key);
            }
            case "Z": {
                verStr = "pubW";
                verB   = versionBytes.mpub;
                key = strDecode(verStr, str);
                return this.deserialize(verB, key);
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

    static deserialize(v, w){
        let hdw = {}, mapLen;
        hdw.ver = v;
        hdw.hd = {};
        hdw.map = [];
        hdw.hd.versions = v;
        hdw.seed = w.slice(0, 32);
        if (v == versionBytes.mpriv)
            hdw.hd = hdw.hd = genMaster(hdw.seed, versionBytes.mpriv);
        else if (v == versionBytes.mpub)
            hdw.hd.publicKey = w.slice(0, 32);
        hdw.hd.chainCode = w.slice(32, 64);
        hdw.f_w_m = w.readUInt8(64, 68);
        hdw.f_u = w.readUInt8(68, 72);
        mapLen = w.readUInt8(72, 76);
        console.log("des: ", mapLen);
        for (let i = 0, j =0; i < mapLen * 4; i++, j += 4) {
            hdw.map[i] = w.readUInt32BE(76 + j, 76 + 4 + j);
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
            f_w_m  = 0,
            f_u    = 0,
            ahead = lookAhead;
        if (hdw.ver == versionBytes.mpriv){
            path = "m/1/";
            hdw.map = this.getPublicMap(hdw.hd);
         } else if (hdw.ver == versionBytes.mpub) {
            path = "M/";
        } else
            throw new Error("Invalid ver");
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

        return new this(hdw);
    }

    static getPublicMap(hd) {
        let path = "M/2/",
            ahead = lookAhead,
            deep = branchDeep,
            map = [];
        for (let d = 0, j = 0; d < deep; d++){
            let jT = j, pair = [];
            map[j] = 0;
            for (let i = 0; i < ahead; i++) {
                let derivedKey = hd.derive(path + d + "/" + i),
                    accountID = strEncode("accountId", derivedKey.publicKey),
                    accountStatus = this.checkAccount(accountID);

                if (!accountStatus[0]) {
                    ahead++;
                } else if (accountStatus[1] && map[j] === 0){
                    map[j] = i;
                    j++;
                    break;
                }

            }

            if (j == jT)
                deep++;
        }
        return map;
    }


    static checkAccount(accountId){
        let id = strDecode("accountId", accountId);
        let    a = (id.readInt8(0) & 1) > 0,
            b = (id.readInt8(0) & 2) > 0,
            c = id.readUInt8(0) ^ 5;
        return [a, a && b, c];
    }

    serialize(){
        let ver,
            mapLen = this.map.length,
            LEN = 80 + mapLen * 4,
            buffer = new Buffer(LEN);
        if (this.verB == versionBytes.mpriv) {
            this.seed.copy(buffer, 0);
            ver = "privW";
        }
        else if (this.verB == versionBytes.mpub) {
            this.hdkey.publicKey.copy(buffer, 0);
            ver = "pubW";
        }
        this.hdkey.chainCode.copy(buffer, 32);
        buffer.writeUInt8(this.firstWithMoney, 64);
        buffer.writeUInt8(this.firstUnused, 68);
        buffer.writeUInt8(mapLen, 72);
        //TODO: Need to fix map serialize/deserealize
        for (let i = 0, j = 0; i < mapLen; i++, j += 4) {
            buffer.writeUInt8(this.map[i], 72 + 4 + j);
        }
        return strEncode(ver, buffer);
    }

    makeWithdrawList(sum) {
        let path = "m/1/",
            list = [],
            pair = [],
            templSum = 0,
            lookAh = lookAhead;

        pair[0] = 0;
        pair[1] = 0;

        for (let i = 0, j = 0; i < lookAh; i++) {
            let derivedKey = this.hdkey.derive(path + i),
                accountID = strEncode("accountId", derivedKey.publicKey),
                accountStatus = HDWallet.checkAccount(accountID);
            if (accountStatus[1]) {
                if (templSum + accountStatus[2] < sum) {
                    templSum += accountStatus[2];
                    pair[0] = strEncode("seed", derivedKey.privateKey);
                    pair[1] = accountStatus[2];
                    list[j] = pair.slice();
                    lookAh++;
                    j++;
                } else if (templSum + accountStatus[2] >= sum) {
                    let d = sum - templSum;
                    pair[0] = strEncode("seed", derivedKey.privateKey);
                    pair[1] = d;
                    list[j] = pair.slice();
                    break;
                }
            }
        }

        return list;
    }

    makeInvoiceList(sum){
        let path,
            list = [],
            pair = [],
            templSum = 0,
            lookAh = lookAhead;

        pair[0] = 0;
        pair[1] = 0;

        if (this.verB == versionBytes.mpriv){
            path = "m/1/";
        } else if (this.verB == versionBytes.mpub) {
            path = "M/";
        }

        for (let i = this.firstUnused, j = 0; i < (i + lookAh); i++) {
            let derivedKey = this.hdkey.derive(path + i),
                accountID = strEncode("accountId", derivedKey.publicKey),
                accountStatus = HDWallet.checkAccount(accountID);
            if (!accountStatus[0]) {
                if (templSum + cashLimit < sum) {
                    templSum += cashLimit;
                    pair[0] = strEncode("accountId", derivedKey.publicKey);
                    pair[1] = cashLimit;
                    list[j] = pair.slice();
                    lookAh++;
                    j++;
                } else if (templSum + cashLimit >= sum) {
                    let d = sum - templSum;
                    pair[0] = strEncode("accountId", derivedKey.publicKey);
                    pair[1] = d;
                    list[j] = pair.slice();
                    break;
                }
            }
        }

        return list;
    }
}