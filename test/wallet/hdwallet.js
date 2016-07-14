import * as StellarBase from "stellar-base";
import {HDKey} from "stellar-base";
import {HDWallet} from "../../src/hdwallet";

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
        "SCXXRH5QY6DAQOQNHMMF5PBKPB732US6QFNI7722VDRUCNJ5MNFDJJJL",
        "SAZS3RDL5QTPJSWARQ4MWLIKKXM446VKBBYXBXBUCXGKJCCH72TVUC6U",
        "SCJ7PY5AITP6NBXPEFSB52BH7JQYJ3GPAMXBMMT6ISY2VOSEXNNGVHHH",
        "SCCMVPLGK4NLKPGGMYD4ANCC4VXMXKD7RTA24EIJ2Y6NMCCP5WJQ2TXB",
        "SAWD4RWLY6PTR5HGFN5J5EJGUMLCTCYMQN22V32PPARNSW4JWTYLV3KB",
        "SABNQ33XMQGD67P6XEIMZVRRPB5L3HIHQSSEXIMY6YTWPSBIVGCQPYU3",
        "SDGNP4H6JNOVD5E5PGCFAHTHWALJCA6DHSO7K4VAIE2WQM2CIVNNKKU3",
        "SDOLRGL7VGZ3AQ2XYCVKMIHNU5HQO7CBGCZXUQTS6ZHIU7DQBNHLMESL",
        "SBGZFREQBDVCWAHSC2GXBXKPSY32TGAHEOERS6GTKSIEFPXRJ26B3S4A",
        "SD3XFTWCDFIMB4PWJJ6J7MPG2BWQUH5A37PQIOVJZXAI2PEI7FGAFF5S",
        "SAP46T4ULMAJUFBCDIQ4LWLX2OX2H2ITXKX446O7BLBRMGOLMQOT6X54",
        "SBUVIIZRGQU2R22KMB7JAOFOFYVZ3WFZAFCPANA5PVJY2F7KKBJHXQX2",
        "SAQFVUYIV7YAN2DPNLZ6NQEX4BXZQCYK6LN24QS7YHZOL4NHCLANWAWR",
        "SCJHY7FJVDB5SXGBWPKLKOFS745WEJ3HDCHDQ2UKS4AHIYIJOYCEA4IC",
        "SD6JOUJ5RO2KYE6H4DS5KOU7FNH4IRUOZWMRYAD5IKQAH2XMLCASRUG7",
        "SBFXIHYFKN56FWE2HFRB6LFJ2T6G24WLC4TLODKJRHGSCLK74IBZNIP4",
        "SAKLNEUYQYS5QCQPTXZCGBV34KQUN2AR6L67PXBE5WUK4JTNWWLOHFRB",
        "SBH6MDX4PC5VMUFDNMSNLS2CA7WTUAGS5A5ZKTD4Q3UUONW2HEZQHPFS",
        "SDSYLXHUMRZZBGBYACRISAMDLWVU4COOLHMKZKUT7MXND6AAAF3UZ4OM"
    ];

