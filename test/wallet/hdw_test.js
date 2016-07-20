import * as StellarBase from "stellar-base";
import {HDKey} from "stellar-base";
import {HDWallet} from "../../src/hdwallet";

var constSeed = [
        'f009af50a4c9f7b71e882b3dc9a59d27fcda45b8d47699f62d9774f5a2657b6e',
        '81a44b7ec5a6031b9f9f3541da7b6364111662926138495a22bde926a2d50dae',
        'bfea385b80c34a92c77ce08598c49d9594ee586cb5cdaefe70ce2d0ba6b36c35',
        '847a73ca5b83518d4f2ee31ce53cf8f05fc80bc9ba2d294c37da17e4636fb517',
        'd96feb1b93b4dba39ba15b1130e060ea1b35a0b58b182f32c70d018177afe69f',
        '7191736c9fa2f865302e0972b238403dc6f26cdcc649c0fb339b72eff06b52fb',
        '826722c015d7cc3bab480b5eac01fa7af5f38d49517a7a9b300fb518ba68fe1a',
        '9e50bc0663edc024a5a1e7a76bfb99abc0aa18f4c27bf38f205524ad810048d2',
        'fbd7536e9a066da6cc2e9a8a39e84d574c30e83597a6b99bc896355fdbce56b8',
        'ac6c7c9c97e9860fe83492a1943b37238d233788019cc526ffa8df5d79caaba8',
        '86b4ae5b689f1a07738326b79a6a9631b6d5693f665bd37432ee58c1e973ac62',
        '196c5f9fb9e79d6ab968799f00d05497dd5f9e86ade075ba651c3f8533cbed10',
        'a1bf55e5bf98d346607629a8c01a24617cae677225ed6d2d98acb2225626bf57',
        '244db7aeba2a9b2ae38bcc7d4f82c116e4d16f96b728b54fdc66581be7a32d1a',
        '4ccf7b9f48de2504f1aa0a9c09d13c43b9dc8fe15babd12905a25a73affd6379',
        '35cb69912d0e69ee609e641233f3dd0b62e546e1bdeaf4e7b9065e27867b9f98',
        '500e09efcb17590a2b1c79041666f1271a4dde35f4d6955f3730f631cdde6e36',
        '03c82c368cdb5d8916b10b5ea24a122cf9a9ca5b435efd992031865aa68498a6',
        'cd8994bd1ed08a91a639183587714d40065a34a1b53482fd39ac727045779746',
        'b18ddb18832bf0a64ba71c066415e74cbe9bde7f6ed6dc8a789fac7edca84d1f',
        'c35fcca01652d41357593f330a66648e0b7d1012d1c1fd5d53d3ac27be6a00aa',
        '00fe8be9949bdec55c9ed670e2ce80b0be41dd8e67d595518eebce45046bb24a',
        '92294324d0a4d4bdb94ece8f53722e5f0dab38fc4c1305e6fe39b4d0433165e9',
        'be51e50b8e1700292900d67b387245cb8c17b7f98720d9a89b282fe8474fe715',
        'ceb155492ca1e182354c2e8d131d59fcab9a475750017d225c8dc75aa622ea90',
        '1022039e4345e450b2c197e9ea1261735a1faf3a1e69cd67a7be519c66353b05',
        '05b4abdcae939550601ad9b3dbe3a3724f9d0f34ff3d01f3228e8eebf8fedf0e',
        'c9ff10ca72e5c38d0f4fd6fad29d7f691b989748b260e43e27f96bb1effb4a5f',
        '0e7eda0ebc360c127c049973f5a24f5dca469ebbcd251c6d31c17aa9e886cea3',
        'b260ce85b98df0dc687b1af8ae4d4ae68c9bbb7b70bbe485adf23e7477e51728',
        '2632cd0e26dae7346ce75a5c06a73081fafdd9586dc18d924382f2e7b5905ad1',
        '329755c495453f6935c6b11fa45701cd23137223d3ca1c9339a7ee59d715d537',
        'eb622f798f50e390010808a6204390304cafa7a17e4231ac39bd9b8c7015fcae',
        'bfe5bed3c4f9f96237e5e9ea6eef68d9979b41c53088c47f05e1be429391ede0',
        'e55e6a0394155c8fe2277b3a4348d703d7b4b18c5e919610b2262c3e18ffbc37',
        '4cfbcbee5a1b428d7fac1236db0dabfe0e164b15522d9bb1732cd577f266318a',
        '4a94bfdb2e2e294c1f5492a590185c5be6d69cd373c6e91ad925bc052bd326ff',
        '2e9536a08a0d58b50709af8bbd671fa6ffdfeea62967f39d2d5426ddc8b29dcd',
        'e16d62e3cdc61604566b13f0e4f335b96ebef202570c393b2a801d1b967fe03d',
        'ee46a7c7a45d7e8d845d1f1cc9aa89afbe865829b2cbb8825528b9e2ef11ef5f',
        '2678f4655c695fbfa4a93834296cc848f3403f196f816c13eff256041c0526ea',
        'af1751623bc976182b981244841f558621bba849d33b6713836b3b081997efef',
        '9452d6f7ac846dcfb6adb9edf6b78f5e204a608131a43023dc62376d136da6a3',
        'e78ce41e9efe02eefacc24bebaac875df1b7f65e6ad66657262af1e34bc7cab2',
        '7ed2cae826ab26a4955963ad1ba016ac2b8fa3b342ae568757498eb40c6fbb09',
        '7b09b8904522d1c66f626bb1f96db1453d44ee8e70a2ca98fb0c541fcc7f9321',
        '3d4f87fd3b7c2a0bfb8d332cc1d92bb0d4ff3a909495173c6dfb540de60f6335',
        'b22f94269ca0797650db9fd45608573d1fd37aed19d78c87b0838ac962d3040a',
        'd48ae1a45900b9cff081c57c92c67e99052b9c38fe311fddd5e31d7aea5bd696',
        '33dc0d3e5ec8a19717d7d5d1a1bbb82a7fbeb159f6f618c365bbaa600f74f755' ],
    constPhrase = [
        'fact endless enjoy corner gas sink other bowl sport nobody agony uncle box everybody tool ahead illuminate weep study pulse stand pie cast land',
        'bloom yeah process after bone once queen lonely aim into struggle suddenly hop music anger grip expect yearn loose petal made frost both bathroom',
        'clearly pink rock glide common conversation stone moon terrible chase indeed stuff spiral home lesson train truly dude grow terrible barely clutch further book',
        'grip under judge show howl guess idiot bother mourn hill still glorious orange weak adore anymore butterfly somehow parent burst expression completely lust stir',
        'despair lady remain chin shine tangle soldier today bliss weave mother pure witch attempt powerful master run honest drift struggle rose buy tell pack',
        'desert glance mock throne just await social warn sob fault stomach friend kingdom metal clear curve scale stole too tremble bee center moon lip',
        'apple simple eventually snake clean summer grew outside respond test expression bag blink art throat wolf aunt suppose party swing charm hardly view town',
        'grab down built smart curve soul thump wise taken key balance eat chest horrible thump devil hardly belong plastic tower patience rose serious whatever',
        'magic bruise wise air college very companion coat mask sure palm huge skin tune disguise tune dragon fantasy rather thank eye clay toward truth',
        'simple distance really verse opposite cigarette many nowhere cruel promise moonlight glow pray concrete animal march scary trickle awake blend agony during loss mutter',
        'reflection doubt pulse inside blush important buy refuse idiot unseen hopefully purpose wrong drift ever except drawn safe grow grew doctor faith compare doll',
        'anger tune aside black peach college entire pray glove advice click determine alone dot approach frame idiot darling murder surround tease tuck agree glory',
        'crash burden proud take separate cute yours unless screw sure along flag society bloody storm indeed pound dumb sent whisper bank rhyme instead shock',
        'approach maybe rise within early joy caught near name toward hum broken cold sky glove passion difference nightmare then pity teacher grandma cheer society',
        'devil fright goodbye red gain peach written rape dart hurt queen crush shift tell begun yellow fill wrist lip boyfriend sheep yearn innocence decide',
        'imagine laid hook once acid real frozen needle soft presence problem prove dish creek physical line taken something blade truck stomach describe book gay',
        'high sweet teach present blow after gather happen toward break sick breeze burden illuminate stage make creep grant chair annoy horrible honey wrong paradise',
        'desire sick knee fate pass cost sneak inner bubble yourself long snake open city flower spoken pretty pop more pure draw broke dark glare',
        'chin slowly raw sympathy despite bullet single pass guard stock test trade plan honest victim belly skill threw creep stroke hopefully endless few lord',
        'root suffer about bold somehow apologize shall sister shade tool leave clay wrote breathe arrow still spread insult scent thought blade chill brave handle',
        'moral faint shame raise soul breathe always cheek naked rainbow horrible valley invisible holy drove throughout describe journey over character battle machine something shimmer',
        'ghost decision frighten process hungry taught win use chase breast patient mock time grew own shown mass already deep world bound someone under second',
        'distance stun struggle forgive guide less save stand pig message guess purpose grew believe next jock six tightly foe beneath sad great freedom rabbit',
        'soul feather everywhere deadly await silence pale movement monkey third made dress balance crap surprise grew mock idea lace struggle leave invite enemy uncle',
        'street inner spring volume describe always strength sword football tangle give lip creation drag protect town impossible yours carve upon wrist gift hardly space',
        'endless carve task fill ode jump scrape knife tell ground shoot barely throw small lord anything fill mom down loose tree tease knife stole',
        'consume fought size follow suspend gotta manage guilt secret muse future school freedom recall puff grow tower shield north cover confuse point reality least',
        'boom welcome laughter too against study weak cup content inside hunger deserve jock mass boyfriend consume stain yet speed grow edge ever lightning affection',
        'before need stay lord affection asleep shiver nail speak quiet cap slept group special scream dawn drive down nail amaze admit false true foe',
        'just delicate grief carve corner danger escape minute lesson might dad afternoon innocence led grass outside birthday said spill music sheep win learn peer',
        'suspend thousand bomb stranger strip use ruin birthday thing grow summer important breathe beard describe sky whether rape throne master sudden spoken evening reflection',
        'free push shut drunk crumble spill forget choice inch crimson pity lead talent block abuse knife bone anything check unknown cheer rhyme broke drink',
        'math press grass drink burst shoulder alter movie crash remember twirl patience hello laughter screen forest team understand simply murder belly daughter misery name',
        'given there fog stand then loser desert art sting thick probably crumble born faith friend bump feather common once imagine worst god eternity change',
        'music entire coat wrist line nervous concrete engine object paradise peel fire surface escape someone box everywhere satisfy mourn leg dart tune course seek',
        'birthday death passion foul level once awaken help train health thought jealous roam window grey awkward yourself pale grade flame void gas become best',
        'together doubt poet spine yesterday rebel caress everyday however desperate brain paradise flag limb serve magic week upset forth avoid metal sadness doctor coffee',
        'course bloody tell blade refuse true tell slam complain wipe eternity ice shiny hundred dirty college less poor bid softly check exist muse pleasure',
        'beyond army admire clock taken kiss coat rape idea strength answer cold use soak remain avoid define heat bottom eat whatever slap spine single',
        'taught party deserve reality alive freeze month reality poetry separate easily idea got hurt pile moon illuminate grace blind palm cap despair grand await',
        'innocence gotta process purpose alter pray breeze outside shown beneath water lead bang secret skin page everything dirt realize tease ship lot down high',
        'mass skill wild snow shiver connection color arrive belly drum summer shy innocence shift limb taught describe youth scratch mostly blame lip repeat victim',
        'field rhyme against hang swell await flood square shade subject trouble grin ship stumble dread inside hair also nail family revenge pretty prepare butterfly',
        'poet squeeze ceiling mess course shy bank human age discover given about visit tie city off total chill shout mystery awkward haunt foot screen',
        'cruel knee crimson board show instead passion bring drag task feet known single machine everytime crap double beautiful bloom ink alas rule figure spin',
        'weapon mourn course rub regret mud terrible support taste lazy strike chocolate monkey sail slept gather king spoken delight lick perfection church both thread',
        'hurt sweet queen blossom town pressure patience angel apart fist soothe gain somehow pencil bliss pierce stretch long rope limit talk person friend ponder',
        'worthless bang safe pull girl nail sister shut nod want former perhaps dull grade volume mutter destination better skill dart volume stock been box',
        'possibly naked demon stain today monster town pink broke team back selfish began glove thigh show blood voice bone depth important decay back trade',
        'whistle strife against make cruel defeat shoe jock murder language love scatter wife mean noise often pink chase each despair here grand girlfriend underneath' ];

