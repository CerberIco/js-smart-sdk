import * as StellarBase from "stellar-base";
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
    bankPublicKey = "GAWIB7ETYGSWULO4VB7D6S42YLPGIC7TY7Y2SSJKVOTMQXV5TILYWBUA",
    asset = new StellarSdk.Asset('EUAH', bankPublicKey);

StellarSdk.HDWallet.setBySeed(rootSeed, 'http://dev.stellar.attic.pw:8010')
        .then(hdw => {
            console.log(hdw);
            console.log("fin--------------------------------------------------------------------");
            hdw.MakeInvoiceList(1740)
                .then(list => {
                    console.log("Invoice - ",list);
                    console.log("--------------------------------------------------------------------");
                    // hdw.createTX(list, asset)
                    //     .then(txEnvelope => {
                    //         console.log(txEnvelope);
                    //         // server.submitTransaction(txEnvelope)
                    //         //     .then(result => {
                    //         //         console.log("Result success = ", result);
                    //         //     })
                    //         //     .catch(result => {
                    //         //         console.log("Result false = ", result);
                    //         //     });
                    //         //
                    //         console.log("--------------------------------------------------------------------");
                    //     });
                    // hdw.DoPayment(list, asset)
                    //     .then(result => {
                    //         console.log("Done! ", result);
                    //         console.log("--------------------------------------------------------------------");
                    //     })
                    //     .catch(err => {
                    //         console.log(err);
                    //     });
                    // console.log("--------------------------------------------------------------------");
                    hdw.Refresh().then(wallet => {
                        console.log(wallet);
                        wallet.MakeWithdrawalList(1740, asset)
                            .then(list => {
                                console.log("Withdrawal - ", list);
                            });
                    });
                });

        })
        .catch(err => {
                console.log(err);

        });

// mpub = hdwRoot.hdkey.getMasterPub("M/1"),

// let hdwFromMpub = StellarSdk.HDWallet.SetByStrKey(mpub);

// let accountList = [];
// for (let i = 0; i < 15; i++){
//     let index = i;
//     let derivedKey = hdwFromMpub.hdkey.derive("M/" + index );
//     accountList[i]  = StellarBase.encodeCheck("accountId", derivedKey.publicKey);
// }

// console.log(accountList);

// let keypair = StellarSdk.Keypair.fromSeed("SDRHAQQNAK7HPMP24254PTAVSLWNH7M345A5KESPQYKVT5JBBWCQ6E7H");
// server
//     .loadAccount(keypair.accountId())
//     .then(source => {
//         let transaction = new StellarSdk.TransactionBuilder(source);
//         for (let i = 0; i < accountList.length; i++) {
//             transaction.addOperation(StellarSdk.Operation.payment({
//                 destination: accountList[i],
//                 source: keypair.accountId(),
//                 asset: new StellarSdk.Asset('EUAH', bankPublicKey),
//                 amount: "400"
//             }));
//         }
//         let txEnvelope = transaction.build();
//
//         txEnvelope.sign(keypair);
//         console.log(txEnvelope);
//         server.submitTransaction(txEnvelope)
//             .then(result => {
//                 console.log("Result success = ", result);
//             })
//             .catch(result => {
//                 console.log("Result false = ", result);
//             });
//     });


let accList = [
    'GCHPRLLQOTJ5HHTJJLUHLPQGLU2RGIXZFFKBJBVNY66QXZRYUQYH3QHY',
    'GDLTGIPPZ3SI4FBHXS6EPSMM67WRZGH4TGMNZRV64SNTQ2YHD6KRG36X',
    'GAENKVXMASDYTHB5YJI5BJGFHOLJXCLAD5FIPAN7V53ASIP6E2IUFTDU',
    'GCMPK6GHDOWFWQBKS2AGJWUEMYPUAYXOECC53SKXBS7BB4CFZBZ24DPE',
    'GA7LDL22QTZS3Q4OC766HWCOM5UG7LTKQMIDRZVXPZ2UXWKD7CVWIPX5',
    'GDX6S7BOW6KHL2C62X5JYMBGALCD5JX5IH67PGQ4W2QFBS7374YFTKCR',
    'GCS3LWOLN3IGCXKQ3NN4TLOWGGJVDEOPIIULPXU6PZOMVNTQVW7JUR26',
    'GBHJUVLH56VIIZXHD4OW5HYNBEGCGXBZ3NQBCNQAKDMI6GKM6QEQNTX3',
    'GDNRA3XPETFL22N6XZWEJGEH64PNUNKMJCZ7U5UJO6VMQK4P6S7QUBLU',
    'GBUJTEOYNST6E2TJM2JJJ265CAVJJMEXQJUNZSDIMX6CPU6PZVY7XITY',
    'GDFI5AOWWXQ2ILDCZOJRY3Q6GQR6VFE6NVTLMVMQQPW4JZTER4IYN4QK',
    'GCF76U45VNAAN74QLYUJYDLT2GYMLYT52QWLYAWKCB2QUHA6F5Z4ZSOO',
    'GD42EUZ5DTAFHEDK5TL7XOPL3VDIY2CSRRWC74324WMC6WL4IDLRKYTG' ];
console.log("Im here");
// server.getBalances(accList)
//     .then(response => {
//        console.log(response.assets[0].balances);
//     })
//     .catch(err =>{
//         console.log(err.message);
//     });