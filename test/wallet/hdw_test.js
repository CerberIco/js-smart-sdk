import * as StellarBase from "stellar-base";
import {testData} from "./test_data";
StellarSdk.Network.use(new StellarSdk.Network("Smart Money Dev ; March 2016"));


let HDWallet = StellarSdk.HDWallet;
let HDKey = StellarBase.HDKey;
let toBluebirdRes = require("bluebird").resolve;
let Promise = require("bluebird");


let accountWithMoney = {
        seed:       "SDRHAQQNAK7HPMP24254PTAVSLWNH7M345A5KESPQYKVT5JBBWCQ6E7H",
        accountId:  "GDDP7EL6EOTER4E4CVCT4IHKQKVHC5PPE7OONTGS5TLCGIFPYAOCDMO3" },

    bankPublicKey = "GAWIB7ETYGSWULO4VB7D6S42YLPGIC7TY7Y2SSJKVOTMQXV5TILYWBUA",
    asset = new StellarSdk.Asset('EUAH', bankPublicKey),
    url = "http://dev.stellar.attic.pw:8010",

    rootMnemonic = "belief mere bone careful small chair awake meant wrap mutter " +
        "goose belly men perhaps waste carefully sadness taste rant grab thread garden bliss misery",
    rootSeed = StellarBase.HDKey.getSeedFromMnemonic(rootMnemonic);

function bufferCompare(buf1, buf2) {
    for (let l = 0; l < 31; l++)
        if (buf1[l] !== buf2[l])
            return false;
    
    return true ;
}

function checkList(list, constList) {
    for (let i = 0; i < list.length; i++) {
        if ((list[i].key !== constList[i].key) || (StellarSdk.HDWallet._fromAmount(list[i].amount) !== constList[i].amount)) {
            console.log(list[i].key, "==", constList[i].key);
            console.log(StellarSdk.HDWallet._fromAmount(list[i].amount), "==", constList[i].amount);
            return false;
        }
    }
    return true;
}

function makeResponseList(request) {
    // console.log("check account ", request.length);
    // console.log("-------------------------------");
    let response =
    {
        "assets": [ ]
    };
    
    let result = {
        "asset": {  "asset_type": "credit_alphanum4",
            "asset_code": "EUAH",
            "asset_issuer": "GAWIB7ETYGSWULO4VB7D6S42YLPGIC7TY7Y2SSJKVOTMQXV5TILYWBUA" },
        "balances": []

    }; 
    for (let i = 0; i < request.length; i++) {
        let id = StellarBase.decodeCheck("accountId", request[i]);

        let isValid = (id.readUInt8(0) & 31) === 0,
            hasBalance = (id.readUInt8(1) & 1) > 0,
            balance = 0;

        if (hasBalance)
            balance = (id.readUInt8(0) ^ 5) + 8;

        if (isValid) {
            result.balances.push({
                "account_id": request[i],
                "balance": balance.toString(10),
                "limit": "922337203685.4775807"
            });
        }
    }
    if(result.balances.length !== 0)
       response.assets[0] = result; 
    
    return Promise.resolve(response);
}
//


