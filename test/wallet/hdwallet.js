import * as StellarBase from "stellar-base";
import {HDKey} from "stellar-base";
import {HDWallet} from "../../src/hdwallet";

var encodeMnemo = HDKey.getMnemonicFromSeed,
    decodeMnemo = HDKey.getSeedFromMnemonic,
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
        
        mpub = [],
        hdwSeed = [],
        hdwPhrase = [];


    for (let i = 0; i < 2; i++) {
        phrase[i] = encodeMnemo(strDecode('seed', seed[i]));
    }

    // console.log(phrase);
    // console.log(mpriv);
    // console.log(mpub);

    for (let i = 0; i < 2; i++) {
        hdwSeed[i] = HDWallet.SetByStrKey(seed[i]);
        hdwPhrase[i] = HDWallet.SetByPhrase(phrase[i]);
    }
    let serWalletFSeed1 = hdwSeed[0].Serialize(),
        tmpHdwSeed = HDWallet.SetByStrKey(serWalletFSeed1),
        serWalletFSeed2 = tmpHdwSeed.Serialize(),

        serWalletFPhrase1 = hdwSeed[0].Serialize(),
        tmpHdwPhrase = HDWallet.SetByStrKey(serWalletFPhrase1),
        serWalletFPhrase2 = tmpHdwPhrase.Serialize();

    // return;
    
    console.log("HDWallet from seed: ");
    console.log("Ver: ", hdwSeed[1].verB);
    console.log("1st with money: ", hdwSeed[1].firstWithMoney);
    console.log("1st Unused: ", hdwSeed[1].firstUnused);
    console.log("Maps", hdwSeed[1].indexList);
    console.log("PubKey: ", hdwSeed[1].hdkey.publicKey);
    console.log("ChainCode: ", hdwSeed[1].hdkey.chainCode);
    console.log("Wallet serialize 1: ", serWalletFSeed1);
    console.log("Wallet serialize 2: ", serWalletFSeed2);
    console.log("--------------------------------------------------------------");

    console.log("HDWallet from phrase: ");
    console.log("Ver: ", hdwPhrase[1].verB);
    console.log("1st with money: ", hdwPhrase[1].firstWithMoney);
    console.log("1st Unused: ", hdwPhrase[1].firstUnused);
    console.log("Maps", hdwPhrase[1].indexList);
    console.log("PubKey: ", hdwPhrase[1].hdkey.publicKey);
    console.log("ChainCode: ", hdwPhrase[1].hdkey.chainCode);
    console.log("Wallet serialize 1: ", serWalletFPhrase1);
    console.log("Wallet serialize 2: ", serWalletFPhrase2);
    console.log("--------------------------------------------------------------");
}
function errorTest() {
    let hdw, wrongData = [
        "fix forget despair friendship blue grip glance win blood pie volume odd remove house talent idea stranger sleep respect company mock clearly veil learn",
        "fix  forget  despair  friendship  blue  grip  glance   win  blood  pie  volume  odd  remove  house  talent  idea  stranger  sleep  respect  company  mock  clearly  veil  learn  ",//0
        "fixel forget despair friendship blue grip glance win blood pie volume odd remove house talent idea stranger sleep respect company mock clearly veil learn ",//1
        "fixforgetdespair friendship blue grip glance win blood pie volume odd remove house talentideastrangersleeprespectcompanymockclearlyveillearn",//2
        "fix forget despair friendship blue grip  company mock clearly veil learn",//3
        "fix forget despair friendship blue grip glance win blood pie volume odd remove house talent idea stranger sleep respect company mock clearly veil",//4
        "fix forget despair friendship blue grip glance win blood pie volume odd remove house talent idea stranger sleep respect company mock clearly veil learn learn",//5
        "fix forget despair friendship blue grip glance win blood pie volume odd remove house talent idea stranger sleep respect company mock clearly veil company mock clearly veil"//6
    ];
    for (let i = 0; i < wrongData.length; i++)
    {
        try {
            hdw = HDWallet.SetByPhrase(wrongData[i]);
            // console.log("Ver: ",            hdw.verB);
            // console.log("1st with money: ", hdw.firstWithMoney);
            // console.log("1st Unused: ",     hdw.firstUnused);
            // console.log("Maps",             hdw.map);
            // console.log("PubKey: ",         hdw.hdkey.publicKey);
            // console.log("ChainCode: ",      hdw.hdkey.chainCode);
            console.log("--------------------------------------------------------------");
        }
        catch (err){
            console.log("ERROR with WRONGDATA [", i, "]---------------------------------");
            console.log(err.message)
        }
    }
}

