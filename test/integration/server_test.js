describe("integration tests", function () {
  // We need to wait for a ledger to close
  const TIMEOUT = 20*1000;
  this.timeout(TIMEOUT);
  this.slow(TIMEOUT/2);
  StellarSdk.Network.use(new StellarSdk.Network("Smart Money Dev ; March 2016"));
   let server = new StellarSdk.Server('http://dev.stellar.attic.pw:8010');


  // let server = new StellarSdk.Server('http://127.0.0.1:8000');
  let bankSeed = "SAWVTL2JG2HTPPABJZKN3GJEDTHT7YD3TW5XWAWPKAE2NNZPWNNBOIXE";
  let bankPublicKey = "GAWIB7ETYGSWULO4VB7D6S42YLPGIC7TY7Y2SSJKVOTMQXV5TILYWBUA";
  let master = StellarSdk.Keypair.fromSeed(bankSeed);// .master();
// Emission:
// AccountID: GBDDGLK4VTHAATN3GCC7TY2UJHPGRMZ6QBZQS63PPRKUVWNEVZQ7A72Q
  let emissionSeed = "SDPSLVQAVYDA6K4GJARFL43DKZETIFFM7MWJ5JBQWEUCAIS5A5LQHYG6";

  // Admin AccountID: GDNN454CU3LP2LDFU5EDFEDH63O3W62BPC34YVDQOVFOTQQGIOEE7DLO
  let adminSeed = "SDFV2P5KAMWRUFPNA7DAAFEX327KWIZ26W5KTTGE4PBF4VBOYUD7PHVC";
  let createAccSeed = "SCD2AXMPMK2FYCDYSP6RMAHQ7J2W3XSFHFNVTXM2ACVT3OHD45NGQXSG";
  let userCreatingOthers = StellarSdk.Keypair.fromSeed(createAccSeed);
    
  // let tXresult = new StellarSdk.xdr.TransactionResult();
  // tXresult.result(new StellarSdk.xdr.TransactionResultResult(StellarSdk.xdr.TransactionResultCode.txBadSeq()));
  // tXresult.fees([]);
  // tXresult.ext(new StellarSdk.xdr.TransactionResultExt(0));
    console.log("userCreatingOthers accountId:", userCreatingOthers.accountId());
    console.log("userCreatingOthers seed:", userCreatingOthers.seed());

  console.log("master id: ", master.accountId())
  before(function(done) {
    this.timeout(60*1000);
    checkConnection(done);
  });

  function checkConnection(done) {
    server.loadAccount(master.accountId())
      .then(source => {
        console.log('Horizon up and running!');
        done();
      })
      .catch(err => {
        console.log("Couldn't connect to Horizon... Trying again.");
        setTimeout(() => checkConnection(done), 2000);
      });
  }

  function createNewAccount(accountId) {
    return server.loadAccount(userCreatingOthers.accountId())
      .then(source => {
        let tx = new StellarSdk.TransactionBuilder(source)
          .addOperation(StellarSdk.Operation.createAccount({
            destination: accountId,
            accountType: StellarSdk.xdr.AccountType.accountAnonymousUser().value
          }))
          .build();

        tx.sign(userCreatingOthers);

        return server.submitTransaction(tx);
      });
  }

  describe("/administration", function () {
    let distManagerKeyPair = StellarSdk.Keypair.fromSeed("SDRHAQQNAK7HPMP24254PTAVSLWNH7M345A5KESPQYKVT5JBBWCQ6E7H");
    let adminKeyPair = StellarSdk.Keypair.fromSeed(adminSeed);
    
    it("set blocks on account", function (done) {
      server.restrictAgentAccount(distManagerKeyPair.accountId(),false,false, adminKeyPair)
      .then(result =>{
        console.log("result: ", result);
        done();
      })
    });
    it("set limits on account", function (done) {
      var limits = {
            max_operation_out: 100000000,
            daily_max_out: 100000000, 
            monthly_max_out: 100000000, 
            max_operation_in: -1, 
            daily_max_in: -1, 
            monthly_max_in: -1
        };
      server.setAgentLimits(distManagerKeyPair.accountId(),"EUAH", limits, adminKeyPair)
      .then(result =>{
        console.log("result: ", result);
        done();
      })
    });
  });

  describe("/smart_transactions", function () {
    let emissionKeyPair = StellarSdk.Keypair.fromSeed(emissionSeed);
    let adminKeyPair = StellarSdk.Keypair.fromSeed(adminSeed);
    //Dist manager: GDDP7EL6EOTER4E4CVCT4IHKQKVHC5PPE7OONTGS5TLCGIFPYAOCDMO3
    // curl --data "account=GDDP7EL6EOTER4E4CVCT4IHKQKVHC5PPE7OONTGS5TLCGIFPYAOCDMO3&asset_code=EUAH&max_operation=5000&daily_turnnover=100000&monthly_turnover=1000000" http://127.0.0.1:8000/limits

    let distManagerKeyPair = StellarSdk.Keypair.fromSeed("SDRHAQQNAK7HPMP24254PTAVSLWNH7M345A5KESPQYKVT5JBBWCQ6E7H");
    let userCount = 10;
    let distManagerKeyPair2 = StellarSdk.Keypair.random();
    

    let user = StellarSdk.Keypair.random();
    // let users = [];
    // for (var i = 0; i < userCount; i++) {
    //   users.append(StellarSdk.Keypair.random());
    // }


    console.log("emissionKeyPair seed:", emissionKeyPair.seed());
    console.log("adminKeyPair seed:", adminKeyPair.seed());
    
    console.log("distManager accountId:", distManagerKeyPair2.accountId());
    console.log("distManager seed:", distManagerKeyPair2.seed());
    console.log("user accountId:", user.accountId());
    console.log("user seed:", user.seed());
    
//     it("add an emission key signer", function (done) {

//     //   // StellarSdk.EncryptedWalletStorage.getWallet("http://213.136.82.23:3005", "user105", "register", "smartmoney.com.ua").then(result => {
//     //   //     done();
//     //   //   })
//     //   //   .catch(err => done(err));
//     //   // lets prepare the tx for offline signing
//     //   // this step is performed online
//     // // createNewAccount(emissionKeyPair.accountId()).then(result => {
//     // //       expect(result.ledger).to.be.not.null;
//     // //       done();
//     // //     })
//     // //     .catch(err => done(err));
//     // // console.log("emissionKeyPair accountId:", emissionKeyPair.accountId());
//     // // console.log("emissionKeyPair seed:", emissionKeyPair.seed());
          

//       server.loadAccount(bankPublicKey)
//         .then(source => {
//           console.log("account loaded");
//           let addEmissionTx = new StellarSdk.TransactionBuilder(source)
//             .addOperation(StellarSdk.Operation.setOptions({
//               signer: {
//                 address: emissionKeyPair.accountId(),
//                 weight: 1,
//                 signerType: StellarSdk.xdr.SignerType.signerEmission().value
//               }
//             }))
//             .addOperation(StellarSdk.Operation.setOptions({
//               signer: {
//                 address: adminKeyPair.accountId(),
//                 weight: 1,
//                 signerType: StellarSdk.xdr.SignerType.signerAdmin().value
//               }
//             }))
//             // .addOperation(StellarSdk.Operation.setOptions({
//             //   signer: {
//             //     address: "GA4RG3CYGRCQGGZMHWPRRSLGGKKZDRGD43CWFGXNT4MC6FJFC33EPJWN",
//             //     weight: 1,
//             //     signerType: StellarSdk.xdr.SignerType.signerEmission().value
//             //   }
//             // }))
//             // .addOperation(StellarSdk.Operation.setOptions({
//             //   signer: {
//             //     address: "GDT373OOZOZZI4T3V6HRCJVJOLF7ZGIWLFMLPXM5GOCIKDGYDL5XMUR2",
//             //     weight: 1,
//             //     signerType: StellarSdk.xdr.SignerType.signerEmission().value
//             //   }
//             // }))
//             // .addOperation(StellarSdk.Operation.setOptions({
//             //   signer: {
//             //     address: "GDZNGHR2PHZQHWQAKCWAAMWIIJZCLLJIAOODQO554EGVWJCEPLEH6C44",
//             //     weight: 1,
//             //     signerType: StellarSdk.xdr.SignerType.signerEmission().value
//             //   }
//             // }))
//             // .addOperation(StellarSdk.Operation.setOptions({
//             //   signer: {
//             //     address: "GASR3FZQJ4QVPA5E35SWB4M4EIYERNEA7JVPZRXXTSMUDE6QH5RA5UBC",
//             //     weight: 1,
//             //     signerType: StellarSdk.xdr.SignerType.signerAdmin().value
//             //   }
//             // }))
//             // .addOperation(StellarSdk.Operation.setOptions({
//             //   signer: {
//             //     address: "GC2NVMGTDMDPS3O57Q2LJZAQTTNYNGMEZEW62QFBBP7KVIEK22TDE2RC",
//             //     weight: 1,
//             //     signerType: StellarSdk.xdr.SignerType.signerAdmin().value
//             //   }
//             // }))
//             // .addOperation(StellarSdk.Operation.setOptions({
//             //   signer: {
//             //     address: "GCQK4SFL2BEAKGG6XXG5FLWPWTTXRW7SFBKYIXCJ3KRT2EYD4QJ4MTJD",
//             //     weight: 1,
//             //     signerType: StellarSdk.xdr.SignerType.signerAdmin().value
//             //   }
//             // }))
//             // .addOperation(StellarSdk.Operation.setOptions({
//             //   signer: {
//             //     address: "GDHHKDF2VOWGH7STZNAABONPVZBLNBNVPRWTZF6UODUJ6GDYZTGEYR7D",
//             //     weight: 1,
//             //     signerType: StellarSdk.xdr.SignerType.signerAdmin().value
//             //   }
//             // }))
//             .build();
//           let serializedTxString = addEmissionTx.toEnvelope().toXDR('base64');
//           // Now we have a string, that represents an unsigned tx. This string is sent to the offline signer.

//           let deserializedTx = new StellarSdk.Transaction(serializedTxString);
//           // We can show the user all the fields in the tx, so he can verify what is he signing
//           // console.log("deserializedTx:", deserializedTx);
//           let offlineSigner = StellarSdk.Keypair.fromSeed(bankSeed);
//           deserializedTx.sign(offlineSigner);
//           // Now we have a signed transaction, that can be sent to the network 
//           let signedSerializedTxString = deserializedTx.toEnvelope().toXDR('base64');
//           // Lets get back online

//           let signedDeserializedTx = new StellarSdk.Transaction(signedSerializedTxString);
// console.log("Lets get back online ")
// console.log(StellarSdk.Network.current().networkPassphrase())
//           server.submitTransaction(signedDeserializedTx)
//             .then(result => {
//               console.log("result:", result);

//               let buffer = new Buffer(result.result_xdr, "base64");
//               let tXresult = StellarSdk.xdr.TransactionResult.fromXDR(buffer);
//               console.log("tXresult: ",JSON.stringify(tXresult));
//               // console.log("tXresult: ",tXresult);

//               expect(result.ledger).to.be.not.null;
//               done();
//             })
//             .catch(result => {
//               console.log("catch result:", result);
//               done(result)
//             });
//         });
//     });

    it("create a new account signed by admin", function (done) {
    server.loadAccount(bankPublicKey)
      .then(source => {
        let tx = new StellarSdk.TransactionBuilder(source)
          .addOperation(StellarSdk.Operation.createAccount({
            destination: distManagerKeyPair2.accountId(),
            accountType: StellarSdk.xdr.AccountType.accountDistributionAgent().value
          }))
          // .addOperation(StellarSdk.Operation.createAccount({
          //   destination: userCreatingOthers.accountId(),
          //   accountType: StellarSdk.xdr.AccountType.accountAnonymousUser().value
          // }))
          .build();

        tx.sign(adminKeyPair);
        server.submitTransaction(tx)
        .then(result => {
              expect(result.ledger).to.be.not.null;
              done();
            })
        .catch(result => {
          console.log("exception!");
          done(result)});;
      });
    });

    it("set trust from dist manager to the bank in EUAH", function (done) {
    server.loadAccount(distManagerKeyPair2.accountId())
      .then(source => {
        let tx = new StellarSdk.TransactionBuilder(source)
          .addOperation(StellarSdk.Operation.changeTrust({
            asset: new StellarSdk.Asset('EUAH', bankPublicKey)
          }))
          .build();

        tx.sign(distManagerKeyPair2);
        server.submitTransaction(tx)
        .then(result => {
              expect(result.ledger).to.be.not.null;
              done();
            })
        .catch(result => done(result));;
      });
    });


    it("transition tx", function (done) {
    server.loadAccount(bankPublicKey)
      .then(source => {
        let tx = new StellarSdk.TransactionBuilder(source)
          .addOperation(StellarSdk.Operation.payment({
            destination: distManagerKeyPair2.accountId(),
            source: bankPublicKey,
            amount: "10000.00", //lets say this is 10 000.00 UAH
            asset: new StellarSdk.Asset('EUAH', bankPublicKey)
          }))
          .addOperation(StellarSdk.Operation.payment({
            destination: user.accountId(),
            source: distManagerKeyPair2.accountId(),
            amount: "10000.00", //lets say this is 10 000.00 UAH
            asset: new StellarSdk.Asset('EUAH', bankPublicKey)
          }))
          
          .build();

        tx.sign(emissionKeyPair);
        tx.sign(distManagerKeyPair2);
        console.log("tx: ",JSON.stringify(tx));
        server.submitTransaction(tx)
        .then(result => {
              console.log("result: ", JSON.stringify(result));
              expect(result.ledger).to.be.not.null;
              let buffer = new Buffer(result.result_xdr, "base64");
              let tXresult = StellarSdk.xdr.TransactionResult.fromXDR(buffer);
              console.log("tXresult: ",JSON.stringify(tXresult,null,2));

              done();
            })
        .catch(result => {console.log("catch: ", result);
          done(result)});;
      });
    });

//     it("issue some money to distribution manager signed by emission manager", function (done) {
//     server.loadAccount(bankPublicKey)
//       .then(source => {
//         let tx = new StellarSdk.TransactionBuilder(source)
//           .addOperation(StellarSdk.Operation.payment({
//             destination: distManagerKeyPair.accountId(),
//             // source: bankPublicKey,
//             amount: "100000.00", //lets say this is 100 000.00 UAH
//             asset: new StellarSdk.Asset('EUAH', bankPublicKey)
//           }))
//           .build();

//         tx.sign(emissionKeyPair);
//         console.log("tx: ",JSON.stringify(tx));
//         server.submitTransaction(tx)
//         .then(result => {
//               expect(result.ledger).to.be.not.null;
//               let buffer = new Buffer(result.result_xdr, "base64");
//               let tXresult = StellarSdk.xdr.TransactionResult.fromXDR(buffer);
//               console.log("tXresult: ",JSON.stringify(tXresult,null,2));

//               done();
//             })
//         .catch(result => {console.log("catch: ", result);
//           done(result)});;
//       });
//     });


    // it("send some money to the client", function (done) {
    // server.loadAccount(distManagerKeyPair.accountId())
    //   .then(source => {
    //     let tx = new StellarSdk.TransactionBuilder(source)
    //       .addOperation(StellarSdk.Operation.payment({
    //         destination: "GADM2JGMD56QPHTDJPXZYFF4J6VWC45S4JJOJ2KKWL75IFJLRE5S5E5R",
    //         amount: "30.00", //lets say this is 100.00 UAH
    //         asset: new StellarSdk.Asset('EUAH', distManagerKeyPair.accountId())
    //       }))
    //       // .addOperation(StellarSdk.Operation.payment({
    //       //   destination: "GADM2JGMD56QPHTDJPXZYFF4J6VWC45S4JJOJ2KKWL75IFJLRE5S5E5R",
    //       //   amount: "60.00", //lets say this is 100.00 UAH
    //       //   asset: new StellarSdk.Asset('EUAH', bankPublicKey)
    //       // }))
    //       .build();

    //     tx.sign(distManagerKeyPair);
    //     server.submitTransaction(tx)
    //     .then(result => {
    //           expect(result.ledger).to.be.not.null;
    //           done();
    //         })
    //     .catch(result => done(result));;
    //   });
    // });

    


  });

  describe("/accounts", function () {
    it("lists all accounts", function (done) {
      server.accounts()
        .call()
        .then(accounts => {
          // The first account should be a master account
          expect(accounts.records[0].account_id).to.equal(master.accountId());
          done();
        });
    });

    it("stream accounts", function (done) {
      this.timeout(10*1000);
      let randomAccount = StellarSdk.Keypair.random();

      let eventStream;
      eventStream = server.accounts()
        .cursor('now')
        .stream({
          onmessage: account => {
            expect(account.account_id).to.equal(randomAccount.accountId());
            done();
          }
        });

      createNewAccount(randomAccount.accountId());
      setTimeout(() => eventStream.close(), 10*1000);
    });
  });
});
