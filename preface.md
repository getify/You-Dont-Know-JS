# You Don't Know JS
# Paunang Salita

Nakasisiguro ako na napansin mo, ngunit ang "JS" sa titulo ng serye ay hindi pagpapaikli ng salita para isumpa ang JavaScript, bagaman ang pagsumpa ay isang biro na marahil ay kilala na natin sa programming language

Mula sa mga unang araw ng web, and JavaScript ay naging pundasyon na ng teknolohiya na nagmamanyobra sa karanasang interaksyon ng mga nilalamang ating ginagamit. Habang ang flickering ng mouse trails at ang mga nakakaasar na pop-up prompts ay malalamang sa JavaScript nagumpisa, halos dalawang dekada na ang nakakaraan, ang teknolohiya at kakayahan ng JavaScript ay nakapag-palaki ng order ng magnitude, at kakaunti ang nagduda sa importansya sa puso ng pinaka-gamit na software platform sa mundo: ang Web.

Ngunit bilang isang programming language, ito ay habang-panahon nang magiging malaking asintahan ng pamumuna, mula sa pagkakautang nito sa kanyang pinanggalingan ngunit lalo na sa disenyo noting politikal. Maging ang pangalan nito, gaya ng minsang sinabi ni Brendan Eich, "hangal na nakababatang kapatid" na katayuan sunod sa mas mature na nakatatandang kapatid na si "Java". Ngunit ang pangalan ay isang aksidente lamang ng politika at marketing. Ang dalawang programming language ay mayroong napakalaking pagkakaiba sa napakaraming importanteng bagay. Ang "JavaScript" ay mayroong kaugnayan sa "Java" gaya ng "Carnival" na may kaugnayan sa "Sasakyan". 

Dahil ang JavaScript ay nanghihiram lamang ng konsepto at syntax idioms sa ilang programming language, kasama na ang mapagmataas na pinagmulang pamamaraang estilo ng C pati na rin ang subtle, ang hindi halatang Scheme/Lisp-style functional roots, ito ay lubhang madaling lapitan sa malaking bilang ng mga developers, maging ang mga kakaunti hanggang sa walang kaalaman at kakayahan sa programming. Ang "Hello World" ng JavaScript ay napakadali sa punto na ito na ang nagiimbita na magiging kumportable agad ang developer sa umpisa pa lamang.

Habang ang JavaScript ay marahil isa sa pinaka madaling programming language na paganahin, ang pagka orihinal nito ay ginagawa na ang karunungan ay isang napakalaki at hindi pangkaraniwang pangyayari di gaya ng ibang programming language. Kung saan kinakailangan nito ang isang napakalalim na kaalaman ukol sa programming language gaya ng C o kaya naman ay C++ upang makapag sulat ng isang buong program, ang isang buong produkto ng JavaScript ay may kakayahan, at madalas na, bahagyang madampian ang ibabaw ng kayang gawin ng isang programming language.

Ang mga sopistikadong konsepto ay na madalas umuugat ng malalim sa language sa halip na ipaibabaw ang sarili sa *tila* simpleng mga pamamaraan, tuland ng pagpapasa nito palibot sa mga functions bilang callbacks, na humihikayat sa mga JavaScript developers na gamitin ang programming language at hindi mag-alala masyado sa mga nangyayari sa loob ng proyekto.

Ito ay magkapanaabay na simple, madaling gamiting programming language na may malaking appeal, at may mahirap unawain at nuanced na koleksyon ng langauge mechanics kung saan maaaring maiwas sa *totoong pagkaunawa* kahit sa mga pinaka napapanahong Javascript developers sa mga pagkakataong ito ay hindi mapagaaralan ng mabuti.

Sa ganyang bagay matatagpuan ang kabalintunaan ng JavaScript, ang kahinaan ng language, ang mga pagsubok na ating kinikilala sa ngayon. Dahil ang Javacript ay *maaaring* magamit kahit na walang nararapat na pagunawa, ang pagunawa sa language ay madalas nang hindi nakakamit.

## Misyon

Kung sa bawat punto na ikaw ay makakatagpo ng pagaksorpresa o pagkabigo sa JavaScript, ang iyong tugon ay idagdag it sa blacklist, bilang isa sa mga nakasanayan mo nang gawin, darating ang panahon na ikaw ay mapapadpad sa isang guwang ng kayamanan at kasaganaan ng JavaScript.

Habang ang subset na ito ay kinikilala bilang "Ang Magagandang Parte", ako ay magmamakaawa sa iyo, mahal kong mambabasa, na imbis na ituring mo ito bilang "Ang Sanaysay na Parte", "Ang Ligtas na Parte", o maging "Ang Hindi Kumpletong Parte".

Ang *You Don't Know JavaScript* na serye ng libro ay inaalok ka ng isang salungat na hamon: matutunan at malalim na maintindihan mo ang *lahat* patungkol sa JavaScript, kahit at lalo na "Ang Mahihirap na Parte".

Dito, kinikilala namin ang pagtuloy sa mga posibilidad ng JS developers na matutunan "ng tama lang" at makaraos, na hindi pinupuwersa ang kanilang mga sarili na matutunan ng eksakto kung paano at bakit ganito magasal ang language. At iniiwasan din namin ang mga karaniwang payo na *sumuko* kapag naging mahirap na ang mga daang tatahakin.

Hindi ako kuntento, at dapat maging ikaw din, na tumigil kapag ang isang bagay ay *gumagana na*, at hindi o walang ideya kung *paano*. Malumanay kitang hinahamon na bumiyahe sa matigtig na "kaunting paglalakbay" at yakapin ang lahat at kayang gawin ng JavaScipt. Sa iyong kaalaman, walang teknik, walang balangkas, walang popular na buzzword acronym sa linggo na lalampas sa iyong pang unawa.

Ang bawat libro sa serye ay tatalakay sa pinaka malalim at isang tiyak na parte ng language na madalas hindi naiintindihan. Nararapat na umalis ka mula sa pagbabasa ng iyong pagkaunawa, hindi lang sa mga teorya, kung hindi maging sa praktikal "na anong dapat mong malaman" na parte.

Ang JavaScript na iyong kilala *sa ngayon* ay marahil *parte* lamang na naipasa sa iyo mula sa mga taong hindi nakaintindi ng buo dito. *Ang* JavaScript ay anino ng totoong programming language. Hindi mo nalalaman ng *totoo* ang JavaScript, *hindi pa*, ngunit kung magpupursigi ka sa seryeng ito, *malalaman mo*. Basahin nyo, mga kaibigan ko. Hinihintay na kayo ni JavaScript.

## Buod

Kahanga-hanga ang JavaScript. Bahagyang madali itong matutunan, at mas mahirap na matutunan ng kabuuan (o kahit *sapat na*). Kapag ang mga developers ay nakatagpo ng pagkalito, madalas nilang sinisisi ang language sa halip na ang kakulangan nila sa kaalaman. Ang mga librong ito ay naglalayon na ayusin ang naturang paguugaling ito, kagila-gilalas at matibay na pagpapahalaga sa language ang nararapat, ang *kinakailangan*, na *malaman* mo ng mas malalim.

Tandaan: Marami sa mga halimbawa in librong ito ay ipagpalagay na moderno (at hinaharap) na JavaScipt engine, gaya ng ES6. Ilan sa mga kodigo ay hindi gagana kung pagaganahin sa lumang (pre-ES6) mga engine 
