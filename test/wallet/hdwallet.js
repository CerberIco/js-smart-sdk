// import * as StellarBase from "stellar-base";
// StellarSdk.Network.use(new StellarSdk.Network("Smart Money Dev ; March 2016"));
//
// let server = new StellarSdk.Server('http://dev.stellar.attic.pw:8010');
// let seed = [
//         "SADDF3F6LSTEJ5PSQONOQ76G2AQB3LN3YQ73QZB3ZCO6MHUMBIMB3F6U",
//         "SDHOAMBNLGCE2MV5ZKIVZAQD3VCLGP53P3OBSBI6UN5L5XZI5TKHFQL4",
//         "SCVQWNPUXGDRW2IOOM6SS5NQB4KK3Z2MH7ZMM4O6CXKX5L3NRZ5E6V2J",
//         "SCXXRH5QY6DAQOQNHMMF5PBKPB732US6QFNI7722VDRUCNJ5MNFDJJJL",
//         "SAZS3RDL5QTPJSWARQ4MWLIKKXM446VKBBYXBXBUCXGKJCCH72TVUC6U",
//         "SCJ7PY5AITP6NBXPEFSB52BH7JQYJ3GPAMXBMMT6ISY2VOSEXNNGVHHH",
//         "SCCMVPLGK4NLKPGGMYD4ANCC4VXMXKD7RTA24EIJ2Y6NMCCP5WJQ2TXB",
//         "SAWD4RWLY6PTR5HGFN5J5EJGUMLCTCYMQN22V32PPARNSW4JWTYLV3KB",
//         "SABNQ33XMQGD67P6XEIMZVRRPB5L3HIHQSSEXIMY6YTWPSBIVGCQPYU3",
//         "SDGNP4H6JNOVD5E5PGCFAHTHWALJCA6DHSO7K4VAIE2WQM2CIVNNKKU3",
//         "SDOLRGL7VGZ3AQ2XYCVKMIHNU5HQO7CBGCZXUQTS6ZHIU7DQBNHLMESL",
//         "SBGZFREQBDVCWAHSC2GXBXKPSY32TGAHEOERS6GTKSIEFPXRJ26B3S4A",
//         "SD3XFTWCDFIMB4PWJJ6J7MPG2BWQUH5A37PQIOVJZXAI2PEI7FGAFF5S",
//         "SAP46T4ULMAJUFBCDIQ4LWLX2OX2H2ITXKX446O7BLBRMGOLMQOT6X54",
//         "SBUVIIZRGQU2R22KMB7JAOFOFYVZ3WFZAFCPANA5PVJY2F7KKBJHXQX2",
//         "SAQFVUYIV7YAN2DPNLZ6NQEX4BXZQCYK6LN24QS7YHZOL4NHCLANWAWR",
//         "SCJHY7FJVDB5SXGBWPKLKOFS745WEJ3HDCHDQ2UKS4AHIYIJOYCEA4IC",
//         "SD6JOUJ5RO2KYE6H4DS5KOU7FNH4IRUOZWMRYAD5IKQAH2XMLCASRUG7",
//         "SBFXIHYFKN56FWE2HFRB6LFJ2T6G24WLC4TLODKJRHGSCLK74IBZNIP4",
//         "SAKLNEUYQYS5QCQPTXZCGBV34KQUN2AR6L67PXBE5WUK4JTNWWLOHFRB",
//         "SBH6MDX4PC5VMUFDNMSNLS2CA7WTUAGS5A5ZKTD4Q3UUONW2HEZQHPFS",
//         "SDSYLXHUMRZZBGBYACRISAMDLWVU4COOLHMKZKUT7MXND6AAAF3UZ4OM" ],
//     accountWithMoney = {
//         seed:       "SDRHAQQNAK7HPMP24254PTAVSLWNH7M345A5KESPQYKVT5JBBWCQ6E7H",
//         accountId:  "GDDP7EL6EOTER4E4CVCT4IHKQKVHC5PPE7OONTGS5TLCGIFPYAOCDMO3" },
//   
//     bankPublicKey = "GAWIB7ETYGSWULO4VB7D6S42YLPGIC7TY7Y2SSJKVOTMQXV5TILYWBUA",
//     asset = new StellarSdk.Asset('EUAH', bankPublicKey),
//     url = "http://dev.stellar.attic.pw:8010",
//   
//     rootMnemonic = "belief mere bone careful small chair awake meant wrap mutter " +
//         "goose belly men perhaps waste carefully sadness taste rant grab thread garden bliss misery",
//     rootSeed = StellarBase.HDKey.getSeedFromMnemonic(rootMnemonic);
//   
//
//
// StellarSdk.HDWallet.setBySeed(rootSeed, url)
//     .then(hdw => {
//         console.log(hdw);
//         console.log("=========================================================================================");
//         console.log(" ");
//
//         let mpub = hdw.hdk.getMasterPub("M/1");
//       
//         // hdw.getBalance(asset)
//         //     .then(balance => {
//         //        console.log(balance);
//         //     });
//         hdw.refresh()
//         .then(refreshed => {
//             console.log("refreshed => ", refreshed);
//             // return refreshed;
//         // })
//         // .then(ref => {
//         //   ref.totalRefresh().then(wallet =>{
//         //       console.log("total => ", wallet);
//         //   });
//         });
//
//         // StellarSdk.HDWallet.setByStrKey(mpub, url)
//         //     .then(hdwFromMpub => {
//         //
//         //         let accountList = [];
//         //         for (let i = 0; i < 3; i++) {
//         //             let index = i + 19;
//         //             let derivedKey = hdwFromMpub.hdk.derive("M/" + index);
//         //             accountList[i] = StellarBase.encodeCheck("accountId", derivedKey.publicKey);
//         //         }
//         //
//         //         console.log(accountList);
//         //         console.log("=========================================================================================");
//         //         console.log(" ");
//         //
//         //         let keypair = StellarSdk.Keypair.fromSeed(accountWithMoney.seed);
//         //         server.loadAccount(keypair.accountId())
//         //             .then(source => {
//         //                 let transaction = new StellarSdk.TransactionBuilder(source);
//         //                 for (let i = 0; i < accountList.length; i++) {
//         //                     transaction.addOperation(StellarSdk.Operation.payment({
//         //                         destination: accountList[i],
//         //                         source: keypair.accountId(),
//         //                         asset: new StellarSdk.Asset('EUAH', bankPublicKey),
//         //                         amount: "500"
//         //                     }));
//         //                 }
//         //                 let txEnvelope = transaction.build();
//         //
//         //                 txEnvelope.sign(keypair);
//         //                 console.log(txEnvelope);
//         //                 console.log("=========================================================================================");
//         //                 console.log(" ");
//         //
//         //                 // server.submitTransaction(txEnvelope)
//         //                 //     .then(result => {
//         //                 //         console.log("Result success = ", result);
//         //                 //     })
//         //                 //     .catch(result => {
//         //                 //         console.log("Result false = ", result);
//         //                 //     });
//         //             });
//         //     });
//     })
//     .catch(err => {
//         console.log(err);
//     });
//
// // StellarSdk.HDWallet.setBySeed(rootSeed, 'http://dev.stellar.attic.pw:8010')
// //         .then(hdw => {
// //             console.log(hdw);
// //             console.log("fin--------------------------------------------------------------------");
// // hdw.makeInvoiceList(1740)
// //     .then(list => {
// //         console.log("Invoice - ",list);
// //         console.log("--------------------------------------------------------------------");
// // hdw.createTX(list, asset)
// //     .then(txEnvelope => {
// //         console.log(txEnvelope);
// //         // server.submitTransaction(txEnvelope)
// //         //     .then(result => {
// //         //         console.log("Result success = ", result);
// //         //     })
// //         //     .catch(result => {
// //         //         console.log("Result false = ", result);
// //         //     });
// //         //
// //         console.log("--------------------------------------------------------------------");
// //     });
// // hdw.DoPayment(list, asset)
// //     .then(result => {
// //         console.log("Done! ", result);
// //         console.log("--------------------------------------------------------------------");
// //     })
// //     .catch(err => {
// //         console.log(err);
// //     });
// // console.log("--------------------------------------------------------------------");
// // hdw.refresh().then(wallet => {
// //     console.log(wallet);
// //     wallet.makeWithdrawalList(1740, asset)
// //         .then(list => {
// //             console.log("Withdrawal - ", list);
// //         });
// // });
// // });
//
// // })
// // .catch(err => {
// // console.log(err);
//
// // });
