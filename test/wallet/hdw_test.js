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
        'desert glance mock throne just await social warn sob fault stomach friend kingdom metal clear curve scale stole too tremble bee center moon lip' ];
let listConst = {
    invoice: [
        [ { key: 'GDWZL6NAURO35JIDF7G776F74AX6LNGKVJKXF6IGQV6RNXE3TBDU4ZVG',
            amount: 500 },
            { key: 'GBL3YOG3RZ4JGFWN6ZFRTVKJ3WFRI4NWWVMFNEJF3SYD322SXY4KB6FE',
                amount: 500 },
            { key: 'GAE4SZVZWBN4S4JI4XDMBKNDLWTQCG55C7YZRJGU5LM4XH4RR3FINFZN',
                amount: 500 },
            { key: 'GDLB735ID7XY6BMH5K3U5KX5IBKGCKMDZIZEC2FGPAJMGAXTZNYFUKPE',
                amount: 500 },
            { key: 'GAP53X4AK7X5TH66QJM5KBLGJ7N3HLBQMRTF3TO3VZX5HCSNGQQBAPTL',
                amount: 248 } ],

        [ { key: 'GBU3NSGDRNKMDE37F4MNJKCF2ZJGY3B4KOXQ5RGPEKFDLZT3CLLZ572P',
            amount: 500 },
            { key: 'GCP2KNDM4RZA4UVYEDEHMZCGIRNGOCFXSOD2DNQNZLF6HS6OMX4K4I4L',
                amount: 439 } ],

        [ { key: 'GDKSLFNNNHIKZOP42S2Y5I2KYCRMVAG7DDM67NFME6POL5OJFQQ5XH25',
            amount: 500 },
            { key: 'GAVNIXWJTD3U6IOFPWUK6YMAHHYAR3HUSXDBKFDE6WQTZHXRB4HAFDC5',
                amount: 142 } ],

        [ { key: 'GCB6BC3ZL4ZYOU6KVAP5ZZGP3N4QOLQDCX5LSKYCVQDDBP32XC335RSP',
            amount: 500 },
            { key: 'GBA7WEHQUAI75VO6I42QJDBL6UY2MV2HUTLFD5BZVREVSQDGBE4FZWVX',
                amount: 500 },
            { key: 'GBRQF3JLVRPUVYF22P27U6RLGYSGAHOKISJ75FWKZR3AVZHW3GRDA5UY',
                amount: 190 } ]
    ],

    withdrawal: [
        [ { key: 'MA4HB457YJAXC7GVJUA3RB65LK66SOD43VNVDEH2XU5KLEQVFL5F332D',
            amount: 105 },
            { key: 'MDYJWRE7UXT7QUHXXA7BHEPPJ2TGRVNIDWRIFMLH22ODIFEKIWCGBUAQ',
                amount: 81 },
            { key: 'MDEGLHC56OREPCABXTMSWX4MT6ZLHPPGHEPRNEXMMVNKIMOFWHTWHB26',
                amount: 65 },
            { key: 'MC4IVGK5K6FNPE474GMDTJXLAXPMSO2IKYWEBY74SMJU2NPR7OIWGFD7',
                amount: 37 },
            { key: 'MD4GDLS2LANRYTPCHLQ2CBVTCO4GP6MGEVXLT34G24SF77ES3PRWIJKK',
                amount: 17 },
            { key: 'MDELA7LTE56MEOCZIOZEXWYMMUAXMHOSPJEY2QQ66EU77VENCYHGES4E',
                amount: 177 },
            { key: 'MB4CW6VDVTFMWNY6T5HWW2YCFM6LG237BGJBCR4LLFOORBWJLREGJEOU',
                amount: 53 },
            { key: 'MAQIHOI5JK2OXV2F24IZ23GLACHY4UHGIZKRCVL5MSRBM5URGUBV5OKK',
                amount: 109 },
            { key: 'MCMNB5UOGOCUKLINPQDXPWX7DHBBBJZTBJZYLBOTVE36MZQFTRRWHPZ6',
                amount: 109 },
            { key: 'MBIN4IYDPRJFHVKINOCWIS5NNCISAQFPRDYJDDIMI4JGRYKP5SGGDRKW',
                amount: 85 },
            { key: 'MDQOX4YUQEFCXXVYXBKM37ADXZJPWJNR2W3Z3NTAX7FEX2HTKE3WB33C',
                amount: 93 },
            { key: 'MA4ODK2JBDDQN227C7WDW6PJNGDUU37HNY2WJKUNHE52VQZ6VHVWFS3F',
                amount: 69 },
            { key: 'MCAPNXOZTMT77TOIQ4PKDYPFTNTZRYLJNT4SCU4FHWFCZJL7O4ZF4LGP',
                amount: 165 },
            { key: 'MAQDAIVXGULTLJF4UXWCPZKCGOUSHCWRPE6MRWMFJ7WRNAU57IVGH2FO',
                amount: 177 },
            { key: 'MDEAXVJANSE65XKCVYHRQG2NNXONZGAB62N2QEE6XSRJDMMDVLMGC6X6',
                amount: 185 },
            { key: 'MAUF6ZOBV7SQYSYCZGVHNALSO6YP3XVEO32UPJWE6VN3XDHYBOHF5I3D',
                amount: 249 },
            { key: 'MBMPMUACWESITXICY2BUSK3NIIMAPCG3JUIK2D4PA4CWYZXHYMVWBDCY',
                amount: 181 },
            { key: 'MDICMYBSWF22OEUBGMW3GMIDFHIMEXVUSZ7HH55QCG5O35GGNYOV4R3K',
                amount: 189 },
            { key: 'MBUNTWKTOFFGAQNGNOBFJ6LTXLFHZV7JCYRRF2S5FKV5LCRFIJAWE6T7',
                amount: 102 } ],

        [ { key: 'MCYO2WK2HZNK6OQB4FA47F7OC2L5JGIN34DID6RFWPC4TOTX23BGTCW5',
            amount: 93 },
            { key: 'MAENCPLTW5VQWXWUDBTARDT6IQQBC65OZMV2THU5DRYYR6EJF7IGUW4H',
                amount: 101 },
            { key: 'MBUM732XISICORUD3Z6JRGZ5CBHNXHUMS4VMKOE2AQRZVBXE7KJWWGZF',
                amount: 205 },
            { key: 'MCUB7FLQ42YAQS757WIZMMDP3WLHQ6AFRAKNES2KQEWMK4XQUEKG4NJY',
                amount: 133 },
            { key: 'MDUC7SIIUXO3LDQLU3GTOFRZPYD62LJ4ROV5A3KB3Z3VLGX6EGRGWU3P',
                amount: 77 },
            { key: 'MCEIEM6IG25L3MXP4OPWSI6VLFQJUE7RLA5RDNIU2AWIKMPXCNGWRTH2',
                amount: 137 },
            { key: 'MDAJCROHVOAKWYSQD2FOKEF75VZSZCXMYYR4KVGGPPC7F2BTJWWG4NUY',
                amount: 101 },
            { key: 'MAEM4HBJFB3J4632GF2NU4GSMM4UJ33UC3QE4ZBZZZJRHFZZM7RWP6Q3',
                amount: 92 } ],


        [ { key: 'MAQH6QZIJ46IRCHWKOM5QJAWM7BF2W3MKINWMH7YG7FUAGTUSPAVZS6J',
            amount: 153 },
            { key: 'MDAID6MYAA3NS6NXLQPM5OERR6SMKJTF2JDHBUTI3Q6UG7LWPMYF5T74',
                amount: 241 },
            { key: 'MAEKZMJLACQIG3W7HVETE65VAUERAAXRKGIKOHDN5UDBDDTNCUJVXLIX',
                amount: 173 },
            { key: 'MAUFMFO5A2R322TNBFU3OVS5KHHLXK7FA6T26DUZP6OOEI3SYOCVZTMC',
                amount: 73 },
            { key: 'MAAKBUTSR2OFLTNGFVXDMBAKYYSKA4NA3XFVUJWANXXYKD2F3GIVVQIR',
                amount: 2 } ],

        [ { key: 'MCQBFDC47UPAW2Y6XKMNGTMHWJG535JX5QRJWF2L5INTXK4T4O7GLSNR',
            amount: 81 },
            { key: 'MDMGU5KIQ4FTJG23QBCF4CKXFZ6ZJUU4QWKA2OZDDDSJ4ORFKKRGAIMW',
                amount: 129 },
            { key: 'MB4DU3B6GO6W6CAKQZBCFMNQE3NF6CBAXYB6UMUMVOMSQIGQQFYGIB4J',
                amount: 233 },
            { key: 'MDMEC7VYQ7LWOQLPGPUUHCPIXUHB6F7Z6SH2243SHWSQQVAT2IPWIW3Z',
                amount: 205 },
            { key: 'MAQJOVAEUTGAXU2AWGMQ6DPXWDQCLFZHEGIKNR2O3M2V3E32362WLQKH',
                amount: 33 },
            { key: 'MBAMPIXYS7RVH6HKBD76YKI7IZ4D5THOF2LQ7T4TIFB5UD2EC5OGBG6F',
                amount: 69 },
            { key: 'MDYIUMJBPMM2PWONA2HPSPCPUCKQPG6N25LQIV6YYK3LJ2WMUQ6GA5Q3',
                amount: 137 },
            { key: 'MC4ACBAIIUVMT62VJIJAHN7UZKRVLUAEVV5HIJE7NADM3346MEWWEZYI',
                amount: 57 },
            { key: 'MDEIG7KZ2KTCASL7EOJEKJBGYRN2JPZZTTTSK77EZ3A5MNDP64WWKUJX',
                amount: 205 },
            { key: 'MBALBIWYYE5Y4II2BRCPKVKYBJLEMK4HW2WSVXHNC4XBE5RAP2PWECZV',
                amount: 41 } ]
    ] };

