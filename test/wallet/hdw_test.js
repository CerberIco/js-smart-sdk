import * as StellarBase from "stellar-base";
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

var constSeed = [
        'f009af50a4c9f7b71e882b3dc9a59d27fcda45b8d47699f62d9774f5a2657b6e',
        '81a44b7ec5a6031b9f9f3541da7b6364111662926138495a22bde926a2d50dae',
        'bfea385b80c34a92c77ce08598c49d9594ee586cb5cdaefe70ce2d0ba6b36c35',
        '847a73ca5b83518d4f2ee31ce53cf8f05fc80bc9ba2d294c37da17e4636fb517',
        'd96feb1b93b4dba39ba15b1130e060ea1b35a0b58b182f32c70d018177afe69f',
        '7191736c9fa2f865302e0972b238403dc6f26cdcc649c0fb339b72eff06b52fb' ],
    constPhrase = [
        'fact endless enjoy corner gas sink other bowl sport nobody agony uncle box everybody tool ahead illuminate weep study pulse stand pie cast land',
        'bloom yeah process after bone once queen lonely aim into struggle suddenly hop music anger grip expect yearn loose petal made frost both bathroom',
        'clearly pink rock glide common conversation stone moon terrible chase indeed stuff spiral home lesson train truly dude grow terrible barely clutch further book',
        'grip under judge show howl guess idiot bother mourn hill still glorious orange weak adore anymore butterfly somehow parent burst expression completely lust stir',
        'despair lady remain chin shine tangle soldier today bliss weave mother pure witch attempt powerful master run honest drift struggle rose buy tell pack',
        'desert glance mock throne just await social warn sob fault stomach friend kingdom metal clear curve scale stole too tremble bee center moon lip' ],
    constSerWallet = [
        "WDYATL2QUTE7PNY6RAVT3SNFTUT7ZWSFXDKHNGPWFWLXJ5NCMV5W5ZO3W44MV4ZCGWZBKTDP7Q6G4ZIXMFNQTCJT5GH3OYDTRZ6H2ZGTAAAAAAAAAAAAAAAAAABAAAAAAIAAAABLAAAAAAAAAAAAAC2T",
        "WCA2IS36YWTAGG47T42UDWT3MNSBCFTCSJQTQSK2EK66SJVC2UG24VNIBSRS6UIN2CPFRFXMSKO3SSJBRYPNBDLYZM4QYN4XFT7MV3V3AAAAAAYAAAABUAAAAAAAAAAAAAAABTP2",
        "WC76UOC3QDBUVEWHPTQILGGETWKZJ3SYNS243LX6ODHC2C5GWNWDKU5XLAXOGGJV3TR63VG2DW4WULFYKTEPAJPA6ZANMI6W6TK6SXJZAAAAAAAAAAAAAAAAAAWQAAAAFUAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAEAAAAACAAAAAAAAAAAAHAAAAAAAAAAAASAAAAAAAAAAAAAAAAAABAAAAABYAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAADQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAACEAAAAAAAAAAAAAAAAAAAAAAAAOQAAAAAAAABJCJ",
        "WCCHU46KLOBVDDKPF3RRZZJ47DYF7SALZG5C2KKMG7NBPZDDN62RONM5P6XZI33IKKZ4AL3TTXZYVPBKXITVXSJLH4G6OWVWKVRERKOBAAAAACQAAAACGAAAAANQAAAADMAAAAAAAAAAADIAAAAAAAAAAAAAAAAADQAAAABAAAAAABQAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAABEAAAAAAAAAAABQAAAAAAAAAAACIAAAAAMAAAAAGQAAAAEEAAAAAAAAAAAAAAAAAAAAAAAAAQAAAABYAAAAAAAAAAAIYAAAAAB7RS",
        "WDMW72Y3SO2NXI43UFNRCMHAMDVBWNNAWWFRQLZSY4GQDALXV7TJ6OZGSRLOPM6VJ3AHXBESOS6DQBLBF6BPHAEC2W4KUNTTJCPCNLX4AAAAADIAAAAD2AAAAADAAAAAAYAAAAAAAAAAABYAAAAAAAAAAAAAAAAAGEAAAAABAAAABUOE",
        "WBYZC43MT6RPQZJQFYEXFMRYIA64N4TM3TDETQH3GONXF37QNNJPWZKWUTZHVG3RCW5QSTVCXYR6UX3HI3V3R37CWIQIUYHTK62Q7B5LAAAAAAAAAAAAAAAAAAGAAAAABQAAAAAIAAAAABIAAAAAAAAAAAKQAAAAAAAAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFYAAAAABRMP"
    ];

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
        for (let i = 0; i < 6; i++)
            phrase[i] = constPhrase[i];
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
                            expect(bufferCompare(hdw.seed, new Buffer(constSeed[i], "hex"))).to.equal(true);
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
                            // console.log("ser wallet", serWallet);
                            expect(serWallet).to.equal(constSerWallet[i]);
                            return hdw.refresh();
                        })
                        .then(hdw => {
                            let serWallet = hdw.serialize();
                            expect(serWallet).to.equal(constSerWallet[i]);
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
            seed[i] = new Buffer(constSeed[i], "hex");
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
        let testPhrase = [
            'answer possess fix slowly happy hum character simply country suddenly grand teach hurt dim too concern ring cigarette score deep awaken thought stab save',
            'paper master apologize fantasy treasure open mold bite fix dim dim innocence chest broken peer stand drove tremble replace mourn blink milk check sorry',
            'present movement creature deal crush pay creek surely chase shadow angry sorry wipe dress bottle bench couch job then goose blood horizon sister climb'
        ];
        let amount = ["248", "3939", "2190" ];

        let listConst = {
            invoice: [
                [ { key: 'GANSCSGKB24YWJZFHIXTS6WIGNJ7PDFCYD5TJ4GC6WQQRAVVHFCWZB6S',
                    amount:'248'} ],

                [ { key: 'GD3MTFXP6QOPNOEAFMBVGROG2XYUJNUTPJNCGGLLN2RHXPHW6U6KSKQP',
                    amount:'500' },
                    { key: 'GCRXQYKYWQJKRWKNAX736BCE6FEDSJL6S7DKCZUZYKWQA7PCB27IXVHR',
                        amount:'500' },
                    { key: 'GB4777MPHV6GX2NT5E2PBS53LLSXT6GD6IP5WQ2UUDTE2GEMJ6ZLSFSM',
                        amount:'500' },
                    { key: 'GCKOSLASXPH2GFVDAZL7KLT3IK55YCCD6IXBU5OAK6IEZ6DPZBGW5V3A',
                        amount:'500' },
                    { key: 'GAF2H6AYJGO6TR56EVT6I5JSRZG4VROOPZF2DEW4AMJJ5WEUE4WAHONJ',
                        amount:'500' },
                    { key: 'GB7NQC4BQNKH6RZOHVDHVYAXCJVILRIEUOWSGQQU7NNKG3VYMT23OC74',
                        amount:'500' },
                    { key: 'GCVOZ6AAKP7STDNB3KZVUMG2NZ75S3RKHE7UOYCM6ERHOIHT5ZXT6Y3Z',
                        amount:'500' },
                    { key: 'GCYV5DC6UVLFNGMOPRU57SWKEDSQEQ6IAYJ2Y2PPQD5BCPRE7VLC7Q3Y',
                        amount:'439' } ],

                [ { key: 'GCB6BC3ZL4ZYOU6KVAP5ZZGP3N4QOLQDCX5LSKYCVQDDBP32XC335RSP',
                    amount:'500' },
                    { key: 'GBA7WEHQUAI75VO6I42QJDBL6UY2MV2HUTLFD5BZVREVSQDGBE4FZWVX',
                        amount:'500' },
                    { key: 'GBRQF3JLVRPUVYF22P27U6RLGYSGAHOKISJ75FWKZR3AVZHW3GRDA5UY',
                        amount:'500' },
                    { key: 'GAX5VWIMYTCDSBW5X54ULBQVXNB4RKBMGMTTVWB2IBFHTCV4ZLLSGSXY',
                        amount:'500' },
                    { key: 'GAR6NGWABLFZGY2S7AUMKRYYVMXE3FEULRXBCOCU3CE2IJ7PJN4WJ3R4',
                        amount:'190' } ]
            ],

            withdrawal: [
                [   { key: 'MB4CU2UQPJ7MZREKOQC6BEBZCHKR4JNGPSY242VNLSTZAMEQTQMGLS5J',
                    amount:'205' },
                    { key: 'MBEF47WTVRIVEQBCAISQQE5O3GZ7IFEKU3HSZD3SZDPK6QDPLKRWTQC2',
                        amount:'13' },
                    { key: 'MCAKZGKCUXCIUCZ6TSAXG6POMJ5JJGDXRHYQR3QM7OW3UEJTDY2GTMHK',
                        amount:'30' } ],

                [ { key: 'MBQBXROO6HP6JHPMNNJZ6OFN4R3YPIE26EZSROIEAD5NIYEYW5NWAUC3',
                    amount:'45' },
                    { key: 'MAQOH6ZILH3D3WJAZIJC32KTY7IJQUCAWYK2ITD7LHBHFL4HGIQFUQHT',
                        amount:'173' },
                    { key: 'MC4GX7X3NXZT2CKXW75VM4H6TG2L7L7MKKZSKVZ3DZPEETXTGE2FSI77',
                        amount:'109' },
                    { key: 'MCUPURDCUFIB7DWRCHWCQF7VBRRRPCAMYYRPEZWEMHTQLYFL7NAV65XV',
                        amount:'141' },
                    { key: 'MAEBHFIMYC6PQI7RSA3KKWJK4JFYPTLR4HOI5HDFECD3UFUH7DTVXGPV',
                        amount:'13' },
                    { key: 'MAICWOLUGHB5B7E4R7MVBDHGZTJPQ33HINSQSZJ2P54HQMNTXQRWA6MH',
                        amount:'173' },
                    { key: 'MAUINGFWE73PNYUBO6ILNSAMMKBSOIYHMK5CY6AFAIX46H2B3KUVQBQT',
                        amount:'141' },
                    { key: 'MAAEEZ3TDGMUZP6VCGQU724I4SYC5F5F3L6B35S3PWN537OAKUZFMMVM',
                        amount:'13' },
                    { key: 'MBMMADT5AMY2VURBMS6UMVLD57JHEILPW67NSZ5P5MDJAX3JGE5V2K46',
                        amount:'45' },
                    { key: 'MB4CK3PYLQFQW44TT5CMHAZIRBDCC6WBKJ3AOXRFHOCBBK4ONPCV5LQZ',
                        amount:'13' },
                    { key: 'MCYJJO2Z5VOR7RW644YITVXWP4HJKALOT7UDEI4M65PPEKVYIF5FZXNM',
                        amount:'173' },
                    { key: 'MBYF4F233AOZBAKEMNLAZU5IUKSJJSJE4PJH26EUYLLF6KDRSCNWF5KQ',
                        amount:'173' },
                    { key: 'MD4BAISDYBBMSOBI2JLPOBXLE274EMJFJFR52IW444SMFC4YUHCFY7XH',
                        amount:'109' },
                    { key: 'MCEIDZ4I7GXMUTFKL7MPXSXO4EO27DZ23O6DXREZBNF46KWNZEQFZMKG',
                        amount:'173' },
                    { key: 'MAQAB7BAXPHOEJR74DH7EPKFLWWZ6O4TF2VVHARKTXE5EFLPKVPV7GPF',
                        amount:'45' },
                    { key: 'MCUEVSBQYY4C32K6D45WKUXXB3Q2GZW4HSEH25QBNIYACPIWQ3WFRDPI',
                        amount:'205' },
                    { key: 'MDIHJKGAVTDDMS7ZB7GXD4UQKHJ5DQ3NGK7VKTOKN7NCS4REWJCFVVHP',
                        amount:'173' },
                    { key: 'MDUHPGL3BXB3IDSTWIVUTWXSV6F6R5XXRRT5IKY47C3MNQENDLLFWQT3',
                        amount:'205' },
                    { key: 'MBYMZ7YGH2AQ6XXJHSMO7GU7QEXLM2POABV7VA5E57KRVS2MUGJF3GN5',
                        amount:'205' },
                    { key: 'MCAE2LD65CT4WOGLQFANGGBZB77NEDRCWBFL5DDPJSR76XZJBBXVXLPC',
                        amount:'237' },
                    { key: 'MDYGV7LCYQMPJAXYPHDMUAV46RLTDIBPDKYDXS6DO4THCNOXNYIFXAPW',
                        amount:'173' },
                    { key: 'MDMJAQRJ57VAT7SG5KGWBRGN2LOI4LHTCIGBDJW2QH7GG5TAEIJVWVRM',
                        amount:'205' },
                    { key: 'MBEOM5NLEA2H7NYDDWDFE52SZLJT7Z37GQVVKJAMW24AEYIGPCXVZFRU',
                        amount:'77' },
                    { key: 'MC4LSRPVOZ4U4XMMOSZX7Z3XKTO6T6JWO6RS6FH56424TCPEW6JVWN66',
                        amount:'141' },
                    { key: 'MDUFLK5UV774LFET4SL25F542BO7B5DMKF6UZU5NVKDLIQWJL5KFXRAQ',
                        amount:'205' },
                    { key: 'MCIK6R4EQLKTDBJIX6E7MNAPDAOSI3WE2WGCBMHRIRLOSYPKL2ZF5YAQ',
                        amount:'237' },
                    { key: 'MAMARAIJF6DQBTMAHWYAXHI4AWOBOT3RFEVMKVKIAVXBKXKR264FYGRY',
                        amount:'45' },
                    { key: 'MBQM5ORIIQ2ZCMRY5CLNP4IEIG4VY5RJFUYSEBWSK7IXPT6ZZF2VZI2V',
                        amount:'237' },
                    { key: 'MA4FVAKO3LWBO74WMAOVL7HYNMBEATCZB2T33Y5RJTZL2VJW2MMF3XEX',
                        amount:'55' } ],

                [ { key: 'MDMEC7VYQ7LWOQLPGPUUHCPIXUHB6F7Z6SH2243SHWSQQVAT2IPWIW3Z',
                    amount:'205' },
                    { key: 'MDECINPM53WUA44XJDOW4EGBH4277AKGYJ7E3HOAUGH45ZAZHKHWEZWI',
                        amount:'109' },
                    { key: 'MCUMN3SBXPW43JZU2RA5MZERWVI7WFFBY22OGXBOADLHNJZBKHBGL2M7',
                        amount:'13' },
                    { key: 'MAIBRK5OWOJPJMAGHM22U5Y4SSR3YR4XJQZCPOPD5V6LICBEJZNWEFZ4',
                        amount:'173' },
                    { key: 'MBIAMMPX5DKNOY24OJDZOC2BSHQPMNDUSWTJFMAQIYFE2HGMAULGX32G',
                        amount:'237' },
                    { key: 'MD4PZVWRCTETR763KIFHDIFVAG56DKHHUOAH2FNDSIHCVXDWUQQWX2TB',
                        amount:'45' },
                    { key: 'MDMEZJC555OOJDIKSWRZZS5RATPOWRMDRKJVEKQAZ6K5EZCZTX3GJ65B',
                        amount:'45' },
                    { key: 'MBIGU2EJYAWFVOJ5UY4JHJ4ISR2PLP4A2M2S4SFDNIWFMQBAVQJGIXKZ',
                        amount:'141' },
                    { key: 'MAILIZTGQNCDNLE3WJZ3CAOWITGIGR2QXPAIBGDNAM4MPB3VPLDGLW4I',
                        amount:'109' },
                    { key: 'MAQMIWICZAG2XB4OHRDGQDRL556POA5D2PRGPELUZZ2QIX4JFSQGDV4A',
                        amount:'141' },
                    { key: 'MAYEH44YYLOVKFMCSRL4VPA2TBAD4SX6EUYYDNFKTHMGJEBXW74GT4GG',
                        amount:'45' },
                    { key: 'MB4PPHRH2SYAT6DXDB2EKAIPMMG3UW6W6V6VEDRT7EKMNWY4BGDGI7IO',
                        amount:'77' },
                    { key: 'MBAFC7SRXWRK3CGTZYMARGJ45LDZEDMLMURLTSVEQTHO5YEQDU6GMWE5',
                        amount:'13' },
                    { key: 'MAQGBWJZCFTXRXOY4ZSN454S27VEBYZMWXSUCTRVJ5I2QLNYLZYWPIEF',
                        amount:'173' },
                    { key: 'MC4N4OHKMIRUVVON7TXW5RKMW4FA4KLHZPAQEKNGY52KTE6TPQLGSDFH',
                        amount:'173' },
                    { key: 'MDINP7MIIFOZV3NWZD3EVCD27GBDYG7CPWQJ24YF47QYC6RKWPJGRBA4',
                        amount:'109' },
                    { key: 'MCELTVY2PFOEYBMLRWD72XSID3WDN3XIHHQ37NJZ6HBPFFCU5DJWDVXY',
                        amount:'141' },
                    { key: 'MBYE5LWF5MBCABL4OFMLFCXMOB2GGXMM35XUWNX2U2HAJGM6KL7WFDW5',
                        amount:'45' },
                    { key: 'MBAJWFIEAEGDVGOIC6ZVASPAM564XLXVJVYUW2I4TKW7H7PEO3HV63FF',
                        amount:'45' },
                    { key: 'MCUAMBGDAZDC44YZJY4C2X6IRVD65ALFKWUHHV2XCQQX7ZKRWINWPZ2T',
                        amount:'109' },
                    { key: 'MDMM5LDJ37CA7KKRJMQA7E6L54Q45JE2VODKDJRUDB2ITRQ2QXHGNIBU',
                        amount:'42' } ]
            ] };


        beforeEach(function (done) {
            // console.log('Before called');
            sinon.stub(StellarSdk.Server.prototype, "getBalances", makeResponseList);
            done();
        });

        it("Making correct Invoice/Withdrawal list", function (done) {
            this.timeout(300000);
            let promise = Promise.resolve();

            testPhrase.forEach(function (mnemonic, i) {
                let p = () => {
                    return HDWallet.setByPhrase(mnemonic, url)
                        .then(hdw => {
                            let list = hdw.makeInvoiceList(amount[i], asset);
                            let constL = listConst.invoice[i];
                            // console.log("invoice ", amount[i], " | ", list);
                            // console.log(listConst.invoice[i]);
                            // console.log(" ");

                            // expect(checkList(list, constL)).to.equal(true);
                            return hdw;
                        })
                        .then(hdw => {
                            return hdw.makeWithdrawalList(HDWallet._toAmount(amount[i]), asset)
                                .then(list => {
                                    let constL = listConst.withdrawal[i];
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
