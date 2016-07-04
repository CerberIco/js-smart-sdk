import * as StellarBase from "stellar-base";
import {HDKey} from "stellar-base";
import {HDWallet} from "../../src/hdwallet";
console.log("Hell dogs");
var encodeMnemo = StellarBase.getMnemonicFromSeed,
    decodeMnemo = StellarBase.getSeedFromMnemonic,
    strDecode   = StellarBase.decodeCheck,
    strEncode   = StellarBase.encodeCheck,
    genMaster   = HDKey.fromMasterSeed;

var seed =
    [
    "SADDF3F6LSTEJ5PSQONOQ76G2AQB3LN3YQ73QZB3ZCO6MHUMBIMB3F6U",
    "SDHOAMBNLGCE2MV5ZKIVZAQD3VCLGP53P3OBSBI6UN5L5XZI5TKHFQL4",
    "SCVQWNPUXGDRW2IOOM6SS5NQB4KK3Z2MH7ZMM4O6CXKX5L3NRZ5E6V2J",
    'SCXXRH5QY6DAQOQNHMMF5PBKPB732US6QFNI7722VDRUCNJ5MNFDJJJL',
    'SAZS3RDL5QTPJSWARQ4MWLIKKXM446VKBBYXBXBUCXGKJCCH72TVUC6U',
    'SCJ7PY5AITP6NBXPEFSB52BH7JQYJ3GPAMXBMMT6ISY2VOSEXNNGVHHH',
    'SCCMVPLGK4NLKPGGMYD4ANCC4VXMXKD7RTA24EIJ2Y6NMCCP5WJQ2TXB'
    ];

var phrase = [],
    mpriv = [],
    mpub = [],
    hdwSeed = [],
    hdwPhrase = [],
    hdwMpriv = [],
    hdwMpub = [];


for (let i = 0; i < seed.length; i++){
    phrase[i] = encodeMnemo(strDecode('seed', seed[i]));
    mpriv[i] = StellarBase.getMasterPriv(phrase[i]);
    mpub[i] = StellarBase.getMasterPub(phrase[i]);
}

// console.log(phrase);
// console.log(mpriv);
// console.log(mpub);

// for (let i = 0; i < seed.length; i++){
        hdwSeed[0] = HDWallet.byStrKey(seed[0]);
        hdwPhrase[0] = HDWallet.byPhrase(phrase[0]);
        hdwMpriv[0] = HDWallet.byStrKey(mpriv[0]);
        hdwMpub[0] = HDWallet.byStrKey(mpub[0]);
// }
// console.log(hdwSeed[1]);
// console.log(hdwPhrase[3]);
// console.log(hdwMpriv[3]);
// console.log(hdwMpub[3]);
let str = hdwSeed[0].serialize();
// console.log("Invoice===================");
// console.log(hdwMpriv[0].makeInvoiceList(745));
// console.log("Withdraw===================");
// console.log(hdwMpriv[0].makeWithdrawList(5043));
console.log("State===================");
// console.log(hdwSeed[0]);
// console.log(str);
console.log(HDWallet.byStrKey(str));