function bufferCompare(buf1, buf2) {
    let compTrue = 0;
    for (let l = 0; l < 31; l++)
        if (buf1[l] == buf2[l])
            compTrue = compTrue + 1;
    return (compTrue === 31) ;
}

function makeResponseList(request) {
    // console.log("check account ", request.length);
    // console.log("-------------------------------");
    let response =
    {
        "assets": [
            {
                "asset": {  "asset_type": "credit_alphanum4",
                                "asset_code": "EUAH",
                                "asset_issuer": "GAWIB7ETYGSWULO4VB7D6S42YLPGIC7TY7Y2SSJKVOTMQXV5TILYWBUA" },
                "balances": []

            }
        ]
    };

    for (let i = 0; i < request.length; i++) {
        let id = StellarBase.decodeCheck("accountId", request[i]);

        let isValid = (id.readUInt8(0) & 3) === 0,
            hasBalance = (id.readUInt8(1) & 1) > 0,
            balance = 0;

        if (hasBalance)
            balance = (id.readUInt8(0) ^ 5) + 8;

        if (isValid) {
            response.assets[0].balances.push({
                "account_id": request[i],
                "balance": balance,
                "limit": "922337203685.4775807"
            });
        }
    }
    // console.log("response - ", response.assets[0].balances);
    return Promise.resolve(response);
}
//
function checkList(list, constList) {
    let res = 0;
    for (let i = 0; i < list.length; i++) {
        if ( (list.key == constList.key) && (list.amount == constList.amount) )
            res = res + 1;
    }
    return res === list.length;

}