function serializeTest(){
    let nacl = require("../../node_modules/stellar-base/src/util/nacl_util"),
        t = [], s1 = [], s2 = [];
        t[0] = Buffer(nacl.randomBytes(32));
        t[1] = Buffer(nacl.randomBytes(100));
        t[2] = Buffer(nacl.randomBytes(42));
    for (let i = 0; i < 3; i++){
        let hdw1, hdw2;
        s1[i] = strEncode("privWallet", t[i]);
        s2[i] = strEncode("pubWallet", t[i]);
        try {
            hdw1 = HDWallet.SetByStrKey(s1[i]);
        }
        catch (err){
            console.log(err.message);
        }
        console.log("====================================");
        try {
            hdw2 = HDWallet.SetByStrKey(s2[i]);
            console.log(hdw2);    
        }
        catch (err){
            console.log(err.message);
        }
    }
}

function txAlgorithmTest() {
    let hdw = HDWallet.SetByStrKey("SAP46T4ULMAJUFBCDIQ4LWLX2OX2H2ITXKX446O7BLBRMGOLMQOT6X54"),
        mpub = hdw.GetMPublicNew(),
        destHDW = HDWallet.SetByStrKey(mpub);
    
    let withdrawal = hdw.makeWithdrawalList(2469),
        invoice = destHDW.makeInvoiceList(2469),
        masterKeypair = StellarBase.Keypair.fromSeed(withdrawal[0].key),
        rootAccount = masterKeypair.accountId();
   
    let transaction = [{dest:"0", source: "0", amount: 0}];

    console.log("Withdrawal List: ");
    console.log(withdrawal);
    console.log("-----------------------------------------");
    console.log("Invoice List: ");
    console.log(invoice);
    console.log("-----------------------------------------");

    let sentAmount = 0,
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
        transaction.push({ dest:   invoice[iI].key,
            source: withdrawal[wI].key,
            amount: toSend });
        
        destRest = invoice[iI].balance - (toSend + receivedAmount);
        receivedAmount += toSend;
        
        if (sentAmount == withdrawal[wI].balance) {
            console.log("wI = ", wI );
            sentAmount = 0;
            sourceRest = 0;
            wI++;
        } else
            sourceRest = withdrawal[wI].balance - sentAmount;

        if (receivedAmount == invoice[iI].balance) {
            receivedAmount = 0;
            destRest = 0;
            console.log("iI = ", iI);
            iI++;
        } else
            destRest = invoice[iI].balance - receivedAmount;

    }
    console.log("TX List: ");
    console.log(transaction);
}

function createWallet() {
    StellarSdk.Network.use(new StellarSdk.Network("Smart Money Dev ; March 2016"));
    let server = new StellarSdk.Server('http://dev.stellar.attic.pw:8010');
    let testList = [
            "GDDP7EL6EOTER4E4CVCT4IHKQKVHC5PPE7OONTGS5TLCGIFPYAOCDMO3",
            "GAWIB7ETYGSWULO4VB7D6S42YLPGIC7TY7Y2SSJKVOTMQXV5TILYWBUA",
            "GANMTUHZGIZMC4BWAPL22WFFVUCEPS6BGDGUE6GGTTMKH24UR5AUTJSZ"
        ],
        rootMnemonic = "belief mere bone careful small chair awake meant wrap mutter " +
            "goose belly men perhaps waste carefully sadness taste rant grab thread garden bliss misery",
        rootSeed = StellarBase.HDKey.getSeedFromMnemonic(rootMnemonic),
        hdwRoot = StellarSdk.HDWallet.setBySeed(rootSeed),
        bankPublicKey = "GAWIB7ETYGSWULO4VB7D6S42YLPGIC7TY7Y2SSJKVOTMQXV5TILYWBUA";
    console.log("hdwRoot - ", hdwRoot);
    console.log("======================================");
    let mpubRoot = hdwRoot.hdkey.getMasterPub("M/1"),
        pubWalletRoot = StellarSdk.HDWallet.SetByStrKey(mpubRoot);
    console.log("hdwRoot - ", pubWalletRoot);
    console.log("======================================");
    let mpub0 = hdwRoot.hdkey.getMasterPub("M/2/0"),
        pubWallet0 = StellarSdk.HDWallet.SetByStrKey(mpub0);
    console.log("hdw0 - ", pubWallet0);
    console.log("======================================");
}

createWallet();
// createWalletTest();
// txAlgorithmTest();