function createWalletTest() {

    var phrase = [],
        mpriv = [],
        mpub = [],
        hdwSeed = [],
        hdwPhrase = [],
        hdwMpriv = [],
        hdwMpub = [];


    for (let i = 0; i < 7; i++) {
        phrase[i] = encodeMnemo(strDecode('seed', seed[i]));
        mpub[i] = StellarBase.getMasterPub(phrase[i]);
    }

    // console.log(phrase);
    // console.log(mpriv);
    // console.log(mpub);

    for (let i = 0; i < 7; i++) {
        hdwSeed[i] = HDWallet.SetByStrKey(seed[i]);
        hdwPhrase[i] = HDWallet.SetByPhrase(phrase[i]);
        hdwMpub[i] = HDWallet.SetByStrKey(mpub[i]);
    }
    let serWalletFSeed1 = hdwSeed[0].serialize(),
        tmpHdwSeed = HDWallet.SetByStrKey(serWalletFSeed1),
        serWalletFSeed2 = tmpHdwSeed.serialize(),

        serWalletFPhrase1 = hdwSeed[0].serialize(),
        tmpHdwPhrase = HDWallet.SetByStrKey(serWalletFPhrase1),
        serWalletFPhrase2 = tmpHdwPhrase.serialize(),

        serWalletFMpub1 = hdwSeed[0].serialize(),
        tmpHdwMpub = HDWallet.SetByStrKey(serWalletFMpub1),
        serWalletFMpub2 = tmpHdwMpub.serialize();

    // return;
    
    console.log("HDWallet from seed: ");
    console.log("Ver: ", hdwSeed[0].verB);
    console.log("1st with money: ", hdwSeed[0].firstWithMoney);
    console.log("1st Unused: ", hdwSeed[0].firstUnused);
    console.log("Maps", hdwSeed[0].map);
    console.log("PubKey: ", hdwSeed[0].hdkey.publicKey);
    console.log("ChainCode: ", hdwSeed[0].hdkey.chainCode);
    console.log("Wallet serialize 1: ", serWalletFSeed1);
    console.log("Wallet serialize 2: ", serWalletFSeed2);
    console.log("--------------------------------------------------------------");

    console.log("HDWallet from phrase: ");
    console.log("Ver: ", hdwPhrase[0].verB);
    console.log("1st with money: ", hdwPhrase[0].firstWithMoney);
    console.log("1st Unused: ", hdwPhrase[0].firstUnused);
    console.log("Maps", hdwPhrase[0].map);
    console.log("PubKey: ", hdwPhrase[0].hdkey.publicKey);
    console.log("ChainCode: ", hdwPhrase[0].hdkey.chainCode);
    console.log("Wallet serialize 1: ", serWalletFPhrase1);
    console.log("Wallet serialize 2: ", serWalletFPhrase2);
    console.log("--------------------------------------------------------------");

    console.log("HDWallet from mpub: ");
    console.log("Ver: ", hdwMpub[0].verB);
    console.log("1st with money: ", hdwMpub[0].firstWithMoney);
    console.log("1st Unused: ", hdwMpub[0].firstUnused);
    console.log("Maps", hdwMpub[0].map);
    console.log("PubKey: ", hdwMpub[0].hdkey.publicKey);
    console.log("ChainCode: ", hdwMpub[0].hdkey.chainCode);
    console.log("Wallet serialize 1: ", serWalletFMpub1);
    console.log("Wallet serialize 2: ", serWalletFMpub2);
    console.log("--------------------------------------------------------------");
    
    return;
    
    let hddd = HDWallet.SetByStrKey("WADDF3F6LSTEJ5PSQONOQ76G2AQB3LN3YQ73QZB3ZCO6MHUMBIMB2RXVKZSNKR56QBTKUMVUPT3XGSSR6HAU5MZVUMT3UYUT3E6KLMM7AAAAAAQAAAAC6AAAAAKAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAABAAAAAAIAAAAAAAAAAAAQAAAAAEAAAAACAAAAAAIAAAAAAAAAAAAQAAAAAIAAAAAAAAAAAAQAAAAACAAAAAAFEBA");

    console.log("HDWallet from tmpl: ");
    console.log("Ver: ", hddd.verB);
    console.log("1st with money: ", hddd.firstWithMoney);
    console.log("1st Unused: ", hddd.firstUnused);
    console.log("Maps", hddd.map);
    console.log("PubKey: ", hddd.hdkey.publicKey);
    console.log("ChainCode: ", hddd.hdkey.chainCode);
    // console.log("Wallet serialize 1: ", 	serWalletFMpub1);
    // console.log("Wallet serialize 2: ", 	serWalletFMpub2);
    console.log("--------------------------------------------------------------");
}

function checkAccount (accountId){
    let id = strDecode("seed", accountId);
    let    a = (id.readInt8(0) & 1) > 0,
        b = (id.readInt8(0) & 2) > 0,
        c = id.readUInt8(0) ^ 5;
    return [a, a && b, c];
}

function checkAccountTest() {
    for (let i = 0; i < 22; i++) {
        let accountStatus = checkAccount(seed[i]);
        console.log("Account status: ");
        console.log("Is Valid:    ", accountStatus[0]);
        console.log("Has Balance: ", accountStatus[1]);
        console.log("Balance:     ", accountStatus[2]);
        console.log("-------------------------------");
        
    }
}
// createWalletTest();
checkAccountTest();