describe("HDWallet Test. ", function () {

    sinon.stub(StellarSdk.Server.prototype, "getBalances", makeResponseList);

    describe('HDWallet. Set by Mnemonic', function () {
        let phrase = [];
        for (let i = 0; i < 4; i++)
            phrase[i] = constPhrase[i];
            // phrase[i] = HDKey.getMnemonic();

        it("Seed in HDW compare with const", function (done) {
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

            promise.then(() => done());
        });

        it("Serialize/deserialize of HDWallet correctly", function (done) {
            this.timeout(300000);
            let promise = Promise.resolve();

            phrase.forEach(function (mnemonic, i) {
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
            promise.then(() => done());

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


        it("create HDWallet by seed correctly", function (done) {

            this.timeout(300000);
            let promise = Promise.resolve();

            seed.forEach((currentSeed, i) => {
                let p =() => {
                    return HDWallet.setBySeed(currentSeed, url)
                        .then(hdw => {

                            expect(bufferCompare(hdw.seed, currentSeed)).to.equal(true);
                            return Promise.resolve();
                        });
                };
                promise = promise.then(p)
            });

            promise.then(() => done());
        });

        it("create HDWallet by mpub correctly", function (done) {
            this.timeout(300000);
            let promise = Promise.resolve();

            mpub.forEach( function(mPublic, i) {
                let p = () => {
                    return HDWallet.setByStrKey(mPublic, url)
                        .then(hdw => {
                            let pub = hdw.hdk.getMasterPub("_");
                            expect(pub).to.equal(mpub[i]);
                            return Promise.resolve();
                        })

                };
                promise = promise.then(p)

            });
            promise.then(() => done());
        });

    });

    describe("Tx Test. ", function () {
        let phrase = [
            'answer possess fix slowly happy hum character simply country suddenly grand teach hurt dim too concern ring cigarette score deep awaken thought stab save',
            'steel practice erase gentle mutter entire final demon unseen cell beyond bright music exist patient storm whole river bullet fact find buy catch history',
            'paper master apologize fantasy treasure open mold bite fix dim dim innocence chest broken peer stand drove tremble replace mourn blink milk check sorry',
            'present movement creature deal crush pay creek surely chase shadow angry sorry wipe dress bottle bench couch job then goose blood horizon sister climb'
        ];

        let amount = [2248, 939, 642, 1190 ];
        
        it("Making correct Invoice/Withdrawal list", function (done) {
            this.timeout(300000);
            let promise = Promise.resolve();
        
            phrase.forEach(function (mnemonic, i) {
                let p = () => {
                    return HDWallet.setByPhrase(mnemonic, url)
                        .then(hdw => {
                            return hdw.makeInvoiceList(amount[i], asset)
                                .then(list => {
                                    // console.log("invoice ", amount[i], " | ", list);
                                    // console.log(" ");

                                    let constL = listConst.invoice[i];  
                                        
                                    expect(checkList(list, constL)).to.equal(true);
                                    return hdw;
                                });
                        })
                        .then(hdw => {
                            return hdw.makeWithdrawalList(amount[i], asset)
                                .then(list => {
                                    // console.log("withdrawal ", amount[i], " | ", list);
                                    // console.log(" ");

                                    let constL = listConst.invoice[i];

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
        
            promise.then(() => done());
        });
       
    });

    sinon.restore(StellarSdk.Server);
});
