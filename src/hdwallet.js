import * as StellarBase from "stellar-base";
import {HDKey} from "stellar-base";
import {Server} from "./server"; 


var encodeMnemo = StellarBase.getMnemonicFromSeed(),
    decodeMnemo = StellarBase.getSeedFromMnemonic(),
    strDecode   = StellarBase.decodeCheck(),
    strEncode   = StellarBase.encodeCheck(),
    genMaster   = HDKey.fromMasterSeed(),
    server = new Server('http://127.0.0.1:8000');

const versionBytes = {
    accountId: 0x30,
    seed:      0x90,
    mpriv:     0x60,
    mpub:      0x78  },
    lookAhead = 20;

export class HDWallet{

    constructor(key){

        this.verB = key.ver;
        this.firstWithMoney = key.f_w_m;
        this.firstUnused = key.f_u;
        this.path = {};
        this.otherChainCount = null;
        this.hdkey = key.hd;
    }

    static SetBy(str){
        if (str.length == 32)
            return this.bySeed(str);
        else if (str.length == 109)
            return this.byStrKey(str);
        else
            return this.byPhrase(str);
    }

    byPhrase(str){
        return this.bySeed(decodeMnemo(str));
    }

    bySeed(seed){
        let key = {};
        if (typeof seed == "string")
            key.hd = genMaster(new Buffer(seed, "hex"), verPriv);
        else
            throw new Error("Invalid type of seed");
        return this.setAllIndex(key);
    }
   
    byStrKey(str){
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
                verB   = versionBytes.seed;
                key = strDecode(verStr, str);
                return this.bySeed(key.toString("hex"))
            }
            default : {
                throw new Error ("Invalid version of StrKey");               
            }
        }
        
    }
   
    initKey(ver, rawKey){
        let key = {};
        let masterKP = new HDKey();
        masterKP.versions  = ver;
        masterKP.chainCode = rawKey.slice(0, 32);

        if (ver == versionBytes.mpriv)
            masterKP.setPrivateKey(rawKey.slice(32));
        else if (ver == versionBytes.mpub)
             masterKP.setPublicKey(rawKey.slice(32));
            else
            throw new Error('Version mismatch: does not match private or public');
        key.ver = ver;
        key.hd = masterKP;
        return this.setAllIndex(key);
    }

    setAllIndex(key){

        if (key.ver !== versionBytes.mpriv){
            throw new Error("Invalid ver");
        }
        let path   = "m/1/",
            f_w_m  = 0,
            f_u    = 0,
            lookAh = lookAhead;
        for (let i = 0; i < lookAh; i++){
            let derivedKey = key.hd.derive(path + i),
                accountID  = strEncode(versionBytes.accountId, derivedKey.publicKey),
                accountStatus = this.checkAccount(accountID);
            if (!accountStatus[0]){
                lookAh++;
                continue;
            } else if (accountStatus[1] && f_w_m == 0)
                    f_w_m = i;
            f_u = i + 1;
        }
        key.f_w_m = f_w_m;
        key.f_u = f_u;
        return new this(key);
    }
   
     checkAccount(accountId){
        let id = strEncode(versionBytes.accountId, accountId),
            a = (id.readUInt8(0) & 1) > 0,
            b = (id.readUInt8(0) & 2) > 0;
        return [a, a && b];
    }
}
