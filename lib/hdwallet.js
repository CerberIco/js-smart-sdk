"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});
"use strict";

var _stellarBase = require("stellar-base");

var StellarBase = _interopRequireWildcard(_stellarBase);

var StellarSdk = _interopRequireWildcard(require("./index"));

var HDKey = _stellarBase.HDKey;

var Server = require("./server").Server;

var toBluebirdRes = require("bluebird").resolve;
var toBluebirdRej = require("bluebird").reject;

var decodeMnemo = HDKey.getSeedFromMnemonic,
    strDecode = StellarBase.decodeCheck,
    strEncode = StellarBase.encodeCheck,
    genMaster = HDKey.fromMasterSeed;

var HDWallet = exports.HDWallet = (function () {

    /**
     * Implementation of `HDWallet` based on ed25519 curve.
     *
     * Use more convenient methods to create `HDWallet` object:
     * * `{@link HDWallet.setByPhrase}` by mnemonic phrase
     * * `{@link HDWallet.setByStrKey}` by seed, MasterPublic or serialized wallet
     *
     * @constructor
     * @param url {string} server url
     */

    function HDWallet(url) {
        _classCallCheck(this, HDWallet);

        this.ver = null;
        this.firstWithMoney = null;
        this.firstUnused = null;
        this.indexList = null;
        this.seed = null;
        this.hdk = null;
        this._serverURL = url;
    }

    _createClass(HDWallet, {
        refresh: {

            /**
             * Update all indexes of HDWallet.
             */

            value: function refresh() {
                var _this = this;

                var path = undefined,
                    indexPair = {};

                if (this.firstWithMoney !== -1) indexPair.f_w_m = this.firstWithMoney;else indexPair.f_w_m = 0;

                if (this.firstUnused !== -1) indexPair.f_u = this.firstUnused;else indexPair.f_u = 0;

                indexPair.indexingF_u = true;

                if (this.ver == HDWallet._version().mpriv.byte) {
                    path = "M/1/";
                    var indexList = this.indexList.slice();

                    return HDWallet._updateBranchIndexes("M/2/", this, indexList).then(function (list) {
                        _this.indexList = list.slice();
                        return HDWallet._updateAddressIndexes(path, _this, indexPair).then(function (result) {
                            if (_this.firstWithMoney < indexPair.f_w_m) _this.firstWithMoney = indexPair.f_w_m;
                            if (_this.firstUnused < indexPair.f_u) _this.firstUnused = indexPair.f_u;
                            return _this;
                        });
                    });
                } else if (this.ver == HDWallet._version().mpub.byte) {
                    path = "M/";
                    return HDWallet._updateAddressIndexes(path, this, indexPair).then(function (result) {
                        if (_this.firstWithMoney < indexPair.f_w_m) _this.firstWithMoney = indexPair.f_w_m;
                        if (_this.firstUnused < indexPair.f_u) _this.firstUnused = indexPair.f_u;
                        return _this;
                    });
                } else {
                    return toBluebirdRej(new Error("Version of HDWallet mismatch"));
                }
            }
        },
        totalRefresh: {

            /**
             * Setup all indexes in 0 and make Refresh of HDW.
             *
             */

            value: function totalRefresh() {
                this.firstUnused = 0;
                this.firstWithMoney = 0;
                this.indexList = [];
                return this.refresh();
            }
        },
        getMPub: {

            /**
             * Return Base32 encoded MasterPublicKey
             * @param path {number} or {string}
             * @return {string}
             */

            value: function getMPub(path) {
                if (typeof path == "number") {
                    return this.hdk.getMasterPub("M/2/" + path);
                }if (typeof path == "string") {
                    return this.hdk.getMasterPub(path);
                } else throw new Error("Invalid argument! Must be index (type = number) or path (type = string).");
            }
        },
        getMPublicNew: {

            /**
             * Return Base32 encoded MasterPublicKey for unused branch
             * @return {string}
             */

            value: function getMPublicNew() {
                return this.getMPub(this.indexList.length);
            }
        },
        getBalance: {

            /**
             * Calculate total balance of wallet for getting asset.
             * @param asset {Asset}
             * @returns {number} balance
             */

            value: function getBalance(asset) {
                var path = ["M/1/", "M/2/"],
                    self = this,
                    data = {},
                    d = 0;

                data.asset = asset.code;
                data.balance = 0;
                data.path = path[0];

                var _index = this.firstWithMoney,
                    _stopIndex = this.firstUnused;

                function findMoney(index, stopIndex) {
                    var accountList = [];

                    for (var i = index, l = 0; i < stopIndex; i++, l++) {
                        var derivedKey = self.hdk.derive(data.path + i);
                        accountList[l] = strEncode(HDWallet._version().accountId.str, derivedKey.publicKey);
                    }

                    if (accountList.length === 0) {
                        return toBluebirdRes(data.currentSum);
                    }

                    return HDWallet._checkAccounts(accountList, self._serverURL).then(function (respList) {
                        if (respList === 0 && d < self.indexList.length) {
                            _index = self.indexList[d];
                            _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());

                            data.path = path[1] + d + "/";
                            d++;
                            return findMoney(_index, _stopIndex);
                        } else if (respList === 0 && d >= self.indexList.length) return data.balance;

                        for (var i = 0; i < respList.length; i++) {
                            if (respList[i] !== -1) {
                                for (var j = 0; j < respList[i].length; j++) {
                                    if (respList[i][j].asset == data.asset) {
                                        data.balance += respList[i][j].balance;
                                    }
                                }
                            }
                        }

                        _index += HDWallet._lookAhead();
                        _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                        return findMoney(_index, _stopIndex);
                    });
                }

                return findMoney(_index, _stopIndex);
            }
        },
        serialize: {

            /**
             * Serialize HDWallet into Base32-encoded string.
             * < Key[32]||Chain[32]||1stWithMoney[4]||1stUnused[4]||listLen[4]||list[4*listLen]>
             * @returns {string} For example: WADDF3F6LSTEJ5PSQONOQ76G...
             */

            value: function serialize() {
                var ver = undefined,
                    listLen = this.indexList.length,
                    LEN = 76 + listLen * 4,
                    buffer = new Buffer(LEN);

                if (this.ver == HDWallet._version().mpriv.byte) {
                    this.seed.copy(buffer, 0);
                    ver = HDWallet._version().privWallet.str;
                } else if (this.verB == HDWallet._version().mpub.byte) {
                    this.hdk.publicKey.copy(buffer, 0);
                    ver = HDWallet._version().pubWallet.str;
                }

                this.hdk.chainCode.copy(buffer, 32);
                buffer.writeUInt32BE(this.firstWithMoney, 64);
                buffer.writeUInt32BE(this.firstUnused, 68);
                buffer.writeUInt32BE(listLen, 72);

                for (var i = 0, j = 0; i < listLen; i++, j += 4) {
                    buffer.writeUInt32BE(this.indexList[i], 72 + 4 + j);
                }
                return StellarBase.encodeWithoutPad(ver, buffer);
            }
        },
        doPayment: {

            /**
             * Create and submit transaction
             * @param invoice {*[]} Array of pair {accountID, amount}
             * @param asset {Asset} XDR.Asset
             * @returns {Promise.<TResult>|*}
             */

            value: function doPayment(invoice, asset) {
                var server = new Server(this._serverURL);
                return this.createTx(invoice, asset).then(function (txEnvelope) {
                    return server.submitTransaction(txEnvelope);
                });
            }
        },
        createTx: {

            /**
             * Create transaction
             * @param invoice {*[]} Array of pair {accountID, amount}
             * @param asset {Asset} XDR.Asset
             * @returns {Promise.<TResult>|*} txEnvelope
             */

            value: function createTx(invoice, asset) {
                var amount = 0;
                var self = this;
                for (var i = 0; i < invoice.length; i++) {
                    if (StellarBase.Keypair.isValidPublicKey(invoice[i].key) === false) throw new Error("Invalid public key in invoice list");
                    amount += invoice[i].amount;
                }

                return self.makeWithdrawalList(amount, asset).then(function (withdrawal) {
                    var paymentList = HDWallet._makePaymentList(invoice, withdrawal);
                    var keypair = HDKey.getHDKeyForSigning(paymentList[0].source),
                        server = new Server(self._serverURL);

                    return server.loadAccount(keypair.accountId()).then(function (account) {
                        var transaction = new StellarSdk.TransactionBuilder(account);
                        for (var i = 0; i < paymentList.length; i++) {
                            transaction.addOperation(StellarSdk.Operation.payment({
                                destination: paymentList[i].dest,
                                source: HDKey.getHDKeyForSigning(paymentList[i].source).accountId(),
                                asset: asset,
                                amount: paymentList[i].amount.toString()
                            }));
                        }
                        var txEnvelope = transaction.build();

                        for (var i = 0; i < withdrawal.length; i++) {
                            txEnvelope.sign(HDKey.getHDKeyForSigning(withdrawal[i].key));
                        }
                        return txEnvelope;
                    });
                });
            }
        },
        makeInvoiceList: {

            /**
             * Makes a list for getting amount.
             * @param amount {number} Amount.
             * @returns {*[]} Array of pair {accountID, amount}.
             */

            value: function makeInvoiceList(amount) {
                var path = undefined,
                    self = this,
                    data = {},
                    _index = this.firstUnused,
                    _stopIndex = HDWallet._lookAhead() + this.firstUnused;
                data.amount = amount;
                data.currentSum = 0;

                if (self.ver == HDWallet._version().mpriv.byte) {
                    path = "M/1/";
                } else if (self.ver == HDWallet._version().mpub.byte) {
                    path = "M/";
                } else throw new Error("Version of HDWallet mismatch");

                function makingList(index, stopIndex) {
                    var accountList = [],
                        list = [];
                    data.addend = [];
                    for (var i = index, l = 0; i < stopIndex; i++, l++) {
                        var derivedKey = self.hdk.derive(path + i);
                        accountList[l] = derivedKey.accountId();
                        data.addend.push(HDWallet._accountBalanceLimit());
                    }

                    return HDWallet._checkAccounts(accountList, self._serverURL).then(function (respList) {
                        if (respList === 0) {
                            data.accountList = accountList;
                        } else {
                            data.accountList = [];
                            for (var i = 0; i < respList.length; i++) {
                                if (respList[i] === -1) {
                                    data.accountList.push(accountList[i]);
                                }
                            }
                        }

                        if (HDWallet._sumCollecting(data, list) === true) {
                            return list;
                        }
                        _index += HDWallet._lookAhead();
                        _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                        return makingList(_index, _stopIndex);
                    });
                }
                return makingList(_index, _stopIndex);
            }
        },
        makeWithdrawalList: {

            /**
             * Makes a list from all branches to make a payment of a given amount.
             * @param amount {number}
             * @param asset {Asset}
             * @returns {*[]} Array of pair {accountID, amount}.
             */

            value: function makeWithdrawalList(amount, asset) {
                var path = ["m/1/", "m/2/"],
                    list = [],
                    self = this,
                    data = {},
                    d = 0;
                data.amount = amount;
                data.asset = asset.code;
                data.currentSum = 0;
                data.path = path[0];
                data.f_w_m = this.firstWithMoney;

                function completeList(_data) {
                    if (d >= self.indexList.length) {
                        return toBluebirdRej(new Error("Not enough money!"));
                    }return self._findMoneyInBranch(list, _data).then(function (result) {
                        if (result === amount) {
                            return list;
                        }

                        data.f_w_m = self.indexList[d];
                        data.path = path[1] + d + "/";
                        data.amount = amount - result;
                        d++;

                        return self._findMoneyInBranch(list, data);
                    });
                }

                return completeList(data);
            }
        },
        _findMoneyInBranch: {
            value: function _findMoneyInBranch(list, data) {
                var self = this,
                    _index = data.f_w_m,
                    _stopIndex = HDWallet._lookAhead() + _index;

                function makingList(index, stopIndex) {
                    var accountList = [],
                        privateKeyList = [];

                    for (var i = index, l = 0; i < stopIndex; i++, l++) {
                        var derivedKey = self.hdk.derive(data.path + i);
                        accountList[l] = strEncode(HDWallet._version().accountId.str, derivedKey.publicKey);
                        privateKeyList[l] = strEncode(HDWallet._version().mpriv.str, derivedKey.privateKey);
                    }
                    if (accountList.length === 0) {
                        return toBluebirdRes(data.currentSum);
                    }
                    return HDWallet._checkAccounts(accountList, self._serverURL).then(function (respList) {
                        if (respList === 0) {
                            return data.currentSum;
                        }
                        data.accountList = [];
                        data.addend = [];

                        for (var i = 0; i < respList.length; i++) {
                            if (respList[i] !== -1) {
                                for (var j = 0; j < respList[i].length; j++) {
                                    if (respList[i][j].asset == data.asset && respList[i][j].balance !== 0) {
                                        data.accountList.push(privateKeyList[i]);
                                        data.addend.push(respList[i][j].balance);
                                    }
                                }
                            }
                        }

                        if (HDWallet._sumCollecting(data, list) === true) {
                            return data.currentSum;
                        }
                        _index += HDWallet._lookAhead();
                        _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                        return makingList(_index, _stopIndex);
                    });
                }

                return makingList(_index, _stopIndex);
            }
        }
    }, {
        _version: {
            value: function _version() {
                return {
                    accountId: { byte: 48, str: "accountId" }, // "G" in base32
                    seed: { byte: 144, str: "seed" }, // "S" in base32
                    mpriv: { byte: 96, str: "mpriv" }, // "M" in base32
                    mpub: { byte: 120, str: "mpub" }, // "P" in base32
                    privWallet: { byte: 176, str: "privWallet" }, // "W" in base32
                    pubWallet: { byte: 200, str: "pubWallet" } }; // "Z" in base32
            }
        },
        _accountBalanceLimit: {
            value: function _accountBalanceLimit() {
                return 500;
            }
        },
        _branchAhead: {
            value: function _branchAhead() {
                return 5;
            }
        },
        _lookAhead: {
            value: function _lookAhead() {
                return 20;
            }
        },
        _maxIndex: {
            value: function _maxIndex() {
                return 2147000000;
            }
        },
        _maxListLen: {
            value: function _maxListLen() {
                return 50;
            }
        },
        setByPhrase: {

            /**
             * Decode mnemonic and create HDWallet by seed
             * @param str {string} Mnemonic phrase for example:
             *       "fix forget despair friendship blue grip ..."
             * @param url {string} server url
             * @returns {*}
             */

            value: function setByPhrase(str, url) {
                return this.setBySeed(decodeMnemo(str), url);
            }
        },
        setByStrKey: {

            /**
             * Check version of Base32 key, decode and setup HDWallet
             * @param str {string} Base32 key
             * @param url {string} server url
             * @returns {*}
             */

            value: function setByStrKey(str, url) {
                switch (str[0]) {
                    case "P":
                        {
                            var key = strDecode(this._version().mpub.str, str);
                            return this.setByMPublic(key, url);
                        }
                    case "S":
                        {
                            var key = strDecode(this._version().seed.str, str);
                            return this.setBySeed(key, url);
                        }
                    case "W":
                        {
                            var key = strDecode(this._version().privWallet.str, str);
                            return this._deserialize(this._version().mpriv.byte, key, url);
                        }
                    case "Z":
                        {
                            var key = strDecode(this._version().pubWallet.str, str);
                            return this._deserialize(this._version().mpub.byte, key, url);
                        }
                    default:
                        {
                            toBluebirdRej(new Error("Invalid version of StrKey"));
                        }
                }
            }
        },
        _deserialize: {

            /**
             * Deserialize HDWallet from serialized byteArray.
             * @param ver {number} version of HDWallet
             * @param wallet {object} ByteArray
             * Data Structure of serialized wallet
             * < Key[32]||Chain[32]||1stWithMoney[4]||1stUnused[4]||listLen[4]||list[4*listLen]>
             * @param url {string} server url
             * @returns {HDWallet}
             */

            value: function _deserialize(ver, wallet, url) {
                var hdw = new HDWallet(url),
                    listLen = undefined;
                hdw.ver = ver;
                hdw.hdk = {};
                hdw.indexList = [];
                hdw.hdk.versions = ver;
                hdw.seed = wallet.slice(0, 32);
                if (ver == this._version().mpriv.byte) hdw.hdk = hdw.hdk = genMaster(hdw.seed, this._version().mpriv.byte);else if (ver == this._version().mpub.byte) hdw.hdk.publicKey = wallet.slice(0, 32);

                hdw.hdk.chainCode = wallet.slice(32, 64);
                hdw.firstWithMoney = wallet.readUInt32BE(64, 68);
                hdw.firstUnused = wallet.readUInt32BE(68, 72);
                listLen = wallet.readUInt32BE(72, 76);
                if (listLen > this._maxListLen() || listLen * 4 + 76 > wallet.length + 5) throw new Error("Invalid serialized wallet");
                for (var i = 0, j = 0; i < listLen; i++, j += 4) {
                    hdw.indexList[i] = wallet.readUInt32BE(76 + j, 76 + 4 + j);
                }
                return toBluebirdRes(hdw);
            }
        },
        setBySeed: {

            /**
             * Create HDWallet from Seed
             * @param seed {object} Buffer or hexString
             * @param url {string} server url
             * @returns {HDWallet}
             */

            value: function setBySeed(seed, url) {
                var hdw = new HDWallet(url);
                if (typeof seed == "string") {
                    hdw.hdk = genMaster(new Buffer(seed, "hex"), this._version().mpriv.byte);
                    hdw.seed = new Buffer(seed, "hex");
                } else {
                    hdw.hdk = genMaster(seed, this._version().mpriv.byte);
                    hdw.seed = seed;
                }

                hdw.ver = this._version().mpriv.byte;
                return hdw.totalRefresh();
                // return this._setAllIndex(hdw);
            }
        },
        setByMPublic: {

            /**
             * Create HDWallet from decoded MasterPublicKey {chainCode, publicKey}
             * @param rawKey {object} Buffer
             * @param url {string} server url
             * @returns {HDWallet}
             */

            value: function setByMPublic(rawKey, url) {
                var hdw = new HDWallet(url);
                var mpub = new HDKey();
                mpub.versions = this._version().mpub.byte;
                mpub.chainCode = rawKey.slice(0, 32);
                mpub._setPublicKey(rawKey.slice(32, 64));
                hdw.ver = this._version().mpub.byte;
                hdw.hdk = mpub;
                return hdw.totalRefresh();
                // return this._setAllIndex(hdw);
            }
        },
        _updateBranchIndexes: {
            value: function _updateBranchIndexes(path, hdw, indexList) {
                var self = this;
                var _index = 0;
                var _stopIndex = this._branchAhead();
                var indexListLen = indexList.length;

                function indexing(index, stopIndex) {
                    if (indexListLen <= _index) indexList.push(0);

                    var indexPair = { f_w_m: indexList[index], f_u: indexList[index], indexingF_u: false };

                    return self._updateAddressIndexes(path + index + "/", hdw, indexPair).then(function (result) {
                        _index += 1;
                        if (_index >= stopIndex) return indexList.slice(0, indexList.length - self._branchAhead());

                        if (result === 0) return indexing(_index, _stopIndex);

                        _stopIndex = self._min(_index + self._branchAhead(), self._maxListLen());

                        if (indexPair.f_w_m !== -1 && indexList[index] <= indexPair.f_w_m) indexList[index] = indexPair.f_w_m;else if (indexList[index] <= indexPair.f_w_m) indexList[index] = 0;

                        return indexing(_index, _stopIndex);
                    });
                }
                return indexing(_index, _stopIndex);
            }
        },
        _updateAddressIndexes: {
            value: function _updateAddressIndexes(branchPath, hdw, indexPair) {
                var _index = this._min(indexPair.f_w_m, indexPair.f_u);
                var _stopIndex = this._lookAhead() + _index;
                var self = this;
                var temp = indexPair.f_w_m;
                indexPair.f_w_m = -1;
                indexPair.f_u = 0;

                function request() {
                    var accountList = [];
                    for (var index = _index, l = 0; index < _stopIndex; index++, l++) {
                        var derivedKey = hdw.hdk.derive(branchPath + index);
                        accountList[l] = strEncode(self._version().accountId.str, derivedKey.publicKey);
                    }

                    return self._checkAccounts(accountList, hdw._serverURL).then(function (respList) {
                        if (respList === 0) return 0;

                        var res = self._indexSetting(respList, indexPair);
                        if (indexPair.f_w_m < temp) indexPair.f_w_m = temp;

                        _index += self._lookAhead();
                        _stopIndex = _index + self._lookAhead();
                        request();
                    });
                }
                return request();
            }
        },
        _checkAccounts: {
            value: function _checkAccounts(request, url) {
                if (request.length === 0) toBluebirdRej("Invalid request - ", request);
                var server = new Server(url);
                return server.getBalances(request).then(function (response) {
                    var assets = response.assets;
                    if (assets.length === 0) return 0;
                    var responseList = request.slice();

                    assets.forEach(function (data) {
                        data.balances.forEach(function (account) {
                            var pos = request.indexOf(account.account_id);

                            if (typeof responseList[pos] == "string") responseList[pos] = [];
                            responseList[pos].push({
                                asset: data.asset.asset_code,
                                balance: parseInt(account.balance) });
                        });
                    });

                    for (var i = 0; i < responseList.length; i++) {
                        if (typeof responseList[i] == "string") {
                            responseList[i] = -1;
                        }
                    }
                    return responseList;
                });
            }
        },
        _indexSetting: {
            value: function _indexSetting(accountStatus, indexPair) {
                var resp = false;

                for (var index = 0; index < accountStatus.length; index++) {
                    if (accountStatus[index] == -1) {
                        continue;
                    }
                    if (accountStatus[index][0].balance >= 0 && indexPair.f_w_m === -1) {
                        indexPair.f_w_m = index;
                        resp = true;
                        if (indexPair.indexingF_u === false) {
                            indexPair.f_u = -1;
                            return resp;
                        }
                    }
                    indexPair.f_u = index + 1;
                }
                return resp;
            }
        },
        _sumCollecting: {
            value: function _sumCollecting(data, list) {
                for (var i = 0; i < data.accountList.length; i++) {
                    if (data.currentSum + data.addend[i] < data.amount) {
                        data.currentSum += data.addend[i];
                        list.push({
                            key: data.accountList[i],
                            amount: data.addend[i]
                        });
                    } else if (data.currentSum + data.addend[i] >= data.amount) {
                        var delta = data.amount - data.currentSum;
                        data.currentSum += delta;
                        list.push({
                            key: data.accountList[i],
                            amount: delta
                        });
                        return true;
                    }
                }
                return false;
            }
        },
        _makePaymentList: {
            value: function _makePaymentList(invoice, withdrawal) {
                var opList = [],
                    sentAmount = 0,
                    receivedAmount = 0,
                    sourceRest = 0,
                    destRest = 0;

                for (var wI = 0, iI = 0; wI < withdrawal.length;) {
                    var toSend = undefined;
                    if (sourceRest === 0) sourceRest = withdrawal[wI].amount;

                    if (destRest === 0) toSend = sourceRest;else if (destRest > sourceRest) toSend = sourceRest;else if (destRest <= sourceRest) toSend = destRest;

                    sentAmount += toSend;
                    opList.push({ dest: invoice[iI].key,
                        source: withdrawal[wI].key,
                        amount: toSend });

                    destRest = invoice[iI].amount - (toSend + receivedAmount);
                    receivedAmount += toSend;

                    if (sentAmount == withdrawal[wI].amount) {
                        sentAmount = 0;
                        sourceRest = 0;
                        wI++;
                    } else sourceRest = withdrawal[wI].amount - sentAmount;

                    if (receivedAmount == invoice[iI].amount) {
                        receivedAmount = 0;
                        destRest = 0;
                        iI++;
                    } else destRest = invoice[iI].amount - receivedAmount;
                }
                return opList;
            }
        },
        _makePaymentListOpt: {
            value: function _makePaymentListOpt(invoice, withdrawal) {
                var opList = [];

                for (var wI = 0, iI = 0; wI < withdrawal.length;) {
                    var op_amount = this._min(withdrawal[wI].amount, invoice[iI].amount);

                    opList.push({ dest: invoice[iI].key,
                        source: withdrawal[wI].key,
                        amount: op_amount });

                    withdrawal[wI].amount -= op_amount;
                    invoice[iI].amount -= op_amount;

                    if (withdrawal[wI].amount === 0) wI++;

                    if (invoice[iI].amount === 0) iI++;
                }

                return opList;
            }
        },
        _min: {
            value: function _min(a, b) {
                if (a < b) {
                    return a;
                } else {
                    return b;
                }
            }
        }
    });

    return HDWallet;
})();