function bufferCompare(buf1, buf2) {
    let compTrue = 0;
    for (let l = 0; l < 31; l++)
        if (buf1[l] == buf2[l])
            compTrue = compTrue + 1;
    return (compTrue === 31) ;
}

describe('HDWallet. Set by Mnemonic', function() {
    it("seed in HDW compare with const", function() {
        this.timeout(300000);
        let res = 0;
        for (let i = 0; i < 25; i++) {
            let hdw = HDWallet.SetByPhrase(constPhrase[i]);
            if (bufferCompare(hdw.seed, new Buffer(constSeed[i], "hex")))
                res++;
            else {
                console.log("Compare fail");
                console.log("HDW.Seed  - ", hdw.seed);
                console.log("ConstSeed - ", new Buffer(constSeed[i], "hex"));
            }
        }
        expect(res).to.equal(25)
    });
});

describe('HDWallet. Serialize', function() {
    it("serialize/deserialize of HDWallet correctly", function() {
        this.timeout(300000);
        let res = 0;
        for (let i = 0; i < 25; i++) {
            let hdw1 = HDWallet.SetByPhrase(constPhrase[1]),
                str1 = hdw1.Serialize(),
                hdw2 = HDWallet.SetByStrKey(str1),
                str2 = hdw2.Serialize();

            if (str1 === str2)
                res++;
        }
        expect(res).to.equal(25)
    })

});

describe('HDWallet. SetByStrKey', function () {
    let seed = [],
        mpub = [];
    for (let i = 0; i < 25; i++) {
        seed[i] = new Buffer(constSeed[i], "hex");
        let hdk = HDKey.fromMasterSeed(seed[i]);
        mpub[i] = hdk.getMasterPub("_");
    }
    it("create HDWallet by seed correctly", function() {
        this.timeout(300000);
        let res = 0;
        for (let i = 0; i < 25; i++){
            let hdw = HDWallet.setBySeed(seed[i]);
            if ( bufferCompare(hdw.seed, seed[i]) )
                res++;
        }
        expect(res).to.equal(25)
    });

    it("create HDWallet by mpub correctly", function() {
        this.timeout(300000);
        let res = 0;
        for (let i = 0; i < 25; i++){
            let hdw = HDWallet.SetByStrKey(mpub[i]),
                pub = hdw.hdkey.getMasterPub("_");
            if ( mpub[i] === pub )
                res++;
        }
        expect(res).to.equal(25)
    });
});
