import type { LangCode, Level, WordCategory } from "./types";

export type Pos = "noun" | "verb" | "adj" | "phrase";
export type Domain =
  | "food"
  | "place"
  | "object"
  | "person"
  | "nature"
  | "abstract"
  | "event"
  | "number";

export type ConceptTuple = [
  string,
  Level,
  WordCategory,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

type Render = Record<"tr" | LangCode, (x: string) => string>;

export type Frame = Render & {
  id: string;
  kind: "meta" | "noun" | "verb" | "adj";
  pos: Pos | "all";
  shift: number;
  /** meta frame: may attach to numbers, verbs, adjectives, phrases */
  num?: boolean;
  v?: boolean;
  a?: boolean;
  ph?: boolean;
  /** meta/noun frame: noun domains it may attach to */
  d?: Domain[];
};

const CONCRETE: Domain[] = ["food", "place", "object", "person", "nature", "event"];
const NOUN_LIKE: Domain[] = ["food", "place", "object", "person", "nature", "event", "abstract"];
const BUYABLE: Domain[] = ["food", "object", "place", "abstract"];
const META_WORD = { num: true, v: true, a: true, ph: true };

function trStem(infinitive: string): string {
  return infinitive.replace(/(mek|mak)$/i, "");
}

function trSoftStem(infinitive: string): string {
  return trStem(infinitive).replace(/t$/, "d").replace(/k$/, "ğ").replace(/ç$/, "c");
}

function trFront(infinitive: string): boolean {
  const vowels = trStem(infinitive).match(/[aeıioöuü]/gi);
  return /[eiöü]/i.test(vowels?.at(-1) ?? "");
}

function trFuture(infinitive: string): string {
  return `${trSoftStem(infinitive)}${trFront(infinitive) ? "e" : "a"}ceğim`;
}

function trAbility(infinitive: string): string {
  return `${trSoftStem(infinitive)}${trFront(infinitive) ? "e" : "a"}bilirim`;
}

function f(partial: Frame): Frame {
  return partial;
}

// Frames about the word itself are valid for every term type.
const META: Frame[] = [
  f({ id: "the_word", kind: "meta", pos: "all", shift: 0, ...META_WORD, tr: (x) => `${x} kelimesi`, en: (x) => `the word ${x}`, es: (x) => `la palabra ${x}`, it: (x) => `la parola ${x}`, ru: (x) => `слово ${x}`, pt: (x) => `a palavra ${x}`, fr: (x) => `le mot ${x}`, de: (x) => `das Wort ${x}` }),
  f({ id: "repeat", kind: "meta", pos: "all", shift: 0, ...META_WORD, tr: (x) => `${x} tekrar`, en: (x) => `repeat ${x}`, es: (x) => `repite ${x}`, it: (x) => `ripeti ${x}`, ru: (x) => `повторите ${x}`, pt: (x) => `repita ${x}`, fr: (x) => `répétez ${x}`, de: (x) => `wiederhole ${x}` }),
  f({ id: "listen", kind: "meta", pos: "all", shift: 0, ...META_WORD, tr: (x) => `${x} dinle`, en: (x) => `listen to ${x}`, es: (x) => `escucha ${x}`, it: (x) => `ascolta ${x}`, ru: (x) => `слушайте ${x}`, pt: (x) => `ouça ${x}`, fr: (x) => `écoutez ${x}`, de: (x) => `höre ${x}` }),
  f({ id: "say", kind: "meta", pos: "all", shift: 0, ...META_WORD, tr: (x) => `${x} söyle`, en: (x) => `say ${x}`, es: (x) => `di ${x}`, it: (x) => `dì ${x}`, ru: (x) => `скажите ${x}`, pt: (x) => `diga ${x}`, fr: (x) => `dites ${x}`, de: (x) => `sag ${x}` }),
  f({ id: "write", kind: "meta", pos: "all", shift: 1, ...META_WORD, tr: (x) => `${x} yaz`, en: (x) => `write ${x}`, es: (x) => `escribe ${x}`, it: (x) => `scrivi ${x}`, ru: (x) => `напишите ${x}`, pt: (x) => `escreva ${x}`, fr: (x) => `écrivez ${x}`, de: (x) => `schreib ${x}` }),
  f({ id: "read", kind: "meta", pos: "all", shift: 1, ...META_WORD, tr: (x) => `${x} oku`, en: (x) => `read ${x}`, es: (x) => `lee ${x}`, it: (x) => `leggi ${x}`, ru: (x) => `читайте ${x}`, pt: (x) => `leia ${x}`, fr: (x) => `lisez ${x}`, de: (x) => `lies ${x}` }),
  f({ id: "again", kind: "meta", pos: "all", shift: 0, ...META_WORD, tr: (x) => `${x} tekrar`, en: (x) => `${x} again`, es: (x) => `${x} otra vez`, it: (x) => `${x} di nuovo`, ru: (x) => `${x} снова`, pt: (x) => `${x} de novo`, fr: (x) => `${x} encore`, de: (x) => `${x} nochmal` }),
  f({ id: "practice", kind: "meta", pos: "all", shift: 1, num: true, v: true, a: true, ph: false, tr: (x) => `${x} çalış`, en: (x) => `I practice ${x}`, es: (x) => `practico ${x}`, it: (x) => `pratico ${x}`, ru: (x) => `я практикую ${x}`, pt: (x) => `pratico ${x}`, fr: (x) => `je pratique ${x}`, de: (x) => `ich übe ${x}` }),
  f({ id: "meaning", kind: "meta", pos: "all", shift: 1, num: true, v: true, a: true, ph: false, tr: (x) => `${x} anlamı`, en: (x) => `the meaning of ${x}`, es: (x) => `el significado de ${x}`, it: (x) => `il significato di ${x}`, ru: (x) => `значение ${x}`, pt: (x) => `o significado de ${x}`, fr: (x) => `le sens de ${x}`, de: (x) => `die Bedeutung von ${x}` }),

  // Sentence frames for nouns/verbs with semantic domains.
  f({ id: "remember", kind: "meta", pos: "all", shift: 1, a: false, ph: false, v: false, d: NOUN_LIKE, tr: (x) => `${x} hatırla`, en: (x) => `I remember ${x}`, es: (x) => `recuerdo ${x}`, it: (x) => `ricordo ${x}`, ru: (x) => `я помню ${x}`, pt: (x) => `lembro ${x}`, fr: (x) => `je me souviens de ${x}`, de: (x) => `ich erinnere mich an ${x}` }),
  f({ id: "learn_x", kind: "meta", pos: "all", shift: 1, a: false, ph: false, v: false, d: NOUN_LIKE, tr: (x) => `${x} öğren`, en: (x) => `I learn ${x}`, es: (x) => `aprendo ${x}`, it: (x) => `imparo ${x}`, ru: (x) => `я учу ${x}`, pt: (x) => `aprendo ${x}`, fr: (x) => `j'apprends ${x}`, de: (x) => `ich lerne ${x}` }),
  f({ id: "see_x", kind: "meta", pos: "all", shift: 0, a: false, ph: false, v: false, d: CONCRETE, tr: (x) => `${x} görüyorum`, en: (x) => `I see ${x}`, es: (x) => `veo ${x}`, it: (x) => `vedo ${x}`, ru: (x) => `я вижу ${x}`, pt: (x) => `vejo ${x}`, fr: (x) => `je vois ${x}`, de: (x) => `ich sehe ${x}` }),
  f({ id: "know_x", kind: "meta", pos: "all", shift: 1, a: false, ph: false, v: false, d: NOUN_LIKE, tr: (x) => `${x} biliyorum`, en: (x) => `I know ${x}`, es: (x) => `conozco ${x}`, it: (x) => `conosco ${x}`, ru: (x) => `я знаю ${x}`, pt: (x) => `conheço ${x}`, fr: (x) => `je connais ${x}`, de: (x) => `ich kenne ${x}` }),
  f({ id: "now", kind: "meta", pos: "all", shift: 0, a: false, ph: false, v: true, d: NOUN_LIKE, tr: (x) => `şimdi ${x}`, en: (x) => `${x} now`, es: (x) => `${x} ahora`, it: (x) => `${x} adesso`, ru: (x) => `${x} сейчас`, pt: (x) => `${x} agora`, fr: (x) => `${x} maintenant`, de: (x) => `${x} jetzt` }),
  f({ id: "today_x", kind: "meta", pos: "all", shift: 0, a: false, ph: false, v: true, d: ["food", "object", "place", "event", "abstract", "person"], tr: (x) => `bugün ${x}`, en: (x) => `${x} today`, es: (x) => `${x} hoy`, it: (x) => `${x} oggi`, ru: (x) => `${x} сегодня`, pt: (x) => `${x} hoje`, fr: (x) => `${x} aujourd'hui`, de: (x) => `${x} heute` }),
  f({ id: "tomorrow_x", kind: "meta", pos: "all", shift: 1, a: false, ph: false, v: true, d: ["food", "object", "place", "event", "abstract", "person"], tr: (x) => `yarın ${x}`, en: (x) => `${x} tomorrow`, es: (x) => `${x} mañana`, it: (x) => `${x} domani`, ru: (x) => `${x} завтра`, pt: (x) => `${x} amanhã`, fr: (x) => `${x} demain`, de: (x) => `${x} morgen` }),
  f({ id: "here", kind: "meta", pos: "all", shift: 1, a: false, ph: false, d: CONCRETE, tr: (x) => `${x} burada`, en: (x) => `${x} here`, es: (x) => `${x} aquí`, it: (x) => `${x} qui`, ru: (x) => `${x} здесь`, pt: (x) => `${x} aqui`, fr: (x) => `${x} ici`, de: (x) => `${x} hier` }),
  f({ id: "there", kind: "meta", pos: "all", shift: 1, a: false, ph: false, d: CONCRETE, tr: (x) => `${x} orada`, en: (x) => `${x} there`, es: (x) => `${x} allí`, it: (x) => `${x} lì`, ru: (x) => `${x} там`, pt: (x) => `${x} lá`, fr: (x) => `${x} là-bas`, de: (x) => `${x} dort` }),
];

const NOUN: Frame[] = [
  f({ id: "need", kind: "noun", pos: "noun", shift: 0, d: NOUN_LIKE, tr: (x) => `${x} ihtiyacım var`, en: (x) => `I need ${x}`, es: (x) => `necesito ${x}`, it: (x) => `ho bisogno di ${x}`, ru: (x) => `мне нужен ${x}`, pt: (x) => `preciso de ${x}`, fr: (x) => `j'ai besoin de ${x}`, de: (x) => `ich brauche ${x}` }),
  f({ id: "want", kind: "noun", pos: "noun", shift: 0, d: NOUN_LIKE, tr: (x) => `${x} istiyorum`, en: (x) => `I want ${x}`, es: (x) => `quiero ${x}`, it: (x) => `voglio ${x}`, ru: (x) => `я хочу ${x}`, pt: (x) => `quero ${x}`, fr: (x) => `je veux ${x}`, de: (x) => `ich möchte ${x}` }),
  f({ id: "like", kind: "noun", pos: "noun", shift: 0, d: NOUN_LIKE, tr: (x) => `${x} seviyorum`, en: (x) => `I like ${x}`, es: (x) => `me gusta ${x}`, it: (x) => `mi piace ${x}`, ru: (x) => `мне нравится ${x}`, pt: (x) => `gosto de ${x}`, fr: (x) => `j'aime ${x}`, de: (x) => `ich mag ${x}` }),
  f({ id: "where_is", kind: "noun", pos: "noun", shift: 0, d: ["place", "object", "person", "food", "nature"], tr: (x) => `${x} nerede`, en: (x) => `where is ${x}`, es: (x) => `¿dónde está ${x}?`, it: (x) => `dov'è ${x}?`, ru: (x) => `где ${x}?`, pt: (x) => `onde fica ${x}?`, fr: (x) => `où est ${x}?`, de: (x) => `wo ist ${x}?` }),
  f({ id: "this_is", kind: "noun", pos: "noun", shift: 0, d: CONCRETE, tr: (x) => `bu ${x}`, en: (x) => `this is ${x}`, es: (x) => `esto es ${x}`, it: (x) => `questo è ${x}`, ru: (x) => `это ${x}`, pt: (x) => `isto é ${x}`, fr: (x) => `c'est ${x}`, de: (x) => `das ist ${x}` }),
  f({ id: "my", kind: "noun", pos: "noun", shift: 0, d: NOUN_LIKE, tr: (x) => `benim ${x}`, en: (x) => `my ${x}`, es: (x) => `mi ${x}`, it: (x) => `il mio ${x}`, ru: (x) => `мой ${x}`, pt: (x) => `meu ${x}`, fr: (x) => `mon ${x}`, de: (x) => `mein ${x}` }),
  f({ id: "your", kind: "noun", pos: "noun", shift: 0, d: NOUN_LIKE, tr: (x) => `senin ${x}`, en: (x) => `your ${x}`, es: (x) => `tu ${x}`, it: (x) => `il tuo ${x}`, ru: (x) => `ваш ${x}`, pt: (x) => `seu ${x}`, fr: (x) => `votre ${x}`, de: (x) => `dein ${x}` }),
  f({ id: "with", kind: "noun", pos: "noun", shift: 0, d: NOUN_LIKE, tr: (x) => `${x} ile`, en: (x) => `with ${x}`, es: (x) => `con ${x}`, it: (x) => `con ${x}`, ru: (x) => `с ${x}`, pt: (x) => `com ${x}`, fr: (x) => `avec ${x}`, de: (x) => `mit ${x}` }),
  f({ id: "without", kind: "noun", pos: "noun", shift: 1, d: NOUN_LIKE, tr: (x) => `${x} olmadan`, en: (x) => `without ${x}`, es: (x) => `sin ${x}`, it: (x) => `senza ${x}`, ru: (x) => `без ${x}`, pt: (x) => `sem ${x}`, fr: (x) => `sans ${x}`, de: (x) => `ohne ${x}` }),
  f({ id: "use_x", kind: "noun", pos: "noun", shift: 1, d: ["food", "object", "place", "abstract"], tr: (x) => `${x} kullanıyorum`, en: (x) => `I use ${x}`, es: (x) => `uso ${x}`, it: (x) => `uso ${x}`, ru: (x) => `я использую ${x}`, pt: (x) => `uso ${x}`, fr: (x) => `j'utilise ${x}`, de: (x) => `ich benutze ${x}` }),
  f({ id: "have_you", kind: "noun", pos: "noun", shift: 1, d: BUYABLE, tr: (x) => `${x} var mı`, en: (x) => `do you have ${x}?`, es: (x) => `¿tiene ${x}?`, it: (x) => `ha ${x}?`, ru: (x) => `у вас есть ${x}?`, pt: (x) => `você tem ${x}?`, fr: (x) => `avez-vous ${x}?`, de: (x) => `haben Sie ${x}?` }),
  f({ id: "please_x", kind: "noun", pos: "noun", shift: 0, d: ["food", "object", "place", "event", "person"], tr: (x) => `${x} lütfen`, en: (x) => `${x}, please`, es: (x) => `${x}, por favor`, it: (x) => `${x}, per favore`, ru: (x) => `${x}, пожалуйста`, pt: (x) => `${x}, por favor`, fr: (x) => `${x}, s'il vous plaît`, de: (x) => `${x}, bitte` }),
  f({ id: "is_there", kind: "noun", pos: "noun", shift: 1, d: ["food", "place", "object", "nature", "event"], tr: (x) => `${x} var mı`, en: (x) => `is there ${x}?`, es: (x) => `¿hay ${x}?`, it: (x) => `c'è ${x}?`, ru: (x) => `есть ${x}?`, pt: (x) => `há ${x}?`, fr: (x) => `y a-t-il ${x}?`, de: (x) => `gibt es ${x}?` }),
  f({ id: "how_much_x", kind: "noun", pos: "noun", shift: 1, d: BUYABLE, tr: (x) => `${x} ne kadar`, en: (x) => `how much is ${x}?`, es: (x) => `¿cuánto cuesta ${x}?`, it: (x) => `quanto costa ${x}?`, ru: (x) => `сколько стоит ${x}?`, pt: (x) => `quanto custa ${x}?`, fr: (x) => `combien coûte ${x}?`, de: (x) => `was kostet ${x}?` }),
  f({ id: "new_x", kind: "noun", pos: "noun", shift: 1, d: ["object", "place", "event", "abstract", "food"], tr: (x) => `yeni ${x}`, en: (x) => `new ${x}`, es: (x) => `${x} nuevo`, it: (x) => `${x} nuovo`, ru: (x) => `новый ${x}`, pt: (x) => `${x} novo`, fr: (x) => `${x} nouveau`, de: (x) => `neues ${x}` }),
  f({ id: "good_x", kind: "noun", pos: "noun", shift: 1, d: ["food", "object", "place", "event", "abstract", "nature"], tr: (x) => `iyi ${x}`, en: (x) => `good ${x}`, es: (x) => `buen ${x}`, it: (x) => `buon ${x}`, ru: (x) => `хороший ${x}`, pt: (x) => `bom ${x}`, fr: (x) => `bon ${x}`, de: (x) => `gutes ${x}` }),
];

const VERB: Frame[] = [
  f({ id: "want_to", kind: "verb", pos: "verb", shift: 0, tr: (x) => `${x} istiyorum`, en: (x) => `I want to ${x}`, es: (x) => `quiero ${x}`, it: (x) => `voglio ${x}`, ru: (x) => `я хочу ${x}`, pt: (x) => `quero ${x}`, fr: (x) => `je veux ${x}`, de: (x) => `ich möchte ${x}` }),
  f({ id: "need_to", kind: "verb", pos: "verb", shift: 0, tr: (x) => `${x} gerekiyor`, en: (x) => `I need to ${x}`, es: (x) => `necesito ${x}`, it: (x) => `devo ${x}`, ru: (x) => `мне нужно ${x}`, pt: (x) => `preciso ${x}`, fr: (x) => `je dois ${x}`, de: (x) => `ich muss ${x}` }),
  f({ id: "like_to", kind: "verb", pos: "verb", shift: 0, tr: (x) => `${trStem(x)}meyi seviyorum`, en: (x) => `I like to ${x}`, es: (x) => `me gusta ${x}`, it: (x) => `mi piace ${x}`, ru: (x) => `мне нравится ${x}`, pt: (x) => `gosto de ${x}`, fr: (x) => `j'aime ${x}`, de: (x) => `ich mag es zu ${x}` }),
  f({ id: "can_you", kind: "verb", pos: "verb", shift: 0, tr: (x) => `${x} misin`, en: (x) => `can you ${x}?`, es: (x) => `¿puede ${x}?`, it: (x) => `può ${x}?`, ru: (x) => `вы можете ${x}?`, pt: (x) => `você pode ${x}?`, fr: (x) => `pouvez-vous ${x}?`, de: (x) => `können Sie ${x}?` }),
  f({ id: "will", kind: "verb", pos: "verb", shift: 1, tr: (x) => trFuture(x), en: (x) => `I will ${x}`, es: (x) => `voy a ${x}`, it: (x) => `ho intenzione di ${x}`, ru: (x) => `я буду ${x}`, pt: (x) => `vou ${x}`, fr: (x) => `je vais ${x}`, de: (x) => `ich werde ${x}` }),
  f({ id: "can", kind: "verb", pos: "verb", shift: 0, tr: (x) => trAbility(x), en: (x) => `I can ${x}`, es: (x) => `puedo ${x}`, it: (x) => `posso ${x}`, ru: (x) => `я могу ${x}`, pt: (x) => `posso ${x}`, fr: (x) => `je peux ${x}`, de: (x) => `ich kann ${x}` }),
  f({ id: "should_we", kind: "verb", pos: "verb", shift: 1, tr: (x) => `${trStem(x)}meliyiz`, en: (x) => `we should ${x}`, es: (x) => `deberíamos ${x}`, it: (x) => `dovremmo ${x}`, ru: (x) => `нам стоит ${x}`, pt: (x) => `devemos ${x}`, fr: (x) => `nous devrions ${x}`, de: (x) => `wir sollten ${x}` }),
  f({ id: "lets", kind: "verb", pos: "verb", shift: 1, tr: (x) => `hadi ${trSoftStem(x)}elim`, en: (x) => `let's ${x}`, es: (x) => `vamos a ${x}`, it: (x) => `andiamo a ${x}`, ru: (x) => `давай ${x}`, pt: (x) => `vamos ${x}`, fr: (x) => `allons ${x}`, de: (x) => `lass uns ${x}` }),
  f({ id: "dont", kind: "verb", pos: "verb", shift: 1, tr: (x) => `${trStem(x)}me`, en: (x) => `don't ${x}`, es: (x) => `no ${x}`, it: (x) => `non ${x}`, ru: (x) => `не ${x}`, pt: (x) => `não ${x}`, fr: (x) => `ne pas ${x}`, de: (x) => `nicht ${x}` }),
  f({ id: "you_should", kind: "verb", pos: "verb", shift: 1, tr: (x) => `${trStem(x)}melisin`, en: (x) => `you should ${x}`, es: (x) => `debería ${x}`, it: (x) => `dovrebbe ${x}`, ru: (x) => `вам следует ${x}`, pt: (x) => `você deve ${x}`, fr: (x) => `vous devriez ${x}`, de: (x) => `Sie sollten ${x}` }),
  f({ id: "must", kind: "verb", pos: "verb", shift: 1, tr: (x) => `${trStem(x)}meliyim`, en: (x) => `I must ${x}`, es: (x) => `debo ${x}`, it: (x) => `devo ${x}`, ru: (x) => `я должен ${x}`, pt: (x) => `devo ${x}`, fr: (x) => `je dois ${x}`, de: (x) => `ich muss ${x}` }),
  f({ id: "try_to", kind: "verb", pos: "verb", shift: 2, tr: (x) => `${trStem(x)}meye çalış`, en: (x) => `try to ${x}`, es: (x) => `intenta ${x}`, it: (x) => `prova a ${x}`, ru: (x) => `попробуйте ${x}`, pt: (x) => `tente ${x}`, fr: (x) => `essayez de ${x}`, de: (x) => `versuche zu ${x}` }),
];

const ADJ: Frame[] = [
  f({ id: "very", kind: "adj", pos: "adj", shift: 0, tr: (x) => `çok ${x}`, en: (x) => `very ${x}`, es: (x) => `muy ${x}`, it: (x) => `molto ${x}`, ru: (x) => `очень ${x}`, pt: (x) => `muito ${x}`, fr: (x) => `très ${x}`, de: (x) => `sehr ${x}` }),
  f({ id: "really_adj", kind: "adj", pos: "adj", shift: 0, tr: (x) => `gerçekten ${x}`, en: (x) => `really ${x}`, es: (x) => `realmente ${x}`, it: (x) => `davvero ${x}`, ru: (x) => `действительно ${x}`, pt: (x) => `realmente ${x}`, fr: (x) => `vraiment ${x}`, de: (x) => `wirklich ${x}` }),
  f({ id: "too_adj", kind: "adj", pos: "adj", shift: 1, tr: (x) => `fazla ${x}`, en: (x) => `too ${x}`, es: (x) => `demasiado ${x}`, it: (x) => `troppo ${x}`, ru: (x) => `слишком ${x}`, pt: (x) => `demasiado ${x}`, fr: (x) => `trop ${x}`, de: (x) => `zu ${x}` }),
  f({ id: "not_adj", kind: "adj", pos: "adj", shift: 0, tr: (x) => `${x} değil`, en: (x) => `not ${x}`, es: (x) => `no ${x}`, it: (x) => `non ${x}`, ru: (x) => `не ${x}`, pt: (x) => `não ${x}`, fr: (x) => `pas ${x}`, de: (x) => `nicht ${x}` }),
  f({ id: "somewhat", kind: "adj", pos: "adj", shift: 2, tr: (x) => `biraz ${x}`, en: (x) => `somewhat ${x}`, es: (x) => `algo ${x}`, it: (x) => `un po' ${x}`, ru: (x) => `немного ${x}`, pt: (x) => `um pouco ${x}`, fr: (x) => `un peu ${x}`, de: (x) => `etwas ${x}` }),
  f({ id: "incredibly", kind: "adj", pos: "adj", shift: 2, tr: (x) => `inanılmaz ${x}`, en: (x) => `incredibly ${x}`, es: (x) => `increíblemente ${x}`, it: (x) => `incredibilmente ${x}`, ru: (x) => `невероятно ${x}`, pt: (x) => `incrivelmente ${x}`, fr: (x) => `incroyablement ${x}`, de: (x) => `unglaublich ${x}` }),
  f({ id: "enough_adj", kind: "adj", pos: "adj", shift: 2, tr: (x) => `yeterince ${x}`, en: (x) => `${x} enough`, es: (x) => `suficientemente ${x}`, it: (x) => `abbastanza ${x}`, ru: (x) => `достаточно ${x}`, pt: (x) => `suficientemente ${x}`, fr: (x) => `assez ${x}`, de: (x) => `genug ${x}` }),
  f({ id: "less_adj", kind: "adj", pos: "adj", shift: 2, tr: (x) => `daha az ${x}`, en: (x) => `less ${x}`, es: (x) => `menos ${x}`, it: (x) => `meno ${x}`, ru: (x) => `менее ${x}`, pt: (x) => `menos ${x}`, fr: (x) => `moins ${x}`, de: (x) => `weniger ${x}` }),
  f({ id: "more_adj", kind: "adj", pos: "adj", shift: 1, tr: (x) => `daha ${x}`, en: (x) => `more ${x}`, es: (x) => `más ${x}`, it: (x) => `più ${x}`, ru: (x) => `более ${x}`, pt: (x) => `mais ${x}`, fr: (x) => `plus ${x}`, de: (x) => `mehr ${x}` }),
  f({ id: "almost_adj", kind: "adj", pos: "adj", shift: 2, tr: (x) => `neredeyse ${x}`, en: (x) => `almost ${x}`, es: (x) => `casi ${x}`, it: (x) => `quasi ${x}`, ru: (x) => `почти ${x}`, pt: (x) => `quase ${x}`, fr: (x) => `presque ${x}`, de: (x) => `fast ${x}` }),
];

export const FRAMES: Frame[] = [...META, ...NOUN, ...VERB, ...ADJ];

const POS_OVERRIDE: Record<string, Pos> = {
  love: "noun",
  resilience: "noun",
  cool: "adj",
  awesome: "adj",
  yeah: "phrase",
  download: "verb",
  hungry: "adj",
  delicious: "adj",
  happy: "adj",
  sad: "adj",
  tired: "adj",
  angry: "adj",
  afraid: "adj",
  anxious: "adj",
  confident: "adj",
  excited: "adj",
  proud: "adj",
  grateful: "adj",
  substantial: "adj",
  comprehensive: "adj",
  rigorous: "adj",
  ambiguous: "adj",
  unprecedented: "adj",
};

const DOMAIN_OVERRIDE: Record<string, Domain> = {
  hello: "abstract", goodbye: "abstract", please: "abstract", thank_you: "abstract",
  yes: "abstract", no: "abstract", good_morning: "abstract", good_night: "abstract",
  today: "abstract", tomorrow: "abstract", yesterday: "abstract", name: "abstract",
  work: "abstract", money: "abstract", weather: "abstract",
  friend: "person", family: "person", doctor: "person", waiter: "person", customer: "person",
  house: "place", school: "place", hospital: "place", city: "place",
  airport: "place", hotel: "place", museum: "place", beach: "place",
  restaurant: "place", neighborhood: "place",
  mountain: "nature", forest: "nature", river: "nature",
  water: "food", bread: "food", apple: "food", coffee: "food", tea: "food",
  milk: "food", breakfast: "food",
  ticket: "object", passport: "object", luggage: "object", reservation: "object",
  taxi: "object", train: "object", bus: "object", the_bill: "object",
  clothes: "object", phone: "object", computer: "object", device: "object", battery: "object",
  meeting: "event", interview: "event", appointment: "event",
  experience: "abstract", opinion: "abstract", decision: "abstract", problem: "abstract",
  solution: "abstract", perspective: "abstract", consequence: "abstract", achievement: "abstract",
  salary: "abstract", contract: "abstract", project: "abstract", opportunity: "abstract",
  challenge: "abstract", strategy: "abstract", deadline: "abstract", password: "abstract",
  application: "abstract", internet: "abstract", network: "abstract", innovation: "abstract",
  paradigm: "abstract", environment: "abstract", sustainability: "abstract", evidence: "abstract",
  influence: "abstract", culture: "abstract", controversy: "abstract", implication: "abstract",
  discrepancy: "abstract", nuance: "abstract", love: "abstract", resilience: "abstract",
};

// Prevent self-referential phrases ("today today", "now now").
const FRAME_EXCLUDE: Record<string, string[]> = {
  today: ["now", "today_x", "tomorrow_x", "here", "there"],
  tomorrow: ["now", "today_x", "tomorrow_x", "here", "there"],
  yesterday: ["now", "today_x", "tomorrow_x", "here", "there"],
};

export function conceptPos(tuple: ConceptTuple): Pos {
  const key = tuple[0];
  if (POS_OVERRIDE[key]) return POS_OVERRIDE[key]!;
  const cat = tuple[2];
  if (cat === "verbs" || key.startsWith("to_")) return "verb";
  if (cat === "phrases" || cat === "slang") return "phrase";
  return "noun";
}

export function conceptDomain(tuple: ConceptTuple): Domain {
  const key = tuple[0];
  if (DOMAIN_OVERRIDE[key]) return DOMAIN_OVERRIDE[key]!;
  switch (tuple[2]) {
    case "food":
      return "food";
    case "travel":
      return "place";
    case "nature":
      return "nature";
    case "tech":
    case "business":
      return "object";
    default:
      return "abstract";
  }
}

export function frameApplies(frame: Frame, pos: Pos, domain: Domain, key: string): boolean {
  if (FRAME_EXCLUDE[key]?.includes(frame.id)) return false;
  if (frame.kind === "verb") return pos === "verb";
  if (frame.kind === "adj") return pos === "adj";
  if (frame.kind === "noun") return pos === "noun" && domain !== "number" && !!frame.d?.includes(domain);
  if (domain === "number") return frame.num === true;
  if (pos === "verb") return frame.v === true;
  if (pos === "adj") return frame.a !== false;
  if (pos === "phrase") return frame.ph !== false;
  return Array.isArray(frame.d) && frame.d.includes(domain);
}
