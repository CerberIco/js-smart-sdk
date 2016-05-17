describe("integration tests", function () {
  // We need to wait for a ledger to close
  const TIMEOUT = 20*1000;
  this.timeout(TIMEOUT);
  this.slow(TIMEOUT/2);

  // Docker
  let server = new StellarSdk.Server('http://213.136.82.23:8000');
  // let server = new StellarSdk.Server('http://127.0.0.1:8000');
  //let server = new StellarSdk.Server('http://192.168.59.103:32773');
  let bankSeed = "SAWVTL2JG2HTPPABJZKN3GJEDTHT7YD3TW5XWAWPKAE2NNZPWNNBOIXE";
  let bankPublicKey = "GAWIB7ETYGSWULO4VB7D6S42YLPGIC7TY7Y2SSJKVOTMQXV5TILYWBUA";
  let master = StellarSdk.Keypair.fromSeed(bankSeed);// .master();

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
    return server.loadAccount(master.accountId())
      .then(source => {
        let tx = new StellarSdk.TransactionBuilder(source)
          .addOperation(StellarSdk.Operation.createAccount({
            destination: accountId,
            accountType: StellarSdk.xdr.AccountType.accountAnonymousUser().value
          }))
          .build();

        tx.sign(master);

        return server.submitTransaction(tx);
      });
  }

  describe("/smart_transactions", function () {
    let emissionKeyPair = StellarSdk.Keypair.random();
    let adminKeyPair = StellarSdk.Keypair.random();
    let distManagerKeyPair = StellarSdk.Keypair.random();
    console.log("distManager accountId:", distManagerKeyPair.accountId());
    it("add an emission key signer", function (done) {
      // lets prepare the tx for offline signing
      // this step is performed online
          
      server.loadAccount(bankPublicKey)
        .then(source => {
          let addEmissionTx = new StellarSdk.TransactionBuilder(source)
            .addOperation(StellarSdk.Operation.setOptions({
              signer: {
                address: emissionKeyPair.accountId(),
                weight: 250,
                signerType: StellarSdk.xdr.SignerType.signerEmission().value
              }
            }))
            .addOperation(StellarSdk.Operation.setOptions({
              signer: {
                address: adminKeyPair.accountId(),
                weight: 120,
                signerType: StellarSdk.xdr.SignerType.signerAdmin().value
              }
            }))
            .build();
          let serializedTxString = addEmissionTx.toEnvelope().toXDR('base64');
          // Now we have a string, that represents an unsigned tx. This string is sent to the offline signer.

          let deserializedTx = new StellarSdk.Transaction(serializedTxString);
          // We can show the user all the fields in the tx, so he can verify what is he signing
          // console.log("deserializedTx:", deserializedTx);
          let offlineSigner = StellarSdk.Keypair.fromSeed(bankSeed);
          deserializedTx.sign(offlineSigner);
          // Now we have a signed transaction, that can be sent to the network 
          let signedSerializedTxString = deserializedTx.toEnvelope().toXDR('base64');

          // Lets get back online

          let signedDeserializedTx = new StellarSdk.Transaction(signedSerializedTxString);

          server.submitTransaction(signedDeserializedTx)
            .then(result => {
              console.log("result:", result);
              expect(result.ledger).to.be.not.null;
              done();
            })
            .catch(result => {
              console.log("catch result:", result);
              done(result)
            });
        });
    });

    it("create a new account signed by admin", function (done) {
    server.loadAccount(bankPublicKey)
      .then(source => {
        let tx = new StellarSdk.TransactionBuilder(source)
          .addOperation(StellarSdk.Operation.createAccount({
            destination: distManagerKeyPair.accountId(),
            accountType: StellarSdk.xdr.AccountType.accountDistributionAgent().value
          }))
          .build();

        tx.sign(adminKeyPair);
        server.submitTransaction(tx)
        .then(result => {
              expect(result.ledger).to.be.not.null;
              done();
            })
        .catch(result => done(result));;
      });
    });

    it("set trust from dist manager to the bank in EUAH", function (done) {
    server.loadAccount(distManagerKeyPair.accountId())
      .then(source => {
        let tx = new StellarSdk.TransactionBuilder(source)
          .addOperation(StellarSdk.Operation.changeTrust({
            asset: new StellarSdk.Asset('EUAH', bankPublicKey)
          }))
          .build();

        tx.sign(distManagerKeyPair);
        server.submitTransaction(tx)
        .then(result => {
              expect(result.ledger).to.be.not.null;
              done();
            })
        .catch(result => done(result));;
      });
    });

    it("issue some money to distribution manager signed by emission manager", function (done) {
    server.loadAccount(bankPublicKey)
      .then(source => {
        let tx = new StellarSdk.TransactionBuilder(source)
          .addOperation(StellarSdk.Operation.payment({
            destination: distManagerKeyPair.accountId(),
            amount: "1.00", //lets say this is 1.00 UAH
            asset: new StellarSdk.Asset('EUAH', bankPublicKey)
          }))
          .build();

        tx.sign(emissionKeyPair);
        server.submitTransaction(tx)
        .then(result => {
              expect(result.ledger).to.be.not.null;
              done();
            })
        .catch(result => done(result));;
      });
    });


  });

  describe("/transaction", function () {
    it("submits a new transaction", function (done) {
      createNewAccount(StellarSdk.Keypair.random().accountId())
        .then(result => {
          expect(result.ledger).to.be.not.null;
          done();
        })
        .catch(err => done(err));
    });

    it("submits a new transaction with error", function (done) {
      server.loadAccount(master.accountId())
        .then(source => {
          source.incrementSequenceNumber(); // This will cause an error
          let tx = new StellarSdk.TransactionBuilder(source)
            .addOperation(StellarSdk.Operation.createAccount({
              destination: StellarSdk.Keypair.random().accountId(),
              accountType: StellarSdk.xdr.AccountType.accountUser().value
            }))
            .build();

          tx.sign(master);

          server.submitTransaction(tx)
            .then(result => done(new Error("This promise should be rejected.")))
            .catch(result => {
              expect(result.extras.result_codes.transaction).to.equal('tx_bad_seq');
              done();
            });
        });
    });
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
