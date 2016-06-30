console.log("Hell dogs");

let master = StellarSdk.Keypair.master();
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

server.accounts()
    .accountId("GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ")
    .call()
    .then(function (accountResult) {
        console.log(accountResult);
    })
    .catch(function (err) {
        console.error(err);
    });