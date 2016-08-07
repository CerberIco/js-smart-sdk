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
    //         .setBySeed(rootSeed, url)
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
    //         .setBySeed(rootSeed, url)
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
    //         .setBySeed(rootSeed, url)
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
    
    it("Payment from `account with money`. ", function (done) {
        this.timeout(300000);
    
        StellarSdk.HDWallet.setBySeed(rootSeed, url)
            .then(hdw => {
                console.log("Index pair: ", hdw.firstWithMoney, " | ", hdw.firstUnused);
                console.log("Index list: ", hdw.indexList);
                console.log(" ");
    
                let mpub = hdw.hdk.getMasterPub("M/2/10");
    
                console.log("mpub: ", mpub);
                console.log("self : ", hdw.getMPub("M/2/10"));
                console.log("new : ", hdw.getMPublicNew());
                console.log(" ");
                return hdw;
                // return StellarSdk.HDWallet.setByStrKey(mpub, url);
            })
            .then(hdwFromMpub => {
                let accountList = [];

                for (let i = 0; i < 3; i++) {
                    let index = i + 19;
                    let derivedKey = hdwFromMpub.hdk.derive("M/" + index);
                    accountList[i] = StellarBase.encodeCheck("accountId", derivedKey.publicKey);
                }
                console.log(accountList);

                let keypair = StellarSdk.Keypair.fromSeed(accountWithMoney.seed);
                return server.loadAccount(keypair.accountId())
                    .then(source => {
                        let transaction = new StellarSdk.TransactionBuilder(source);
                        for (let i = 0; i < accountList.length; i++) {
                            transaction.addOperation(StellarSdk.Operation.payment({
                                destination: accountList[i],
                                source: keypair.accountId(),
                                asset: new StellarSdk.Asset('EUAH', bankPublicKey),
                                amount: "500"
                            }));
                        }
                        let txEnvelope = transaction.build();

                        txEnvelope.sign(keypair);

                        // return server.submitTransaction(txEnvelope);
                        return txEnvelope;
                    })
                    .catch(err => {
                        return err;
                    });
            })
            .then(result => {
                console.log("Result success = ", result);
                done()
            })
            .catch(err => {
                console.log("Result success", err);
                done(err)
            });
    });
    
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
    //                     return StellarSdk.HDWallet.setBySeed(rootSeed, 'http://dev.stellar.attic.pw:8010')
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
    
    // it("Payment from wallet. ", function (done) {
    //     this.timeout(300000);
    //     StellarSdk.HDWallet.setBySeed(rootSeed, 'http://dev.stellar.attic.pw:8010')
    //         .then(hdw => {
    //            
    //             hdw.DoPayment(list, asset)
    //                 .then(result => {
    //                     // console.log("Done! ", result);
    //                     // console.log("--------------------------------------------------------------------");
    //                 })
    //                 .catch(err => {
    //                     console.log(err);
    //                 });
    //                
    //             hdw.refresh().then(wallet => {
    //                 console.log(wallet);
    //                 wallet.makeWithdrawalList(1740, asset)
    //                     .then(list => {
    //                         // console.log("Withdrawal - ", list);
    //                     })
    //                     .catch(err => {
    //                         console.log(err);
    //                     });
    //             });
    //         });
    //
    // });
    //

    let reqList = [
        'GCJ63QQBQ2O6NVENDW2EAJGKZAPWKQQGPTINE7ED445AHCT47TOXHFQW',
        'GA7V3R5DAG2OGLFSQCSYEGEDRFG3K4PAQ3VOP27ZFPICQ5YOENJJPC7G',
        'GDUJDG5PP5QUDVJXNHFBBJUIENBSGEFYEHK3FQMND4O7WBCYBNOAASOB',
        'GDJFKBJDNJNKTKUKUCZWDU75V7KPPXVCUZ2BH5TXP452NCCT2VXYCCWJ',
        'GCTJ22ZVGUFCMJGVHAW4NVWQSUXGMSVZVEOXH45TTLINXUWQ2W3Q5FET',
        'GAZT7JBZFI3XBZYVWQGTSRRTBFDYFFTN7WRKAGI5I2E4ZLOCEYCCXVWY',
        'GD4XDX2WGBAH2SMD5F3QMHTARZ5DOYIABYZBAGWLQ5PWWSQYTAF7YFER',
        'GBU3A4D5M6NM4ERFTG7EOGJIQGVOQSXHQD72Y5IXIODEISGR4PQNGAM6',
        'GB7WS6RJ6UJTQTDXZUGEUE3Y5RFXP6Z7D5PY542BL6ARE5PXR45XYUFQ',
        'GAUS22RBMIBBAW5PILD4HHFJKX6U5X7FPSRBVN5NIFJ2Q6PS2YQ5HYL6',
        'GBXDHR4YVHAIGHYLAOLNGRIBQ57S33NLUHIAVDOVRGOEAPMR6F7TCWLE',
        'GC4KMHJGRHZSLLW4YT7CW6H2XRQV4GU2UPIR3ARHPSOU7BQQWRYVV76A',
        'GABXLYP4UEKB77SJTFITXQNT7KU7LMEZEOIB3M5FFAHJBNUS4MNQFGZN',
        'GBH2UEHHQJPHHEXPVBOGOMEVTUHTJLDENO2QMV34E6A7CZKI4WRPSQEJ',
        'GDJA5KLGCI4URAQMMKVZHTL3MK3IQ243YTYS5JWKKYL4WN2B2GCFD2IR',
        'GCRAROVSZP7NL2Y73PKAHNRKOI2TTNNZSS35WWZY24B6ZI7DS5JN3MGT' ];

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