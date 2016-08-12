"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

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

var BigNumber = _interopRequire(require("bignumber.js"));

var isString = _interopRequire(require("lodash/isString"));

var toBluebirdRes = require("bluebird").resolve;
var toBluebirdRej = require("bluebird").reject;

var ONE = 10000000;
var MAX_INT64 = "9223372036854775807";
var PRIVATEKEY_LENGTH = 32;
var PUBLICKEY_LENGTH = 32;
var CHAINCODE_LENGTH = 32;
var SEED_LENGTH = 32;
var MASTERPUBLIC_LENGTH = 64;
var SERIALIZE_LENGTH = 76; //Length of serialized wallet without index list

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
        totalRefresh: {

            /**
             * Setup all indexes in 0 and make Refresh of HDW.
             */

            value: function totalRefresh() {
                this.firstUnused = 0;
                this.firstWithMoney = 0;
                this.indexList = [];
                return this.refresh();
            }
        },
        refresh: {

            /**
             * Update all indexes of HDWallet.
             */

            value: function refresh() {
                var _this = this;

                var path = undefined,
                    indexPair = {};

                indexPair.f_w_m = this.firstWithMoney;
                indexPair.f_u = this.firstUnused;
                indexPair.indexingF_u = true;

                if (this.ver == HDWallet._version().mpriv.byte) {
                    path = HDWallet._path().own["public"];

                    return HDWallet._updateIndexesInOtherBranches(HDWallet._path().others["public"], this, this.indexList).then(function (list) {
                        _this.indexList = list.slice();

                        return HDWallet._updateIndexesInOwnBranch(path, _this, indexPair).then(function (resultPair) {
                            _this.firstWithMoney = resultPair.f_w_m;
                            _this.firstUnused = resultPair.f_u;

                            return _this;
                        });
                    });
                } else if (this.ver == HDWallet._version().mpub.byte) {
                    path = "M/";
                    return HDWallet._updateIndexesInOwnBranch(path, this, indexPair).then(function (resultPair) {
                        _this.firstWithMoney = resultPair.f_w_m;
                        _this.firstUnused = resultPair.f_u;

                        return _this;
                    });
                } else {
                    return toBluebirdRej(new Error("Version of HDWallet mismatch"));
                }
            }
        },
        getMPub: {

            /**
             * Return Base32 encoded MasterPublicKey
             * @param path {number} or {string}
             * @return {string}
             */

            value: function getMPub(path) {
                if (this.ver !== HDWallet._version().mpriv.byte) throw new Error("Version of HDWallet mismatch");

                if (typeof path == "number") {
                    return this.hdk.getMasterPub(HDWallet._path().others["public"] + path);
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
                if (this.ver !== HDWallet._version().mpriv.byte) throw new Error("Version of HDWallet mismatch");
                return this.getMPub(this.indexList.length);
            }
        },
        getBalance: {

            /**
             * Calculate total balance of wallet for getting asset.
             * @param asset {Asset}
             * @returns {string} balance
             */

            value: function getBalance(asset) {
                var path = [],
                    self = this,
                    data = {},
                    isPublic = false,
                    otherBranchIndex = 0;

                if (this.ver == HDWallet._version().mpriv.byte) path = [HDWallet._path().own["public"], HDWallet._path().others["public"]];else if (this.ver == HDWallet._version().mpub.byte) {
                    path = [HDWallet._path().self];
                    isPublic = true;
                }

                data.asset = asset.code;
                data.balance = new BigNumber(0);
                data.path = path[0];
                var _index = this.firstWithMoney,
                    _stopIndex = _index + HDWallet._lookAhead();

                function findMoney(index, stopIndex) {
                    var accountList = [];
                    for (var i = index, l = 0; i < stopIndex; i++, l++) {
                        var derivedKey = self.hdk.derive(data.path + i);
                        accountList[l] = strEncode(HDWallet._version().accountId.str, derivedKey.publicKey);
                    }

                    return HDWallet._checkAccounts(accountList, self._serverURL).then(function (respList) {
                        var currentBalance = data.balance;

                        for (var i = 0; i < respList.length; i++) {
                            if (respList[i][0].isValid === false) continue;

                            for (var j = 0; j < respList[i].length; j++) {
                                if (respList[i][j].asset.asset_code == data.asset) currentBalance = currentBalance.plus(respList[i][j].balance);
                            }
                        }

                        if (currentBalance.equals(data.balance)) {
                            if (isPublic === true) return HDWallet._fromAmount(currentBalance);

                            if (otherBranchIndex < self.indexList.length) {
                                _index = self.indexList[otherBranchIndex];
                                _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                                data.path = path[1] + otherBranchIndex + "/";
                                otherBranchIndex++;

                                return findMoney(_index, _stopIndex);
                            }
                            if (otherBranchIndex >= self.indexList.length) return HDWallet._fromAmount(currentBalance);
                        }

                        data.balance = currentBalance;
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
                    offset = 0,
                    listLen = this.indexList.length,
                    LEN = SERIALIZE_LENGTH + listLen * 4,
                    buffer = new Buffer(LEN);

                if (this.ver == HDWallet._version().mpriv.byte) {
                    this.seed.copy(buffer, offset);
                    ver = HDWallet._version().privWallet.str;
                    offset += PRIVATEKEY_LENGTH;
                } else if (this.verB == HDWallet._version().mpub.byte) {
                    this.hdk.publicKey.copy(buffer, offset);
                    ver = HDWallet._version().pubWallet.str;
                    offset += PUBLICKEY_LENGTH;
                }

                this.hdk.chainCode.copy(buffer, offset);
                offset += CHAINCODE_LENGTH;
                buffer.writeUInt32BE(this.firstWithMoney, offset);
                offset += 4;
                buffer.writeUInt32BE(this.firstUnused, offset);
                offset += 4;
                buffer.writeUInt32BE(listLen, offset);

                for (var i = 0, j = 0; i < listLen; i++, j += 4) {
                    buffer.writeUInt32BE(this.indexList[i], offset + 4 + j);
                }
                return StellarBase.encodeWithoutPad(ver, buffer);
            }
        },
        doPayment: {

            /**
             * Create and submit transaction.
             * @param invoice {*[]} Array of pair {accountID, amount}
             * @param asset {Asset} XDR.Asset
             * @returns {Promise.<TResult>|*}
             */

            value: function doPayment(invoice, asset) {
                if (this.ver !== HDWallet._version().mpriv.byte) {
                    return toBluebirdRej(new Error("Version of HDWallet mismatch"));
                }var server = new Server(this._serverURL);
                return this.createTx(invoice, asset).then(function (txEnvelope) {
                    return server.submitTransaction(txEnvelope);
                });
            }
        },
        createTx: {

            /**
             * Create transaction envelope.
             * @param invoice {*[]} Array of pair {accountID, amount}
             * @param asset {Asset} XDR.Asset
             * @returns {Promise.<TResult>|*} txEnvelope
             */

            value: function createTx(invoice, asset) {
                if (this.ver !== HDWallet._version().mpriv.byte) {
                    return toBluebirdRej(new Error("Version of HDWallet mismatch"));
                }var amount = new BigNumber(0);
                var self = this;
                for (var i = 0; i < invoice.length; i++) {
                    if (StellarBase.Keypair.isValidPublicKey(invoice[i].key) === false) {
                        return toBluebirdRej(new Error("Invalid invoice"));
                    }amount = amount.plus(invoice[i].amount);
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
                                amount: HDWallet._fromAmount(paymentList[i].amount)
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
             * @param strAmount {string} Amount.
             * @returns {*[]} Array of pair {accountID, amount}.
             */

            value: function makeInvoiceList(strAmount) {
                var path = undefined,
                    invoiceList = [],
                    amount = HDWallet._toAmount(strAmount),
                    index = this.firstUnused;

                if (this.ver == HDWallet._version().mpriv.byte) path = HDWallet._path().own["public"];else if (this.ver == HDWallet._version().mpub.byte) path = HDWallet._path().self;else throw new Error("Version of HDWallet mismatch");

                var numberOfAddresses = amount.divToInt(HDWallet._accountBalanceLimit()).toNumber();
                var piece = amount.mod(HDWallet._accountBalanceLimit());
                var stopIndex = numberOfAddresses + index;

                while (index < stopIndex) {
                    var derivedKey = this.hdk.derive(path + index);
                    invoiceList.push({
                        key: derivedKey.accountId(),
                        amount: HDWallet._accountBalanceLimit()
                    });
                    index++;
                }

                if (!piece.isZero()) {
                    var derivedKey = this.hdk.derive(path + index);
                    invoiceList.push({
                        key: derivedKey.accountId(),
                        amount: piece
                    });
                }

                return invoiceList;
            }
        },
        getKeysForAccountsWithMoney: {

            /**
            * Create list of pair private keys
            * and balances, for all accounts with money.
            * @returns {*[]} Array of pair {key, balances}
            */

            value: function getKeysForAccountsWithMoney() {
                if (this.ver !== HDWallet._version().mpriv.byte) {
                    return toBluebirdRej(new Error("Version of HDWallet mismatch"));
                }var path = [HDWallet._path().own["private"], HDWallet._path().others["private"]],
                    self = this,
                    otherBranchIndex = 0;
                var currentPath = path[0];
                var resultList = [];

                var _index = this.firstWithMoney,
                    _stopIndex = _index + HDWallet._lookAhead();

                function findMoney(index, stopIndex) {
                    var accountList = [];
                    var privateKeyList = [];

                    for (var i = index, l = 0; i < stopIndex; i++, l++) {
                        var derivedKey = self.hdk.derive(currentPath + i);
                        accountList[l] = strEncode(HDWallet._version().accountId.str, derivedKey.publicKey);
                        privateKeyList[l] = strEncode(HDWallet._version().mpriv.str, derivedKey.privateKey);
                    }

                    return HDWallet._checkAccounts(accountList, self._serverURL).then(function (respList) {
                        var isEmpty = true;
                        for (var i = 0; i < respList.length; i++) {
                            var balances = [];
                            if (respList[i][0].isValid === false) continue;
                            isEmpty = false;

                            for (var j = 0; j < respList[i].length; j++) {
                                if (respList[i][j].balance.isZero() === true) continue;
                                balances.push({ asset: respList[i][j].asset,
                                    balance: HDWallet._fromAmount(respList[i][j].balance) });
                            }

                            if (balances.length !== 0) resultList.push({ key: privateKeyList[i], balances: balances });
                        }

                        if (isEmpty === true) {
                            if (otherBranchIndex < self.indexList.length) {
                                _index = self.indexList[otherBranchIndex];
                                _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                                currentPath = path[1] + otherBranchIndex + "/";
                                otherBranchIndex++;

                                return findMoney(_index, _stopIndex);
                            }
                            if (otherBranchIndex >= self.indexList.length) return resultList;
                        }

                        _index += HDWallet._lookAhead();
                        _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                        return findMoney(_index, _stopIndex);
                    });
                }

                return findMoney(_index, _stopIndex);
            }
        },
        getAccountIdsWithMoney: {

            /**
            * Create list of accountId and balances,
            * for all accounts with money.
            * @returns {*[]} Array of pair {account_id, balances}
            */

            value: function getAccountIdsWithMoney() {
                var path = [],
                    self = this,
                    isPublic = false,
                    otherBranchIndex = 0;

                var resultList = [];

                if (this.ver == HDWallet._version().mpriv.byte) path = [HDWallet._path().own["public"], HDWallet._path().others["public"]];else if (this.ver == HDWallet._version().mpub.byte) {
                    path = [HDWallet._path().self];
                    isPublic = true;
                }

                var currentPath = path[0];
                var _index = this.firstWithMoney,
                    _stopIndex = _index + HDWallet._lookAhead();

                function findMoney(index, stopIndex) {
                    var accountList = [];

                    for (var i = index, l = 0; i < stopIndex; i++, l++) {
                        var derivedKey = self.hdk.derive(currentPath + i);
                        accountList[l] = strEncode(HDWallet._version().accountId.str, derivedKey.publicKey);
                    }

                    return HDWallet._checkAccounts(accountList, self._serverURL).then(function (respList) {
                        var isEmpty = true;

                        for (var i = 0; i < respList.length; i++) {
                            var balances = [];
                            if (respList[i][0].isValid === false) continue;
                            isEmpty = false;

                            for (var j = 0; j < respList[i].length; j++) {
                                if (respList[i][j].balance.isZero() === true) continue;
                                balances.push({ asset: respList[i][j].asset,
                                    balance: HDWallet._fromAmount(respList[i][j].balance) });
                            }

                            if (balances.length !== 0) resultList.push({ account_id: accountList[i], balances: balances });
                        }

                        if (isEmpty === true) {
                            if (isPublic === true) return resultList;

                            if (otherBranchIndex < self.indexList.length) {
                                _index = self.indexList[otherBranchIndex];
                                _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                                currentPath = path[1] + otherBranchIndex + "/";
                                otherBranchIndex++;

                                return findMoney(_index, _stopIndex);
                            }
                            if (otherBranchIndex >= self.indexList.length) return resultList;
                        }

                        _index += HDWallet._lookAhead();
                        _stopIndex = HDWallet._min(_index + HDWallet._lookAhead(), HDWallet._maxIndex());
                        return findMoney(_index, _stopIndex);
                    });
                }

                return findMoney(_index, _stopIndex);
            }
        },
        makeWithdrawalList: {

            /**
             * Makes a list from all branches to make a payment of a given amount.
             * @param amount {Big}
             * @param asset {Asset}
             * @returns {*[]} Array of pair {accountID, amount}.
             */

            value: function makeWithdrawalList(amount, asset) {
                if (this.ver !== HDWallet._version().mpriv.byte) {
                    return toBluebirdRej(new Error("Version of HDWallet mismatch"));
                }var path = [HDWallet._path().owh["private"], HDWallet._path().others["private"]],
                    withdrawalList = [],
                    self = this,
                    data = {},
                    otherBranchIndex = 0;
                data.amount = amount;
                data.asset = asset.code;
                data.currentSum = new BigNumber(0);
                data.path = path[0];
                data.f_w_m = this.firstWithMoney;

                function completeList(_data) {

                    if (otherBranchIndex > self.indexList.length) {
                        return toBluebirdRej(new Error("Not enough money!"));
                    }return self._findMoneyInBranch(withdrawalList, _data).then(function (result) {
                        if (result.equals(data.amount)) return withdrawalList;

                        data.f_w_m = self.indexList[otherBranchIndex];
                        data.path = path[1] + otherBranchIndex + "/";
                        otherBranchIndex++;

                        return completeList(data);
                    });
                }

                return completeList(data);
            }
        },
        _findMoneyInBranch: {
            value: function _findMoneyInBranch(withdrawalList, data) {
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

                    return HDWallet._checkAccounts(accountList, self._serverURL).then(function (respList) {
                        data.accountList = [];
                        data.balance = [];

                        for (var i = 0; i < respList.length; i++) {
                            if (respList[i][0].isValid === false) continue;

                            for (var j = 0; j < respList[i].length; j++) {
                                if (respList[i][j].asset.asset_code == data.asset && !respList[i][j].balance.isZero()) {
                                    data.accountList.push(privateKeyList[i]);
                                    if (respList[i][j].balance.gt(HDWallet._accountBalanceLimit())) data.balance.push(HDWallet._accountBalanceLimit());else data.balance.push(respList[i][j].balance);
                                }
                            }
                        }

                        if (data.accountList.length === 0) return data.currentSum;

                        if (HDWallet._sumCollecting(data, withdrawalList) === true) return data.currentSum;

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
        _path: {
            value: function _path() {
                return {
                    own: { "private": "m/1/", "public": "M/1/" },
                    others: { "private": "m/2/", "public": "M/2/" },
                    self: "M/" };
            }
        },
        _accountBalanceLimit: {
            value: function _accountBalanceLimit() {
                return new BigNumber("500").mul(ONE);
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
                return this.setByRawSeed(decodeMnemo(str), url);
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
                            return this.setByRawSeed(key, url);
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
                    listLen = undefined,
                    offset = 0;
                hdw.ver = ver;
                hdw.hdk = {};
                hdw.indexList = [];
                hdw.hdk.versions = ver;

                if (ver == this._version().mpriv.byte) {
                    hdw.seed = wallet.slice(offset, SEED_LENGTH);
                    hdw.hdk = hdw.hdk = genMaster(hdw.seed, this._version().mpriv.byte);
                    offset += SEED_LENGTH;
                } else if (ver == this._version().mpub.byte) {
                    hdw.hdk.publicKey = wallet.slice(offset, PUBLICKEY_LENGTH);
                    offset += PUBLICKEY_LENGTH;
                }

                hdw.hdk.chainCode = wallet.slice(offset, offset + CHAINCODE_LENGTH);
                offset += CHAINCODE_LENGTH;
                hdw.firstWithMoney = wallet.readUInt32BE(offset, offset + 4);
                offset += 4;
                hdw.firstUnused = wallet.readUInt32BE(offset, offset + 4);
                offset += 4;
                listLen = wallet.readUInt32BE(offset, offset + 4);
                offset += 4;

                if (listLen > this._maxListLen() || listLen * 4 + offset > wallet.length + 5) {
                    return toBluebirdRej(new Error("Invalid serialized wallet"));
                }for (var i = 0, j = 0; i < listLen; i++, j += 4) {
                    hdw.indexList[i] = wallet.readUInt32BE(offset + j, offset + 4 + j);
                }
                return toBluebirdRes(hdw);
            }
        },
        setByRawSeed: {

            /**
             * Create HDWallet from Seed
             * @param seed {object} Buffer or hexString
             * @param url {string} server url
             * @returns {HDWallet}
             */

            value: function setByRawSeed(seed, url) {
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
                mpub.chainCode = rawKey.slice(0, CHAINCODE_LENGTH);
                mpub._setPublicKey(rawKey.slice(CHAINCODE_LENGTH, MASTERPUBLIC_LENGTH));
                hdw.ver = this._version().mpub.byte;
                hdw.hdk = mpub;
                return hdw.totalRefresh();
            }
        },
        _updateIndexesInOtherBranches: {
            value: function _updateIndexesInOtherBranches(path, hdw, indexList) {
                var self = this;
                var _index = 0;
                var _stopIndex = this._branchAhead();
                var indexListLen = indexList.length;

                function indexing(index, stopIndex) {
                    if (indexListLen <= _index) indexList.push(0);

                    var indexPair = { f_w_m: indexList[index], f_u: indexList[index], indexingF_u: false };

                    return self._updateIndexesInOwnBranch(path + index + "/", hdw, indexPair).then(function (resultIndexPair) {
                        _index += 1;

                        if (_index >= stopIndex) return indexList.slice(0, indexList.length - self._branchAhead());

                        if (resultIndexPair.f_u === 0) return indexing(_index, _stopIndex);

                        indexList[index] = resultIndexPair.f_w_m;

                        _stopIndex = self._min(_index + self._branchAhead(), self._maxListLen());

                        return indexing(_index, _stopIndex);
                    });
                }
                return indexing(_index, _stopIndex);
            }
        },
        _updateIndexesInOwnBranch: {
            value: function _updateIndexesInOwnBranch(branchPath, hdw, indexPairOld) {
                var _index = this._min(indexPairOld.f_w_m, indexPairOld.f_u);
                var _stopIndex = this._lookAhead() + _index;
                var self = this;
                var f_w_mFound = false;
                var indexPair = {};

                indexPair.f_w_m = _index;
                indexPair.f_u = 0;
                indexPair.indexingF_u = indexPairOld.indexingF_u;

                function request() {
                    var accountList = [];
                    for (var i = _index, l = 0; i < _stopIndex; i++, l++) {
                        var derivedKey = hdw.hdk.derive(branchPath + i);
                        accountList[l] = strEncode(self._version().accountId.str, derivedKey.publicKey);
                    }

                    return self._checkAccounts(accountList, hdw._serverURL).then(function (respList) {
                        for (var i = 0; i < respList.length; i++) {
                            if (respList[i][0].isValid === false) continue;

                            if (!respList[i][0].balance.isZero() && f_w_mFound === false) {
                                indexPair.f_w_m = _index + i;
                                f_w_mFound = true;
                                if (indexPair.indexingF_u === false) {
                                    indexPair.f_u = -1;
                                    return indexPair;
                                }
                            }
                            indexPair.f_u = _index + i + 1;
                        }

                        if (indexPair.f_u <= _index) {
                            return indexPair;
                        }

                        _index += self._lookAhead();
                        _stopIndex = _index + self._lookAhead();
                        return request();
                    });
                }
                return request();
            }
        },
        _checkAccounts: {
            value: function _checkAccounts(request, url) {
                if (request.length === 0) toBluebirdRej("Invalid request");
                var server = new Server(url);
                return server.getBalances(request).then(function (response) {
                    var assets = response.assets;
                    var responseList = request.slice();

                    assets.forEach(function (data) {
                        data.balances.forEach(function (account) {
                            var pos = request.indexOf(account.account_id);

                            if (typeof responseList[pos] == "string") responseList[pos] = [];
                            responseList[pos].push({
                                isValid: true,
                                asset: data.asset,
                                balance: HDWallet._toAmount(account.balance) });
                        });
                    });

                    for (var i = 0; i < responseList.length; i++) {
                        if (typeof responseList[i] == "string") {
                            responseList[i] = [{ isValid: false }];
                        }
                    }
                    return responseList;
                });
            }
        },
        _sumCollecting: {
            value: function _sumCollecting(data, list) {
                for (var i = 0; i < data.accountList.length; i++) {
                    if (data.currentSum.plus(data.balance[i]).lessThan(data.amount)) {
                        data.currentSum = data.currentSum.plus(data.balance[i]);
                        list.push({
                            key: data.accountList[i],
                            amount: data.balance[i]
                        });
                    } else if (data.currentSum.plus(data.balance[i]).gte(data.amount)) {
                        var delta = data.amount.minus(data.currentSum);
                        data.currentSum = data.currentSum.plus(delta);
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
                var opList = [];

                for (var wI = 0, iI = 0; wI < withdrawal.length;) {
                    var op_amount = this._minAmount(withdrawal[wI].amount, invoice[iI].amount);

                    opList.push({ dest: invoice[iI].key,
                        source: withdrawal[wI].key,
                        amount: op_amount });

                    withdrawal[wI].amount = withdrawal[wI].amount.minus(op_amount);
                    invoice[iI].amount = invoice[iI].amount.minus(op_amount);

                    if (withdrawal[wI].amount.isZero()) wI++;

                    if (invoice[iI].amount.isZero()) iI++;
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
        },
        _minAmount: {
            value: function _minAmount(a, b) {
                if (a.lessThan(b)) {
                    return a;
                } else {
                    return b;
                }
            }
        },
        _isValidAmount: {
            value: function _isValidAmount(value) {
                if (!isString(value)) {
                    return false;
                }

                var amount = undefined;
                try {
                    amount = new BigNumber(value);
                } catch (e) {
                    return false;
                }

                // < 0
                if (amount.isNegative()) {
                    return false;
                }

                // > Max value
                if (amount.times(ONE).greaterThan(new BigNumber(MAX_INT64).toString())) {
                    return false;
                }

                // Decimal places (max 7)
                if (amount.decimalPlaces() > 7) {
                    return false;
                }

                // Infinity
                if (!amount.isFinite()) {
                    return false;
                }

                // NaN
                if (amount.isNaN()) {
                    return false;
                }

                return true;
            }
        },
        _toAmount: {
            value: function _toAmount(value) {
                if (this._isValidAmount(value)) {
                    return new BigNumber(value).mul(ONE);
                }throw new Error("Invalid amount - " + value + "!");
            }
        },
        _fromAmount: {
            value: function _fromAmount(value) {
                return new BigNumber(value).div(ONE).toString();
            }
        }
    });

    return HDWallet;
})();