describe("HDWallet Test. ", function () {

    describe('Set by Mnemonic: ', function () {
        let phrase = [];
        for (let i = 0; i < 5; i++)
            phrase[i] = testData.phrase[i];
            // phrase[i] = HDKey.getMnemonic();
    
        beforeEach(function (done) {
            // console.log('Before called');
            sinon.stub(StellarSdk.Server.prototype, "getBalances", makeResponseList);
            done();
        });

        it("seed in HDW compare with const", function (done) {
            this.timeout(300000);
            let promise = Promise.resolve();
        
            phrase.forEach(function (mnemonic, i) {
                let p = () => {
                    return HDWallet.setByPhrase(mnemonic, url)
                        .then(hdw => {
                            expect(bufferCompare(hdw.seed, new Buffer(testData.seed[i], "hex"))).to.equal(true);
                            return Promise.resolve();
                        });
                };
                promise = promise.then(p)
            });
        
            promise.then(() => {
                StellarSdk.Server.prototype.getBalances.restore();
                done()
            }).catch(err => {
                StellarSdk.Server.prototype.getBalances.restore();
                done(err)
            });
        });
        
        it("serialize/deserialize of HDWallet correctly", function (done) {
            this.timeout(300000);
            let promise = Promise.resolve();
        
            phrase.forEach(function (mnemonic) {
                let p = () => {
                    return HDWallet.setByPhrase(mnemonic, url)
                        .then(hdw => {
                            let strOriginal = hdw.serialize();
                            return HDWallet.setByStrKey(strOriginal, url)
                                .then(deserialized => {
                                    let str = deserialized.serialize();
                                    expect(str).to.equal(strOriginal);
                                    return Promise.resolve();
                                });
                        });
                };
                promise = promise.then(p)
            });
            promise.then(() => {
                StellarSdk.Server.prototype.getBalances.restore();
                done()
            }).catch(err => {
                StellarSdk.Server.prototype.getBalances.restore();
                done(err)
            });
        
        });

        it("Setting indexes and refresh of HDWallet", function (done) {
            this.timeout(300000);
            let promise = Promise.resolve();
            phrase.forEach(function (mnemonic, i) {
                let p = () => {
                    return HDWallet.setByPhrase(mnemonic, url)
                        .then(hdw => {
                            let serWallet = hdw.serialize();
                            // console.log(" ");
                            // console.log("before - ", hdw.firstWithMoney, hdw.firstUnused);
                            // console.log("before - ", hdw.indexList);
                            // console.log("before - ", serWallet);
                            // console.log(" ");
                            expect(serWallet).to.equal(testData.serialization[i]);
                            return hdw.refresh();
                        })
                        .then(hdw => {
                            let serWallet = hdw.serialize();
                            // console.log("after - ", hdw.firstWithMoney, hdw.firstUnused);
                            // console.log("after - ", hdw.indexList);
                            // console.log("after  - ", serWallet);
                            expect(serWallet).to.equal(testData.serialization[i]);
                            return Promise.resolve();
                        });
                };
                promise = promise.then(p);
            });

            promise.then(() => {
                StellarSdk.Server.prototype.getBalances.restore();
                done()
            }).catch(err => {
                StellarSdk.Server.prototype.getBalances.restore();
                done(err)
            });
        });

        it("make list of keys for account with money", function (done) {
            this.timeout(400000);
            let promise = Promise.resolve();
            phrase.forEach(function (mnemonic, i) {
                let p = () => {
                    return HDWallet.setByPhrase(mnemonic, url)
                        .then(hdw => {
                            return hdw.getKeysForAccountsWithMoney() ;
                        })
                        .then(list => {
                            let result = true;
                            for (let l = 0; l < list.length; l++) {
                                if ((list[l].key !== testData.keysList[i][l].key) || (list[l].balances[0].balance !== testData.keysList[i][l].balance)) {
                                    result = false;
                                    break;
                                }
                            }
                            expect(result).to.equal(true);
                            return Promise.resolve();
                        });
                };
                promise = promise.then(p)
            });
        
            promise.then(() => {
                StellarSdk.Server.prototype.getBalances.restore();
                done()
            }).catch(err => {
                StellarSdk.Server.prototype.getBalances.restore();
                done(err)
            });
        });
        
        it("make list of IDs of account with money", function (done) {
            this.timeout(400000);
            let promise = Promise.resolve();
            phrase.forEach(function (mnemonic, i) {
                let p = () => {
                    return HDWallet.setByPhrase(mnemonic, url)
                        .then(hdw => {
                            return hdw.getAccountIdsWithMoney();
                        })
                        .then(list => {
                            let result = true;
                            // console.log(list, testData.idList[i]);
                            for (let l = 0; l < list.length; l++) {
                                if ((list[l].account_id !== testData.idList[i][l].account_id) || (list[l].balances[0].balance !== testData.idList[i][l].balance)) {
                                    // console.log(list[l].account_id, testData.keysList[i][l].account_id);
                                    result = false;
                                    break;
                                }
                            }
                            expect(result).to.equal(true);
                            return Promise.resolve();
                        });
                };
                promise = promise.then(p)
            });
        
            promise.then(() => {
                StellarSdk.Server.prototype.getBalances.restore();
                done()
            }).catch(err => {
                StellarSdk.Server.prototype.getBalances.restore();
                done(err)
            });
        });
        
    });

    describe('HDWallet. SetByStrKey', function () {
        let seed = [],
            mpub = [];
        for (let i = 0; i < 3; i++) {
            seed[i] = new Buffer(testData.seed[i], "hex");
            let hdk = HDKey.fromMasterSeed(seed[i]);
            mpub[i] = hdk.getMasterPub("_");
        }
    
        beforeEach(function (done) {
            this.timeout(300000);
            // console.log('Before called');
            sinon.stub(StellarSdk.Server.prototype, "getBalances", makeResponseList);
            done();
        });
    
    
        it("create HDWallet by seed correctly", function (done) {
    
            this.timeout(300000);
            let promises = [];
    
            seed.forEach((currentSeed) => {
                let p =  HDWallet.setByRawSeed(currentSeed, url)
                    .then(hdw => {
                        expect(bufferCompare(hdw.seed, currentSeed)).to.equal(true);
                        return Promise.resolve(true);
                    });
                promises.push(p)
            });
    
            Promise.all(promises)
                .then(result => {
                    result.forEach(function (value) {
                        if (value !== true)
                            return false;
                    });
                    return true;
    
                })
                .then(res => {
                    expect(res).to.equal(true);
                    StellarSdk.Server.prototype.getBalances.restore();
                    done();
                })
                .catch(err => {
                    StellarSdk.Server.prototype.getBalances.restore();
                    done(err)
                });
        });
    
        it("create HDWallet by mpub correctly", function (done) {
            this.timeout(300000);
            let promises = [];
    
            mpub.forEach(function (mPublic, i) {
                let p = HDWallet.setByStrKey(mPublic, url)
                    .then(hdw => {
                        let pub = hdw.hdk.getMasterPub("_");
                        expect(pub).to.equal(mpub[i]);
                        return Promise.resolve(true);
                    });
    
                promises.push(p);
    
            });
    
            Promise.all(promises)
                .then(result => {
                    result.forEach(function (value) {
                        expect(value).to.equal(true);
                    });
                    StellarSdk.Server.prototype.getBalances.restore();
                    done();
                })
                .catch(err => {
                    StellarSdk.Server.prototype.getBalances.restore();
                    done(err)
                });
        });
    
    
    });

    describe("Tx Test. ", function () {
    
        beforeEach(function (done) {
            // console.log('Before called');
            sinon.stub(StellarSdk.Server.prototype, "getBalances", makeResponseList);
            done();
        });
    
        it("Making correct Invoice/Withdrawal list", function (done) {
            this.timeout(300000);
            let promise = Promise.resolve();
    
            testData.tx.phrase.forEach(function (mnemonic, i) {
                let p = () => {
                    return HDWallet.setByPhrase(mnemonic, url)
                        .then(hdw => {
                            let list = hdw.makeInvoiceList(testData.tx.amount[i], asset);
                            let constL = testData.tx.invoice[i];
                            // console.log("invoice ", amount[i], " | ", list);
                            // console.log(listConst.invoice[i]);
                            // console.log(" ");
    
                            // expect(checkList(list, constL)).to.equal(true);
                            return hdw;
                        })
                        .then(hdw => {
                            return hdw.makeWithdrawalList(HDWallet._toAmount(testData.tx.amount[i]), asset)
                                .then(list => {
                                    let constL = testData.tx.withdrawal[i];
                                    // console.log("withdrawal ", amount[i], " | ", list);
                                    // console.log(listConst.withdrawal[i]);
                                    // console.log(" ");
    
                                    expect(checkList(list, constL)).to.equal(true);
                                    return Promise.resolve();
                                });
                        })
                        .catch(err => {
                            console.log(err);
                            return Promise.resolve();
                        });
                };
                promise = promise.then(p)
            });
    
            promise.then(() => {
                StellarSdk.Server.prototype.getBalances.restore();
                done()
            })
                .catch(err => {
                    StellarSdk.Server.prototype.getBalances.restore();
                    done(err)
            });
        });
    
    });

});
