import * as StellarBase from "stellar-base";
StellarSdk.Network.use(new StellarSdk.Network("Smart Money Dev ; March 2016"));

let server = new StellarSdk.Server('http://dev.stellar.attic.pw:8010');
let seed = [
        "SADDF3F6LSTEJ5PSQONOQ76G2AQB3LN3YQ73QZB3ZCO6MHUMBIMB3F6U",

        "SDHOAMBNLGCE2MV5ZKIVZAQD3VCLGP53P3OBSBI6UN5L5XZI5TKHFQL4",//Bob

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
        "SDSYLXHUMRZZBGBYACRISAMDLWVU4COOLHMKZKUT7MXND6AAAF3UZ4OM" ],
    accountWithMoney = {
        seed:       "SDRHAQQNAK7HPMP24254PTAVSLWNH7M345A5KESPQYKVT5JBBWCQ6E7H",
        accountId:  "GDDP7EL6EOTER4E4CVCT4IHKQKVHC5PPE7OONTGS5TLCGIFPYAOCDMO3" },

    bankPublicKey = "GAWIB7ETYGSWULO4VB7D6S42YLPGIC7TY7Y2SSJKVOTMQXV5TILYWBUA",
    asset = new StellarSdk.Asset('EUAH', bankPublicKey),
    url = "http://dev.stellar.attic.pw:8010",

    rootMnemonic = "belief mere bone careful small chair awake meant wrap mutter " +
        "goose belly men perhaps waste carefully sadness taste rant grab thread garden bliss misery",
    rootSeed = StellarBase.HDKey.getSeedFromMnemonic(rootMnemonic); //Alice


describe("Workflow Test. ", function () {

    beforeEach(function (done) {

        console.log('Before called');
        done();
    });
    
    // it("Create empty Wallet. ", function (done) {
    //     this.timeout(300000);
    //     StellarSdk.HDWallet
    //         .setByStrKey(seed[0], url)
    //         .then(hdw => {
    //
    //             done()
    //         })
    //         .catch(err => {
    //             console.log(err);
    //             done(err)
    //         });
    // });
    //
    // it("Create not-empty Wallet. ", function (done) {
    //     this.timeout(300000);
    //     StellarSdk.HDWallet
    //         .setByRawSeed(rootSeed, url)
    //         .then(hdw => {
    //
    //             done()
    //         })
    //         .catch(err => {
    //             console.log(err);
    //             done(err)
    //         });
    // });
    //
    // it("Get balance. ", function (done) {
    //     this.timeout(300000);
    //     StellarSdk.HDWallet
    //         .setByRawSeed(rootSeed, url)
    //         .then(hdw => {
    //             return hdw.getBalance(asset)
    //         })
    //         .then(balance => {
    //             console.log("Balance", balance);
    //             done()
    //         })
    //         .catch(err => {
    //             console.log(err);
    //             done(err)
    //         });
    // });
    //
    // it("Refresh/TotalRefresh. ", function (done) {
    //     this.timeout(300000);
    //     StellarSdk.HDWalle
    //         .setByRawSeed(rootSeed, url)
    //         .then(hdw => {
    //             return hdw.refresh()
    //         })
    //         .then(hdw => {
    //             return hdw.totalRefresh()
    //         })
    //         .then(hdw => {
    //             // console.log("Balance", balance);
    //             done()
    //         })
    //         .catch(err => {
    //             console.log(err);
    //             done(err)
    //         });
    // });
    
    // it("Payment from `account with money`. ", function (done) {
    //     this.timeout(300000);
    //
    //     StellarSdk.HDWallet.setByRawSeed(rootSeed, url)
    //         .then(hdw => {
    //             console.log("Index pair: ", hdw.firstWithMoney, " | ", hdw.firstUnused);
    //             console.log("Index list: ", hdw.indexList);
    //             console.log(" ");
    //
    //             let mpub = hdw.hdk.getMasterPub("M/2/10");
    //
    //             console.log("mpub: ", mpub);
    //             console.log("self : ", hdw.getMPub("M/2/10"));
    //             console.log("new : ", hdw.getMPublicNew());
    //             console.log(" ");
    //             return hdw;
    //             // return StellarSdk.HDWallet.setByStrKey(mpub, url);
    //         })
    //         .then(hdwFromMpub => {
    //             let accountList = [];
    //
    //             for (let i = 0; i < 3; i++) {
    //                 let index = i + 19;
    //                 let derivedKey = hdwFromMpub.hdk.derive("M/" + index);
    //                 accountList[i] = StellarBase.encodeCheck("accountId", derivedKey.publicKey);
    //             }
    //             console.log(accountList);
    //
    //             let keypair = StellarSdk.Keypair.fromSeed(accountWithMoney.seed);
    //             return server.loadAccount(keypair.accountId())
    //                 .then(source => {
    //                     let transaction = new StellarSdk.TransactionBuilder(source);
    //                     for (let i = 0; i < accountList.length; i++) {
    //                         transaction.addOperation(StellarSdk.Operation.payment({
    //                             destination: accountList[i],
    //                             source: keypair.accountId(),
    //                             asset: new StellarSdk.Asset('EUAH', bankPublicKey),
    //                             amount: "500"
    //                         }));
    //                     }
    //                     let txEnvelope = transaction.build();
    //
    //                     txEnvelope.sign(keypair);
    //
    //                     // return server.submitTransaction(txEnvelope);
    //                     return txEnvelope;
    //                 })
    //                 .catch(err => {
    //                     return err;
    //                 });
    //         })
    //         .then(result => {
    //             console.log("Result success = ", result);
    //             done()
    //         })
    //         .catch(err => {
    //             console.log("Result success", err);
    //             done(err)
    //         });
    // });
    
    // it("Create Tx from wallet. ", function (done) {
    //     this.timeout(300000);
    //     StellarSdk.HDWallet.setByStrKey(seed[1], 'http://dev.stellar.attic.pw:8010')
    //         .then(bob => {
    //             console.log("Index pair: ", bob.firstWithMoney, " | ", bob.firstUnused);
    //             console.log("Index list: ", bob.indexList);
    //             console.log(" ");
    //             bob.makeInvoiceList(1740)
    //                 .then(list => {
    //                     console.log("Invoice - ", list);
    //                     console.log(" ");
    //                     return StellarSdk.HDWallet.setByRawSeed(rootSeed, 'http://dev.stellar.attic.pw:8010')
    //                         .then(alice => {
    //                             return alice.createTx(list, asset);        
    //                         });
    //                 })
    //                 // .then(txEnvelope => {
    //                 //     console.log(txEnvelope);
    //                 //     return server.submitTransaction(txEnvelope);
    //                 // })
    //                 .then(result => {
    //                     console.log("Result success = ", result);
    //                     done()
    //                 })
    //                 .catch(err => {
    //                     console.log("Result false = ", err);
    //                     done(err)
    //                 });
    //         });
    //
    // });
    let bobSeed = seed[2]; //strKey
    let aliceSeed = rootSeed; //rawSeed
    let bigInvoice =  [ 
        { key: 'GBDQCLMSX4D2SHNS7QEK4CMNQEYWF33LY4KLPS7VFOY6KQTLAQ3XIVOY',
        amount: 500 },
        { key: 'GAHAIJ5TZFPXXKK4TRYQU5HXYLTNOM44RILYPUZEY2PXLO5HHQOZ2253',
            amount: 500 },
        { key: 'GC26OB5L3ZSBJJMHTPZA5BSDWOOM7DHKXU4DQ54ZT2TQ3BBGDHTYH6TA',
            amount: 500 },
        { key: 'GBQIR5ZFGFQGITQYLOLCY3UZSQ7G4NWNYGE6UKT3B6EHNKP6N6J5MWW6',
            amount: 500 },
        { key: 'GC3IVDWGUH7J732W4KMALQMC46OLM7CMJJUHEXA5RZCMT7TCKDSK2G57',
            amount: 500 },
        { key: 'GAKMCYFM2DBWRA4WJ6DNC5R4IFEZGLWUELUCTJIT5H2LNKVVUIMFTGIH',
            amount: 500 },
        { key: 'GCMAPWGBUUNOGXH7OZKNUXQ4O6TJFW2D6N2XJ5HAQ25M6KOEI3U6LIF5',
            amount: 500 },
        { key: 'GCY24RFUAPD7MT6BN52FLO4SZKVDNHPUYYZRTB72U6HNSLJR5IFGWLZI',
            amount: 500 },
        { key: 'GALO4HP2KHTHYVDOP2N4NJAB5NQOA2MRYKJAW6SGLJF3GG2T5IG73S7F',
            amount: 500 },
        { key: 'GB2POSRXOTMXGXC2OCTEFXFUQQS44SKC7XEBJXBKHDV3MFVRTH6XVWKN',
            amount: 500 },
        { key: 'GAX5LVOWG6VYVFAE6JPMPC3EIENJLPC6BH4VSOWIFZ5D5PLHFNAR2SOW',
            amount: 500 },
        { key: 'GDPMGR6RJPFCBH56AEPSKRCQHGAMWLDMOVDQMKATWZIU4TVS4XVQB2D3',
            amount: 500 },
        { key: 'GC7DULHMJ2BNKDYRUWGSYGRC256AOK2MTT25BKI2BQMCUWUSWUTEOWD2',
            amount: 500 },
        { key: 'GB2ILANJSKJYDPCDAVGKMKRKQ5QEJJ3OY54GYOOJLJPVEAUXRHOIRI7G',
            amount: 500 },
        { key: 'GD2HCFVP77ZKEHJJOHVPXFGWH6IRIDFF37RGKXCHY7L7VP2NW4RSIP5A',
            amount: 500 },
        { key: 'GBXSK5FP65KTFRSEWOPGFBHVDQ35FHWEF5JDOWNASCEHOHVLAKGV36CG',
            amount: 500 },
        { key: 'GBIAKG4VT2SKSO3ABUPIJ7CIAEGSITRHRY425IXBD6QYBOWFWHMXS7EJ',
            amount: 500 },
        { key: 'GACTX3YS4ORMUBIHUVEYDBND6GSS7MCMUAFXZF3MMBVNMIE56YMC6SW4',
            amount: 500 },
        { key: 'GCLQ5CTYRDXAWB3JSRRM2AV6EPIDE5DJ2JKJKC2SSYS74BATAM5MQRPG',
            amount: 500 },
        { key: 'GCNJ4OVBSQYGKV7OJF3NUN4DEUBYFDT76V6AXOMCZY3LOEW7R2GS2MQN',
            amount: 500 },
        { key: 'GBWMQPHYFJIXDQHY3EJO6VNA75RKGWWMAYBQAO77IO4CMED675PAMDUL',
            amount: 500 },
        { key: 'GA3XCRTBLBNUASVCLDZV64IIRJQ4ILTAQDO4N7D2PNVTP7TGHR6WIP5E',
            amount: 500 },
        { key: 'GD5GZC5P4WT62XE6FFUVB2SSLJ54JDHH5RYYKEKVORG37DBHG77KU7OS',
            amount: 500 },
        { key: 'GB5VZ2GZSB7EAUIMOLVFN3PHOOPIWSQMIZ2ZQVOFYNEUDTPQERUBLGXC',
            amount: 500 },
        { key: 'GBZVRMCHHOXKDOHI2P7QRDXQYUL72MBAV54VRJ6ULVTID2XZUNZU2ZYE',
            amount: 500 },
        { key: 'GCDRKVA64EFCA7PCZT3GYYH37LOX4NTEYEELTCUWDOCORSNUHEUIPZCM',
            amount: 500 },
        { key: 'GAONHQNZHYCUGOKEBMRWGGWV2PPBQP5VHVQ33CIRFVAXMV56UUZGGPG5',
            amount: 500 },
        { key: 'GDIB2FO7QCCSRGXUHL6U7HZVTI7LE6SZRU2RBDMNZ3MUZLFKJDTV5R7E',
            amount: 500 },
        { key: 'GDVLGRFQGHTOCR4SQSRA5AEDNXSUIIACKAFT6FYHIV5EPYJH67JIDFKA',
            amount: 500 },
        { key: 'GCR7677GZISTYBN53Z5KEY2U5TQTGBBUYWNCZPQUPW6SIMQ4AKQ2WUP2',
            amount: 500 },
        { key: 'GDBMIGXDRTBEMP4VW6XGMOF2FDKWD52EZD4S3ZTNLOMBH74MOBJ7Y2JA',
            amount: 500 },
        { key: 'GA7S3NOLYYQPDGXNEIYVF73JLUHDT7MDQALGQZ7TWVWYXP7NKMPKLMH2',
            amount: 500 },
        { key: 'GDPTWCGNDFRSBA7QG2GMVHXEWV5XFY2PFEHJF5GLB5M4CABHY6CZSUPR',
            amount: 500 },
        { key: 'GCVWCLMETZ536PBWFAT36RBJY62KTFYVHQ3VIXWUJ5J46TX2WYMAORLM',
            amount: 500 },
        { key: 'GB7Z7CFHHRNNK7HMMVAW2OD43454TWPWQJT2ZQKLABUHA6D57GXM5HAZ',
            amount: 500 },
        { key: 'GDWWJI634RDYHBP5ZOAVQWJXMARGIQ7NRPDIQ5SUNSVRUO7LEXLX5OGO',
            amount: 500 },
        { key: 'GDAWH7JWISUKG7Y5IZSTG55OIYMSLAW6QJU7UYDXY3I7UG2HRJZFSGMR',
            amount: 500 },
        { key: 'GC6SLDAK6GK7CVU7RTDOK5OX32IXJDNVXWMG2ATVTA7KD6FS2JSW4QIJ',
            amount: 500 },
        { key: 'GBYK25HWK357MEDXDFMTIANVWGQGUK5SEU3RVX3EGKU5SJNR4POR6X5P',
            amount: 500 },
        { key: 'GCMO7INNRDM3FKB4LXREWG7CQC2RLVVHD7D3GTSZB3FNMRAMOCBGST7R',
            amount: 500 },
        { key: 'GB2PPE5BX7QICAZFJUQAR4YVQLTGDFJRSI4JB5N2MIGELEMRLTBLGVXI',
            amount: 500 },
        { key: 'GCRHGZDTBRY7TEOAPUI5HKK3LCPFMKLRSRWE64ZDG44MG3E6GJ2BMTWE',
            amount: 500 },
        { key: 'GBMVXJSWUHWJQVP3L6TMCLKH76W5WACXK5FPH7EU4GXOTJHBLIVHOVBC',
            amount: 500 },
        { key: 'GDWKP5SES53I4SOMUOAKCX5OSCIJ4OCCJCUEUTSM7WVSMLXH3G6EXX3O',
            amount: 500 },
        { key: 'GBLS2LS35MSZPSJHQ3JIBLIUOARG2TL5XLP4OB2BSX7ESN4325GATE33',
            amount: 500 },
        { key: 'GAXWL5KDQQJ4OGNWYXUNSRX7LQO4B32KTYCBFFG33YO5MKVZFHSAYLWZ',
            amount: 500 },
        { key: 'GATWR5EP6QMLLH2ZL5DAFGK7QFFHIUWCMYBSO3GAS44YVNBGM7QVVAYQ',
            amount: 500 },
        { key: 'GDDDU5JI6ZQYJJKYN4AGYRZ5IEYYEJGMRJCKQYXZOYEL4VP6SKOB3Z7V',
            amount: 500 },
        { key: 'GB7YTHHA2WD2YBTSEBBTFPEP3MD6CHPOFEEB4C3LN7LH5CR4MWP36IYY',
            amount: 500 },
        { key: 'GDHMI2LMSTRT37W7M4ICEQFUG27RTJPCGHNOS7AWJK2YXXF7YFGKGTVO',
            amount: 500 },
        { key: 'GCK2PY5LW4NMCPQKO7GRN5USCCXRBRCA4DUIBS4WHLQETAVWHYI3JIN7',
            amount: 500 },
        { key: 'GD5AAV7ACHHP5CEZCNS6YNGUWWBB6SUZYW6DSMMNEGGSACAMHTIWOPPC',
            amount: 500 },
        { key: 'GBTSQ54AF5DPRN4UYCI6YFVRYQ5K5S2DEL7XUQVXNOVEYJPVXQQVYM3S',
            amount: 500 },
        { key: 'GDGP7LNQ3HSHKNKSILEU4BX3ZVXJ4MNE46C372PIUBS5IAJ4OEZCFNL4',
            amount: 500 },
        { key: 'GDJGW2EE4UP65CDFFTHHHG2LRLA6WHFR6JPGYC6M7HAVDKOEJSLZXR6E',
            amount: 500 },
        { key: 'GC3YRJWK4BC3Y5AU7PJ43JEFEDCFGYH3ABYFYY4GBCSJMFDX73YRZMVJ',
            amount: 500 },
        { key: 'GCBV4NBPULDNZYEL7G3KACGOY7UWDW2WNGRIAEU2XQM6QMOJRBDNO7T7',
            amount: 500 },
        { key: 'GACZAZM3NDGI4BVUUUQGKTNNIRFM4SF3PCIVPSFSX6L5CMPCKZFBY5R3',
            amount: 500 },
        { key: 'GC3N56PPKXU4BMBNFOZSSBXAEVZNP5T3FCWIJLZN2EPP75NJEAJSNZEM',
            amount: 500 },
        { key: 'GB64YDJLNOS7O4XTUNZPASMKFOWMBHIWZRG5MSPTUZTGWG6K6PSN46SG',
            amount: 500 },
        { key: 'GAUBNKHWOCVMUMPYLPZLV7HD2ZPCZQ6JGTGE56HKEMMFWS43M6QB7ICE',
            amount: 500 },
        { key: 'GD7LG3S4LC7IM5P5VPT3SPMP5FIWU7O5JSUAGU3BZE32MQ44A6WJCB4P',
            amount: 500 },
        { key: 'GBLD7WSMGR2K7TZKQ3WADQJEF2HMXH32ELF4LHQ4UKZLGLGZKZ5HXI4B',
            amount: 500 },
        { key: 'GAHSV5VNW526XXE6TUF67SH5CTZK6EVANKB6VCHMIBE5TJVIY5NF7VUZ',
            amount: 500 },
        { key: 'GAALHQVCXDADMQNEN6AFCU2ZIN3NDLHMS4ILCCNBLPUU3WTGERECTL2W',
            amount: 500 },
        { key: 'GDIJCCCNBQXAYM4KFNBKR4QBXJEVGWEQ2OEWDCV2BRK475VYKPKLEO4E',
            amount: 500 },
        { key: 'GAZZMGVNNCBNBBIYHYDG242L3PVUEVBJ5E4LOV2KIMGTH5LIQ2Q7DGES',
            amount: 500 },
        { key: 'GC737VA7SAJV5M7GPH6X2E5KIEMJWMSO374PLQZRPUAT7VQKMIX6SFXX',
            amount: 500 },
        { key: 'GADTYSANA3HIRHQVKRRZGKBPMM6HPQTZPRQ4FSQVKAPJKYBBDP5AJLO7',
            amount: 500 },
        { key: 'GDB2IBWOMABRLJPNFSDVEREZ2HYSK3YMUQYU7GIHPK6GMIQEGBMTJTNU',
            amount: 500 },
        { key: 'GDQLZ3VGJMQK5WUH6O767V7MSY2GOYPRPCIEGW53WBGYJGZX3WELVEY6',
            amount: 500 },
        { key: 'GBNIN5OFC47KPWK2FT6WBBLAL5O3DRBAMHSIRKXYOG32X36A4LJTCLVD',
            amount: 500 },
        { key: 'GBTQKTPE6XSU34MLX24YWOW56TYWGTCGLQSDHYELMLEMRX4YQYZSGWZY',
            amount: 500 },
        { key: 'GCLAEAV6PVEGMYPBV6GSZE2AHNPNR7VHL6HYV7VOXVQJ57OYAYVDZVKS',
            amount: 500 },
        { key: 'GAV3RU6RDRFX6ILBNCNGQIYJDANIT2JVYMSGNSE2VARKPWNREBHSDVK5',
            amount: 500 },
        { key: 'GDCLB3C6TQTF47Q7R3ZI4H4V2Z2VGLZQCL34GVFJPJB6NDMETV6CEH5P',
            amount: 500 },
        { key: 'GAGL35ZQDE2WR2DBZ4NDQHG3TKDGMQZWJS5Q4LPHB6L5GBW4XDC2MHEF',
            amount: 500 },
        { key: 'GC6Z7P37AWSI7AN5PJGUTJDSKJWKMBXUPOVCZIXA37A4BXBNMVRYUUHL',
            amount: 500 },
        { key: 'GDKXMSOUTBGEQAOCEIPXOZJGOQOQAB7ZOVXLU5LY4RU4YL3KZBABKLZR',
            amount: 500 },
        { key: 'GB3TF5ANO33UEOC2WPWZFDXWT6A2WOSOJRO5NCGAKEPEYTXZ2V22ODCD',
            amount: 500 },
        { key: 'GADJA54M5HHUEYAOUU3T7E6C2OR3U62O52N3SBQUD4QTJNZYBRFN27NH',
            amount: 500 },
        { key: 'GDUMXOHCPASMIWKLSHZ7F64KQZYIP7ZT7CQUYOGNN3EAHUUCWWR5RUJ2',
            amount: 500 },
        { key: 'GC5LI4DSPCGBJVDMFEYS6TSXQP3LLRDBS25SZ7PVH44UDDPVPBFJ3QUH',
            amount: 500 },
        { key: 'GDU5TMZ3PN4Q2WWMAJJBGK3CD6YF7MM3GKGPNR2EV7LWL7ZHH44V4QQB',
            amount: 500 },
        { key: 'GA5BDR6HKDEDUTW424DSNUEW6YADUS4UP4DDYLBS7T2OLKXB4TOAQF5B',
            amount: 500 },
        { key: 'GBRWS4KYHN6CHKJ4X4LR6WNLGPHAQ7ESKPJ2DYXGKAXDKEHR3OD4WFED',
            amount: 500 },
        { key: 'GANSLYPZMARMAUUS6UHRXMXH33XE6U3K4UTRFT2SW4HC6V7YJBCGJSJX',
            amount: 500 },
        { key: 'GAMQ7PZHFMOHF4DG5CJX7P7G3SBWJT6D22EB5LLBOBX6XLT2LLJPYQWW',
            amount: 249 } ];
    
    // it("Make witdrawal. ", function (done) {
    //     this.timeout(300000);
    //     StellarSdk.HDWallet
    //         .setByRawSeed(aliceSeed, url)
    //         .then(hdw => {
    //             return hdw.getBalance(asset)
    //                 .then(balance => {
    //                     console.log("balance:", balance);
    //                     return hdw.makeWithdrawalList(balance, asset);
    //                 })
    //
    //         })
    //         .then(withdrawal => {
    //             console.log("Done: ", withdrawal);
    //             done()
    //         })
    //         .catch(err => {
    //             console.log(err);
    //             done(err)
    //         });
    // });

    it("Payment from wallet. ", function (done) {
        this.timeout(300000);
        StellarSdk.HDWallet.setByStrKey(bobSeed, url)
            .then(bob => {
                console.log("Index pair: ", bob.firstWithMoney, " | ", bob.firstUnused);
                console.log("Index list: ", bob.indexList);
                console.log(" ");
                return bob.getBalance(asset)
                    .then(balance => {
                        console.log ("Bob Balance = ", balance);
                        return bob.makeInvoiceList(10000);
                    });
            })
            .then(invoice => {
                console.log("Invoice - ", invoice);
                // console.log(" ");
                return StellarSdk.HDWallet.setByRawSeed(aliceSeed, url)
                    .then(alice => {
                        console.log("Index pair: ", alice.firstWithMoney, " | ", alice.firstUnused);
                        console.log("Index list: ", alice.indexList);
                        // return alice.getBalance(asset);

                        return alice.doPayment(invoice, asset)
                            .then(result => {
                                console.log("Result success = ", result);
                                return alice.getBalance(asset);
                            })
                    });
            })
            .then(result => {
                console.log("Result success = ", result);
                done()
            })
            .catch(err => {
                console.log("Result false = ", err);
                done(err)
            });
    });
    

    let reqList = [];

    // server.getBalances(reqList)
    //     .then(response =>{
    //         console.log(response);
    //         console.log("= ");
    //         console.log(response.assets);
    //         console.log("= ");
    //         console.log(response.assets[0].asset);
    //         console.log("= ");
    //         console.log(response.assets[0].balances);
    //         console.log("= ");
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     });
});