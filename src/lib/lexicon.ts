import type { LangCode, Level, WordCategory } from "./types";

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

export const CONCEPTS: ConceptTuple[] = [
  ["hello", "A1", "daily", "merhaba", "hello", "hola", "ciao", "привет", "olá", "bonjour", "hallo"],
  ["goodbye", "A1", "daily", "hoşça kal", "goodbye", "adiós", "arrivederci", "до свидания", "adeus", "au revoir", "auf Wiedersehen"],
  ["please", "A1", "daily", "lütfen", "please", "por favor", "per favore", "пожалуйста", "por favor", "s'il vous plaît", "bitte"],
  ["thank_you", "A1", "daily", "teşekkürler", "thank you", "gracias", "grazie", "спасибо", "obrigado", "merci", "danke"],
  ["yes", "A1", "daily", "evet", "yes", "sí", "sì", "да", "sim", "oui", "ja"],
  ["no", "A1", "daily", "hayır", "no", "no", "no", "нет", "não", "non", "nein"],
  ["water", "A1", "daily", "su", "water", "agua", "acqua", "вода", "água", "eau", "Wasser"],
  ["house", "A1", "daily", "ev", "house", "casa", "casa", "дом", "casa", "maison", "Haus"],
  ["friend", "A1", "daily", "arkadaş", "friend", "amigo", "amico", "друг", "amigo", "ami", "Freund"],
  ["family", "A1", "daily", "aile", "family", "familia", "famiglia", "семья", "família", "famille", "Familie"],
  ["name", "A1", "daily", "isim", "name", "nombre", "nome", "имя", "nome", "nom", "Name"],
  ["good_morning", "A1", "daily", "günaydın", "good morning", "buenos días", "buongiorno", "доброе утро", "bom dia", "bonjour", "guten Morgen"],
  ["good_night", "A1", "daily", "iyi geceler", "good night", "buenas noches", "buona notte", "спокойной ночи", "boa noite", "bonne nuit", "gute Nacht"],
  ["today", "A1", "daily", "bugün", "today", "hoy", "oggi", "сегодня", "hoje", "aujourd'hui", "heute"],
  ["tomorrow", "A1", "daily", "yarın", "tomorrow", "mañana", "domani", "завтра", "amanhã", "demain", "morgen"],
  ["yesterday", "A1", "daily", "dün", "yesterday", "ayer", "ieri", "вчера", "ontem", "hier", "gestern"],
  ["bread", "A1", "food", "ekmek", "bread", "pan", "pane", "хлеб", "pão", "pain", "Brot"],
  ["apple", "A1", "food", "elma", "apple", "manzana", "mela", "яблоко", "maçã", "pomme", "Apfel"],
  ["coffee", "A1", "food", "kahve", "coffee", "café", "caffè", "кофе", "café", "café", "Kaffee"],
  ["tea", "A1", "food", "çay", "tea", "té", "tè", "чай", "chá", "thé", "Tee"],
  ["milk", "A1", "food", "süt", "milk", "leche", "latte", "молоко", "leite", "lait", "Milch"],
  ["restaurant", "A1", "food", "restoran", "restaurant", "restaurante", "ristorante", "ресторан", "restaurante", "restaurant", "Restaurant"],
  ["breakfast", "A1", "food", "kahvaltı", "breakfast", "desayuno", "colazione", "завтрак", "café da manhã", "petit-déjeuner", "Frühstück"],
  ["hungry", "A1", "food", "aç", "hungry", "hambriento", "affamato", "голодный", "faminto", "affamé", "hungrig"],
  ["airport", "A1", "travel", "havaalanı", "airport", "aeropuerto", "aeroporto", "аэропорт", "aeroporto", "aéroport", "Flughafen"],
  ["hotel", "A1", "travel", "otel", "hotel", "hotel", "hotel", "отель", "hotel", "hôtel", "Hotel"],
  ["ticket", "A1", "travel", "bilet", "ticket", "billete", "biglietto", "билет", "bilhete", "billet", "Ticket"],
  ["passport", "A1", "travel", "pasaport", "passport", "pasaporte", "passaporto", "паспорт", "passaporte", "passeport", "Reisepass"],
  ["taxi", "A1", "travel", "taksi", "taxi", "taxi", "taxi", "такси", "táxi", "taxi", "Taxi"],
  ["train", "A1", "travel", "tren", "train", "tren", "treno", "поезд", "trem", "train", "Zug"],
  ["bus", "A1", "travel", "otobüs", "bus", "autobús", "autobus", "автобус", "ônibus", "bus", "Bus"],
  ["city", "A1", "travel", "şehir", "city", "ciudad", "città", "город", "cidade", "ville", "Stadt"],
  ["one", "A1", "numbers", "bir", "one", "uno", "uno", "один", "um", "un", "eins"],
  ["two", "A1", "numbers", "iki", "two", "dos", "due", "два", "dois", "deux", "zwei"],
  ["three", "A1", "numbers", "üç", "three", "tres", "tre", "три", "três", "trois", "drei"],
  ["ten", "A1", "numbers", "on", "ten", "diez", "dieci", "десять", "dez", "dix", "zehn"],
  ["monday", "A1", "numbers", "pazartesi", "Monday", "lunes", "lunedì", "понедельник", "segunda-feira", "lundi", "Montag"],
  ["hour", "A1", "numbers", "saat", "hour", "hora", "ora", "час", "hora", "heure", "Stunde"],
  ["happy", "A1", "emotions", "mutlu", "happy", "feliz", "felice", "счастливый", "feliz", "heureux", "glücklich"],
  ["sad", "A1", "emotions", "üzgün", "sad", "triste", "triste", "грустный", "triste", "triste", "traurig"],
  ["tired", "A1", "emotions", "yorgun", "tired", "cansado", "stanco", "усталый", "cansado", "fatigué", "müde"],
  ["love", "A1", "emotions", "aşk", "love", "amor", "amore", "любовь", "amor", "amour", "Liebe"],
  ["to_go", "A1", "verbs", "gitmek", "to go", "ir", "andare", "идти", "ir", "aller", "gehen"],
  ["to_eat", "A1", "verbs", "yemek", "to eat", "comer", "mangiare", "есть", "comer", "manger", "essen"],
  ["to_speak", "A1", "verbs", "konuşmak", "to speak", "hablar", "parlare", "говорить", "falar", "parler", "sprechen"],
  ["to_drink", "A1", "verbs", "içmek", "to drink", "beber", "bere", "пить", "beber", "boire", "trinken"],
  ["how_are_you", "A1", "phrases", "nasılsın", "how are you", "cómo estás", "come stai", "как дела", "como vai", "comment ça va", "wie geht's"],
  ["see_you_later", "A1", "phrases", "görüşürüz", "see you later", "hasta luego", "a dopo", "увидимся", "até logo", "à plus tard", "bis später"],
  ["nice_to_meet_you", "A1", "phrases", "tanıştığımıza memnun oldum", "nice to meet you", "encantado", "piacere", "приятно познакомиться", "prazer em conhecer", "enchanté", "freut mich"],
  ["my_name_is", "A1", "phrases", "benim adım", "my name is", "me llamo", "mi chiamo", "меня зовут", "meu nome é", "je m'appelle", "ich heiße"],
  ["weather", "A2", "daily", "hava durumu", "weather", "tiempo", "tempo", "погода", "tempo", "météo", "Wetter"],
  ["clothes", "A2", "daily", "kıyafet", "clothes", "ropa", "vestiti", "одежда", "roupa", "vêtements", "Kleidung"],
  ["work", "A2", "daily", "iş", "work", "trabajo", "lavoro", "работа", "trabalho", "travail", "Arbeit"],
  ["school", "A2", "daily", "okul", "school", "escuela", "scuola", "школа", "escola", "école", "Schule"],
  ["money", "A2", "daily", "para", "money", "dinero", "soldi", "деньги", "dinheiro", "argent", "Geld"],
  ["doctor", "A2", "daily", "doktor", "doctor", "médico", "dottore", "врач", "médico", "médecin", "Arzt"],
  ["hospital", "A2", "daily", "hastane", "hospital", "hospital", "ospedale", "больница", "hospital", "hôpital", "Krankenhaus"],
  ["phone", "A2", "tech", "telefon", "phone", "teléfono", "telefono", "телефон", "telefone", "téléphone", "Telefon"],
  ["computer", "A2", "tech", "bilgisayar", "computer", "ordenador", "computer", "компьютер", "computador", "ordinateur", "Computer"],
  ["internet", "A2", "tech", "internet", "internet", "internet", "internet", "интернет", "internet", "internet", "Internet"],
  ["luggage", "A2", "travel", "valiz", "luggage", "equipaje", "bagaglio", "багаж", "bagagem", "bagages", "Gepäck"],
  ["reservation", "A2", "travel", "rezervasyon", "reservation", "reserva", "prenotazione", "бронь", "reserva", "réservation", "Reservierung"],
  ["museum", "A2", "travel", "müze", "museum", "museo", "museo", "музей", "museu", "musée", "Museum"],
  ["beach", "A2", "travel", "plaj", "beach", "playa", "spiaggia", "пляж", "praia", "plage", "Strand"],
  ["mountain", "A2", "nature", "dağ", "mountain", "montaña", "montagna", "гора", "montanha", "montagne", "Berg"],
  ["forest", "A2", "nature", "orman", "forest", "bosque", "foresta", "лес", "floresta", "forêt", "Wald"],
  ["river", "A2", "nature", "nehir", "river", "río", "fiume", "река", "rio", "rivière", "Fluss"],
  ["delicious", "A2", "food", "lezzetli", "delicious", "delicioso", "delizioso", "вкусный", "delicioso", "délicieux", "lecker"],
  ["the_bill", "A2", "food", "hesap", "the bill", "la cuenta", "il conto", "счёт", "a conta", "l'addition", "die Rechnung"],
  ["waiter", "A2", "food", "garson", "waiter", "camarero", "cameriere", "официант", "garçom", "serveur", "Kellner"],
  ["to_understand", "A2", "verbs", "anlamak", "to understand", "entender", "capire", "понимать", "entender", "comprendre", "verstehen"],
  ["to_learn", "A2", "verbs", "öğrenmek", "to learn", "aprender", "imparare", "учить", "aprender", "apprendre", "lernen"],
  ["to_write", "A2", "verbs", "yazmak", "to write", "escribir", "scrivere", "писать", "escrever", "écrire", "schreiben"],
  ["to_read", "A2", "verbs", "okumak", "to read", "leer", "leggere", "читать", "ler", "lire", "lesen"],
  ["to_listen", "A2", "verbs", "dinlemek", "to listen", "escuchar", "ascoltare", "слушать", "escutar", "écouter", "zuhören"],
  ["angry", "A2", "emotions", "kızgın", "angry", "enojado", "arrabbiato", "злой", "bravo", "en colère", "wütend"],
  ["afraid", "A2", "emotions", "korkmuş", "afraid", "asustado", "spaventato", "испуганный", "com medo", "effrayé", "ängstlich"],
  ["cool", "A2", "slang", "havalı", "cool", "genial", "figo", "круто", "legal", "cool", "cool"],
  ["yeah", "A2", "slang", "aynen", "yeah", "claro", "già", "ага", "é isso", "ouais", "jo"],
  ["awesome", "A2", "slang", "harika", "awesome", "increíble", "pazzesco", "офигенно", "massa", "génial", "genial"],
  ["appointment", "B1", "daily", "randevu", "appointment", "cita", "appuntamento", "встреча", "consulta", "rendez-vous", "Termin"],
  ["experience", "B1", "daily", "deneyim", "experience", "experiencia", "esperienza", "опыт", "experiência", "expérience", "Erfahrung"],
  ["opinion", "B1", "daily", "fikir", "opinion", "opinión", "opinione", "мнение", "opinião", "avis", "Meinung"],
  ["decision", "B1", "daily", "karar", "decision", "decisión", "decisione", "решение", "decisão", "décision", "Entscheidung"],
  ["problem", "B1", "daily", "sorun", "problem", "problema", "problema", "проблема", "problema", "problème", "Problem"],
  ["solution", "B1", "daily", "çözüm", "solution", "solución", "soluzione", "решение", "solução", "solution", "Lösung"],
  ["neighborhood", "B1", "daily", "mahalle", "neighborhood", "barrio", "quartiere", "район", "bairro", "quartier", "Viertel"],
  ["meeting", "B1", "business", "toplantı", "meeting", "reunión", "riunione", "совещание", "reunião", "réunion", "Besprechung"],
  ["salary", "B1", "business", "maaş", "salary", "salario", "stipendio", "зарплата", "salário", "salaire", "Gehalt"],
  ["contract", "B1", "business", "sözleşme", "contract", "contrato", "contratto", "контракт", "contrato", "contrat", "Vertrag"],
  ["customer", "B1", "business", "müşteri", "customer", "cliente", "cliente", "клиент", "cliente", "client", "Kunde"],
  ["project", "B1", "business", "proje", "project", "proyecto", "progetto", "проект", "projeto", "projet", "Projet"],
  ["interview", "B1", "business", "mülakat", "interview", "entrevista", "colloquio", "собеседование", "entrevista", "entretien", "Vorstellungsgespräch"],
  ["password", "B1", "tech", "şifre", "password", "contraseña", "password", "пароль", "senha", "mot de passe", "Passwort"],
  ["application", "B1", "tech", "uygulama", "application", "aplicación", "applicazione", "приложение", "aplicativo", "application", "Anwendung"],
  ["device", "B1", "tech", "cihaz", "device", "dispositivo", "dispositivo", "устройство", "dispositivo", "appareil", "Gerät"],
  ["battery", "B1", "tech", "pil", "battery", "batería", "batteria", "батарея", "bateria", "batterie", "Batterie"],
  ["download", "B1", "tech", "indirmek", "to download", "descargar", "scaricare", "скачивать", "baixar", "télécharger", "herunterladen"],
  ["anxious", "B1", "emotions", "endişeli", "anxious", "ansioso", "ansioso", "тревожный", "ansioso", "anxieux", "besorgt"],
  ["confident", "B1", "emotions", "kendinden emin", "confident", "seguro", "sicuro", "уверенный", "confiante", "confiant", "selbstsicher"],
  ["excited", "B1", "emotions", "heyecanlı", "excited", "emocionado", "entusiasta", "взволнованный", "empolgado", "excité", "aufgeregt"],
  ["proud", "B1", "emotions", "gururlu", "proud", "orgulloso", "orgoglioso", "гордый", "orgulhoso", "fier", "stolz"],
  ["grateful", "B1", "emotions", "minnettar", "grateful", "agradecido", "grato", "благодарный", "grato", "reconnaissant", "dankbar"],
  ["how_much", "B1", "phrases", "ne kadar", "how much is it", "cuánto cuesta", "quanto costa", "сколько стоит", "quanto custa", "combien ça coûte", "wie viel kostet das"],
  ["i_dont_understand", "B1", "phrases", "anlamadım", "I don't understand", "no entiendo", "non capisco", "я не понимаю", "não entendo", "je ne comprends pas", "ich verstehe nicht"],
  ["could_you_repeat", "B1", "phrases", "tekrar eder misiniz", "could you repeat", "puede repetir", "può ripetere", "повторите пожалуйста", "pode repetir", "pouvez-vous répéter", "können Sie das wiederholen"],
  ["where_is_bathroom", "B1", "phrases", "tuvalet nerede", "where is the bathroom", "dónde está el baño", "dov'è il bagno", "где туалет", "onde é o banheiro", "où sont les toilettes", "wo ist die Toilette"],
  ["this_is_the_quality", "B1", "phrases", "bu kalite", "this is the quality", "esta es la calidad", "questa è la qualità", "это качество", "esta é a qualidade", "c'est la qualité", "das ist die Qualität"],
  ["my_quality", "B1", "phrases", "kalitem", "my quality", "mi calidad", "la mia qualità", "моё качество", "minha qualidade", "ma qualité", "meine Qualität"],
  ["my_quantity", "B1", "phrases", "miktarım", "my quantity", "mi cantidad", "la mia quantità", "моё количество", "minha quantidade", "ma quantité", "meine Quantität"],
  ["environment", "B2", "nature", "çevre", "environment", "medio ambiente", "ambiente", "окружающая среда", "meio ambiente", "environnement", "Umwelt"],
  ["sustainability", "B2", "nature", "sürdürülebilirlik", "sustainability", "sostenibilidad", "sostenibilità", "устойчивость", "sustentabilidade", "durabilité", "Nachhaltigkeit"],
  ["innovation", "B2", "tech", "yenilik", "innovation", "innovación", "innovazione", "инновация", "inovação", "innovation", "Innovation"],
  ["network", "B2", "tech", "ağ", "network", "red", "rete", "сеть", "rede", "réseau", "Netzwerk"],
  ["perspective", "B2", "daily", "bakış açısı", "perspective", "perspectiva", "prospettiva", "перспектива", "perspectiva", "perspective", "Perspektive"],
  ["consequence", "B2", "daily", "sonuç", "consequence", "consecuencia", "conseguenza", "последствие", "consequência", "conséquence", "Konsequenz"],
  ["achievement", "B2", "daily", "başarı", "achievement", "logro", "risultato", "достижение", "conquista", "réussite", "Leistung"],
  ["opportunity", "B2", "business", "fırsat", "opportunity", "oportunidad", "opportunità", "возможность", "oportunidade", "opportunité", "Gelegenheit"],
  ["challenge", "B2", "business", "meydan okuma", "challenge", "desafío", "sfida", "вызов", "desafio", "défi", "Herausforderung"],
  ["strategy", "B2", "business", "strateji", "strategy", "estrategia", "strategia", "стратегия", "estratégia", "stratégie", "Strategie"],
  ["deadline", "B2", "business", "son teslim tarihi", "deadline", "fecha límite", "scadenza", "срок", "prazo", "date limite", "Frist"],
  ["evidence", "B2", "daily", "kanıt", "evidence", "evidencia", "prova", "доказательство", "evidência", "preuve", "Beweis"],
  ["influence", "B2", "daily", "etki", "influence", "influencia", "influenza", "влияние", "influência", "influence", "Einfluss"],
  ["culture", "B2", "daily", "kültür", "culture", "cultura", "cultura", "культура", "cultura", "culture", "Kultur"],
  ["controversy", "B2", "daily", "tartışma", "controversy", "controversia", "controversia", "спор", "controvérsia", "controverse", "Kontroverse"],
  ["nonetheless", "C1", "phrases", "yine de", "nonetheless", "no obstante", "nondimeno", "тем не менее", "contudo", "néanmoins", "dennoch"],
  ["substantial", "C1", "daily", "önemli ölçüde", "substantial", "sustancial", "sostanziale", "существенный", "substancial", "substantiel", "wesentlich"],
  ["implication", "C1", "daily", "çıkarım", "implication", "implicación", "implicazione", "следствие", "implicação", "implication", "Implikation"],
  ["comprehensive", "C1", "daily", "kapsamlı", "comprehensive", "integral", "esaustivo", "всеобъемлющий", "abrangente", "complet", "umfassend"],
  ["discrepancy", "C1", "daily", "tutarsızlık", "discrepancy", "discrepancia", "discrepanza", "расхождение", "discrepância", "écart", "Diskrepanz"],
  ["to_articulate", "C1", "verbs", "açıkça ifade etmek", "to articulate", "articular", "articolare", "формулировать", "articular", "articuler", "artikulieren"],
  ["unprecedented", "C1", "daily", "eşi görülmemiş", "unprecedented", "sin precedentes", "senza precedenti", "беспрецедентный", "sem precedentes", "sans précédent", "beispiellos"],
  ["paradigm", "C1", "tech", "paradigma", "paradigm", "paradigma", "paradigma", "парадигма", "paradigma", "paradigme", "Paradigma"],
  ["rigorous", "C1", "daily", "titiz", "rigorous", "riguroso", "rigoroso", "строгий", "rigoroso", "rigoureux", "rigoros"],
  ["ambiguous", "C1", "daily", "belirsiz", "ambiguous", "ambiguo", "ambiguo", "двусмысленный", "ambíguo", "ambigu", "mehrdeutig"],
  ["resilience", "C1", "emotions", "dayanıklılık", "resilience", "resiliencia", "resilienza", "устойчивость", "resiliência", "résilience", "Resilienz"],
  ["nuance", "C1", "daily", "nüans", "nuance", "matiz", "sfumatura", "нюанс", "nuance", "nuance", "Nuance"],
  ["nevertheless", "C1", "phrases", "buna rağmen", "nevertheless", "sin embargo", "tuttavia", "однако", "no entanto", "cependant", "trotzdem"],
];

const LANG_INDEX: LangCode[] = ["en", "es", "it", "ru", "pt", "fr", "de"];
export const TARGET_WORDS_PER_LANGUAGE = 7500;

export type SeedWord = {
  conceptKey: string;
  language: LangCode;
  term: string;
  translationTr: string;
  translationEn: string;
  level: Level;
  category: WordCategory;
  isCustom: boolean;
};

type Pos = "noun" | "verb" | "adj" | "phrase";

/**
 * Semantic classes: a frame is only combined with a noun whose class it
 * explicitly allows. This guarantees meaningful output in every language —
 * "I drink water" exists, "I drink a rabbit/ticket" can never be generated.
 */
type SemClass = "food" | "drink" | "place" | "person" | "object" | "other";

const CLASS_MAP: Record<string, SemClass> = {
  // yiyecek — yenilebilir
  bread: "food", apple: "food", breakfast: "food",
  // içecek — içilebilir
  water: "drink", coffee: "drink", tea: "drink", milk: "drink",
  // yer — "nerede / burada / var mı" mantıklı
  house: "place", restaurant: "place", airport: "place", hotel: "place",
  city: "place", museum: "place", beach: "place", school: "place",
  hospital: "place", forest: "place", mountain: "place", river: "place",
  neighborhood: "place",
  // kişi — "benim / nerede / tanıyorum" mantıklı
  friend: "person", family: "person", doctor: "person", waiter: "person",
  customer: "person",
  // nesne — "yeni / benim / ihtiyacım var" mantıklı
  ticket: "object", passport: "object", luggage: "object", phone: "object",
  computer: "object", battery: "object", device: "object", clothes: "object",
  taxi: "object", train: "object", bus: "object", password: "object",
  application: "object", project: "object", contract: "object",
};

function conceptClass(key: string): SemClass {
  return CLASS_MAP[key] ?? "other";
}

type Frame = {
  id: string;
  pos: Pos | "all";
  /** for noun frames: which semantic classes may fill the slot */
  allow?: SemClass[];
  shift: number;
  tr: (x: string) => string;
  en: (x: string) => string;
  es: (x: string) => string;
  it: (x: string) => string;
  ru: (x: string) => string;
  pt: (x: string) => string;
  fr: (x: string) => string;
  de: (x: string) => string;
};

const FRAMES: Frame[] = [
  { id: "the_word", pos: "all", shift: 0, tr: (x) => `${x} kelimesi`, en: (x) => `the word ${x}`, es: (x) => `la palabra ${x}`, it: (x) => `la parola ${x}`, ru: (x) => `слово ${x}`, pt: (x) => `a palavra ${x}`, fr: (x) => `le mot ${x}`, de: (x) => `das Wort ${x}` },
  { id: "repeat", pos: "all", shift: 0, tr: (x) => `${x} tekrar`, en: (x) => `repeat ${x}`, es: (x) => `repite ${x}`, it: (x) => `ripeti ${x}`, ru: (x) => `повторите ${x}`, pt: (x) => `repita ${x}`, fr: (x) => `répétez ${x}`, de: (x) => `wiederhole ${x}` },
  { id: "listen", pos: "all", shift: 0, tr: (x) => `${x} dinle`, en: (x) => `listen to ${x}`, es: (x) => `escucha ${x}`, it: (x) => `ascolta ${x}`, ru: (x) => `слушайте ${x}`, pt: (x) => `ouça ${x}`, fr: (x) => `écoutez ${x}`, de: (x) => `höre ${x}` },
  { id: "say", pos: "all", shift: 0, tr: (x) => `${x} söyle`, en: (x) => `say ${x}`, es: (x) => `di ${x}`, it: (x) => `dì ${x}`, ru: (x) => `скажите ${x}`, pt: (x) => `diga ${x}`, fr: (x) => `dites ${x}`, de: (x) => `sag ${x}` },
  { id: "write", pos: "all", shift: 1, tr: (x) => `${x} yaz`, en: (x) => `write ${x}`, es: (x) => `escribe ${x}`, it: (x) => `scrivi ${x}`, ru: (x) => `напишите ${x}`, pt: (x) => `escreva ${x}`, fr: (x) => `écrivez ${x}`, de: (x) => `schreib ${x}` },
  { id: "read", pos: "all", shift: 1, tr: (x) => `${x} oku`, en: (x) => `read ${x}`, es: (x) => `lee ${x}`, it: (x) => `leggi ${x}`, ru: (x) => `читайте ${x}`, pt: (x) => `leia ${x}`, fr: (x) => `lisez ${x}`, de: (x) => `lies ${x}` },
  { id: "remember", pos: "all", shift: 1, tr: (x) => `${x} hatırla`, en: (x) => `I remember ${x}`, es: (x) => `recuerdo ${x}`, it: (x) => `ricordo ${x}`, ru: (x) => `я помню ${x}`, pt: (x) => `lembro ${x}`, fr: (x) => `je me souviens de ${x}`, de: (x) => `ich erinnere mich an ${x}` },
  { id: "practice", pos: "all", shift: 1, tr: (x) => `${x} çalış`, en: (x) => `I practice ${x}`, es: (x) => `practico ${x}`, it: (x) => `pratico ${x}`, ru: (x) => `я практикую ${x}`, pt: (x) => `pratico ${x}`, fr: (x) => `je pratique ${x}`, de: (x) => `ich übe ${x}` },
  { id: "learn_x", pos: "all", shift: 1, tr: (x) => `${x} öğren`, en: (x) => `I learn ${x}`, es: (x) => `aprendo ${x}`, it: (x) => `imparo ${x}`, ru: (x) => `я учу ${x}`, pt: (x) => `aprendo ${x}`, fr: (x) => `j'apprends ${x}`, de: (x) => `ich lerne ${x}` },
  { id: "meaning", pos: "all", shift: 1, tr: (x) => `${x} anlamı`, en: (x) => `the meaning of ${x}`, es: (x) => `el significado de ${x}`, it: (x) => `il significato di ${x}`, ru: (x) => `значение ${x}`, pt: (x) => `o significado de ${x}`, fr: (x) => `le sens de ${x}`, de: (x) => `die Bedeutung von ${x}` },

  // Zaman zarfları yalnızca fiillerle: "bugün yemek ye" mantıklı, "bugün elma" değil.
  { id: "again", pos: "verb", shift: 0, tr: (x) => `tekrar ${x}`, en: (x) => `${x} again`, es: (x) => `${x} otra vez`, it: (x) => `${x} di nuovo`, ru: (x) => `${x} снова`, pt: (x) => `${x} de novo`, fr: (x) => `${x} encore`, de: (x) => `nochmal ${x}` },
  { id: "now", pos: "verb", shift: 0, tr: (x) => `şimdi ${x}`, en: (x) => `${x} now`, es: (x) => `${x} ahora`, it: (x) => `${x} adesso`, ru: (x) => `${x} сейчас`, pt: (x) => `${x} agora`, fr: (x) => `${x} maintenant`, de: (x) => `jetzt ${x}` },
  { id: "today_x", pos: "verb", shift: 0, tr: (x) => `bugün ${x}`, en: (x) => `${x} today`, es: (x) => `${x} hoy`, it: (x) => `${x} oggi`, ru: (x) => `${x} сегодня`, pt: (x) => `${x} hoje`, fr: (x) => `${x} aujourd'hui`, de: (x) => `heute ${x}` },
  { id: "tomorrow_x", pos: "verb", shift: 1, tr: (x) => `yarın ${x}`, en: (x) => `${x} tomorrow`, es: (x) => `${x} mañana`, it: (x) => `${x} domani`, ru: (x) => `${x} завтра`, pt: (x) => `${x} amanhã`, fr: (x) => `demain ${x}` , de: (x) => `morgen ${x}` },

  // Yeme/içme yalnız uygun sınıfla: saçma birleşim üretilemez.
  { id: "eat_x", pos: "noun", allow: ["food"], shift: 0, tr: (x) => `${x} yiyorum`, en: (x) => `I eat ${x}`, es: (x) => `como ${x}`, it: (x) => `mangio ${x}`, ru: (x) => `я ем ${x}`, pt: (x) => `como ${x}`, fr: (x) => `je mange ${x}`, de: (x) => `ich esse ${x}` },
  { id: "drink_x", pos: "noun", allow: ["drink"], shift: 0, tr: (x) => `${x} içiyorum`, en: (x) => `I drink ${x}`, es: (x) => `bebo ${x}`, it: (x) => `bevo ${x}`, ru: (x) => `я пью ${x}`, pt: (x) => `bebo ${x}`, fr: (x) => `je bois ${x}`, de: (x) => `ich trinke ${x}` },
  { id: "have_x", pos: "noun", allow: ["object", "food", "drink"], shift: 0, tr: (x) => `${x} var bende`, en: (x) => `I have ${x}`, es: (x) => `tengo ${x}`, it: (x) => `ho ${x}`, ru: (x) => `у меня есть ${x}`, pt: (x) => `tenho ${x}`, fr: (x) => `j'ai ${x}`, de: (x) => `ich habe ${x}` },

  { id: "need", pos: "noun", allow: ["object", "food", "drink"], shift: 0, tr: (x) => `${x} ihtiyacım var`, en: (x) => `I need ${x}`, es: (x) => `necesito ${x}`, it: (x) => `ho bisogno di ${x}`, ru: (x) => `мне нужен ${x}`, pt: (x) => `preciso de ${x}`, fr: (x) => `j'ai besoin de ${x}`, de: (x) => `ich brauche ${x}` },
  { id: "want", pos: "noun", allow: ["object", "food", "drink"], shift: 0, tr: (x) => `${x} istiyorum`, en: (x) => `I want ${x}`, es: (x) => `quiero ${x}`, it: (x) => `voglio ${x}`, ru: (x) => `я хочу ${x}`, pt: (x) => `quero ${x}`, fr: (x) => `je veux ${x}`, de: (x) => `ich möchte ${x}` },
  { id: "like", pos: "noun", allow: ["food", "drink", "place", "object"], shift: 0, tr: (x) => `${x} seviyorum`, en: (x) => `I like ${x}`, es: (x) => `me gusta ${x}`, it: (x) => `mi piace ${x}`, ru: (x) => `мне нравится ${x}`, pt: (x) => `gosto de ${x}`, fr: (x) => `j'aime ${x}`, de: (x) => `ich mag ${x}` },
  { id: "where_is", pos: "noun", allow: ["place", "person", "object"], shift: 0, tr: (x) => `${x} nerede`, en: (x) => `where is ${x}`, es: (x) => `¿dónde está ${x}?`, it: (x) => `dov'è ${x}?`, ru: (x) => `где ${x}?`, pt: (x) => `onde é ${x}?`, fr: (x) => `où est ${x}?`, de: (x) => `wo ist ${x}?` },
  { id: "this_is", pos: "noun", allow: ["place", "person", "object", "food", "drink"], shift: 0, tr: (x) => `bu ${x}`, en: (x) => `this is ${x}`, es: (x) => `este es ${x}`, it: (x) => `questo è ${x}`, ru: (x) => `это ${x}`, pt: (x) => `isto é ${x}`, fr: (x) => `c'est ${x}`, de: (x) => `das ist ${x}` },
  { id: "my", pos: "noun", allow: ["person", "object", "food", "drink"], shift: 0, tr: (x) => `benim ${x}`, en: (x) => `my ${x}`, es: (x) => `mi ${x}`, it: (x) => `il mio ${x}`, ru: (x) => `мой ${x}`, pt: (x) => `meu ${x}`, fr: (x) => `mon ${x}`, de: (x) => `mein ${x}` },
  { id: "your", pos: "noun", allow: ["person", "object"], shift: 0, tr: (x) => `senin ${x}`, en: (x) => `your ${x}`, es: (x) => `tu ${x}`, it: (x) => `il tuo ${x}`, ru: (x) => `ваш ${x}`, pt: (x) => `seu ${x}`, fr: (x) => `votre ${x}`, de: (x) => `dein ${x}` },
  { id: "see_x", pos: "noun", allow: ["person", "place", "object"], shift: 0, tr: (x) => `${x} görüyorum`, en: (x) => `I see ${x}`, es: (x) => `veo ${x}`, it: (x) => `vedo ${x}`, ru: (x) => `я вижу ${x}`, pt: (x) => `vejo ${x}`, fr: (x) => `je vois ${x}`, de: (x) => `ich sehe ${x}` },
  { id: "know_x", pos: "noun", allow: ["person", "place"], shift: 1, tr: (x) => `${x} biliyorum`, en: (x) => `I know ${x}`, es: (x) => `conozco ${x}`, it: (x) => `conosco ${x}`, ru: (x) => `я знаю ${x}`, pt: (x) => `conheço ${x}`, fr: (x) => `je connais ${x}`, de: (x) => `ich kenne ${x}` },
  { id: "here", pos: "noun", allow: ["place", "person", "object"], shift: 1, tr: (x) => `${x} burada`, en: (x) => `${x} is here`, es: (x) => `${x} está aquí`, it: (x) => `${x} è qui`, ru: (x) => `${x} здесь`, pt: (x) => `${x} está aqui`, fr: (x) => `${x} est ici`, de: (x) => `${x} ist hier` },
  { id: "there", pos: "noun", allow: ["place", "person", "object"], shift: 1, tr: (x) => `${x} orada`, en: (x) => `${x} is there`, es: (x) => `${x} está allí`, it: (x) => `${x} è lì`, ru: (x) => `${x} там`, pt: (x) => `${x} está lá`, fr: (x) => `${x} est là-bas`, de: (x) => `${x} ist dort` },
  { id: "have_you", pos: "noun", allow: ["object", "food", "drink"], shift: 1, tr: (x) => `${x} var mı`, en: (x) => `do you have ${x}?`, es: (x) => `¿tiene ${x}?`, it: (x) => `ha ${x}?`, ru: (x) => `у вас есть ${x}?`, pt: (x) => `você tem ${x}?`, fr: (x) => `avez-vous ${x}?`, de: (x) => `haben Sie ${x}?` },
  { id: "please_x", pos: "noun", allow: ["food", "drink", "object"], shift: 0, tr: (x) => `${x} lütfen`, en: (x) => `${x}, please`, es: (x) => `${x}, por favor`, it: (x) => `${x}, per favore`, ru: (x) => `${x}, пожалуйста`, pt: (x) => `${x}, por favor`, fr: (x) => `${x}, s'il vous plaît`, de: (x) => `${x}, bitte` },
  { id: "is_there", pos: "noun", allow: ["place", "food", "drink", "object"], shift: 1, tr: (x) => `${x} var mı`, en: (x) => `is there ${x}?`, es: (x) => `¿hay ${x}?`, it: (x) => `c'è ${x}?`, ru: (x) => `есть ${x}?`, pt: (x) => `há ${x}?`, fr: (x) => `y a-t-il ${x}?`, de: (x) => `gibt es ${x}?` },
  { id: "how_much_x", pos: "noun", allow: ["food", "drink", "object"], shift: 1, tr: (x) => `${x} ne kadar`, en: (x) => `how much is ${x}?`, es: (x) => `¿cuánto cuesta ${x}?`, it: (x) => `quanto costa ${x}?`, ru: (x) => `сколько стоит ${x}?`, pt: (x) => `quanto custa ${x}?`, fr: (x) => `combien coûte ${x}?`, de: (x) => `was kostet ${x}?` },
  { id: "new_x", pos: "noun", allow: ["object"], shift: 1, tr: (x) => `yeni ${x}`, en: (x) => `new ${x}`, es: (x) => `${x} nuevo`, it: (x) => `${x} nuovo`, ru: (x) => `новый ${x}`, pt: (x) => `${x} novo`, fr: (x) => `${x} nouveau`, de: (x) => `neues ${x}` },
  { id: "good_x", pos: "noun", allow: ["food", "drink", "place", "object"], shift: 1, tr: (x) => `iyi ${x}`, en: (x) => `good ${x}`, es: (x) => `buen ${x}`, it: (x) => `buon ${x}`, ru: (x) => `хороший ${x}`, pt: (x) => `bom ${x}`, fr: (x) => `bon ${x}`, de: (x) => `gutes ${x}` },

  { id: "want_to", pos: "verb", shift: 0, tr: (x) => `${x} istiyorum`, en: (x) => `I want to ${x}`, es: (x) => `quiero ${x}`, it: (x) => `voglio ${x}`, ru: (x) => `я хочу ${x}`, pt: (x) => `quero ${x}`, fr: (x) => `je veux ${x}`, de: (x) => `ich möchte ${x}` },
  { id: "need_to", pos: "verb", shift: 0, tr: (x) => `${x} gerekiyor`, en: (x) => `I need to ${x}`, es: (x) => `necesito ${x}`, it: (x) => `devo ${x}`, ru: (x) => `мне нужно ${x}`, pt: (x) => `preciso ${x}`, fr: (x) => `je dois ${x}`, de: (x) => `ich muss ${x}` },
  { id: "like_to", pos: "verb", shift: 0, tr: (x) => `${x} seviyorum`, en: (x) => `I like to ${x}`, es: (x) => `me gusta ${x}`, it: (x) => `mi piace ${x}`, ru: (x) => `мне нравится ${x}`, pt: (x) => `gosto de ${x}`, fr: (x) => `j'aime ${x}`, de: (x) => `ich mag es zu ${x}` },
  { id: "can_you", pos: "verb", shift: 0, tr: (x) => `${x} misin`, en: (x) => `can you ${x}?`, es: (x) => `¿puede ${x}?`, it: (x) => `può ${x}?`, ru: (x) => `вы можете ${x}?`, pt: (x) => `você pode ${x}?`, fr: (x) => `pouvez-vous ${x}?`, de: (x) => `können Sie ${x}?` },
  { id: "will", pos: "verb", shift: 1, tr: (x) => `${x}eceğim`, en: (x) => `I will ${x}`, es: (x) => `voy a ${x}`, it: (x) => `ho intenzione di ${x}`, ru: (x) => `я буду ${x}`, pt: (x) => `vou ${x}`, fr: (x) => `je vais ${x}`, de: (x) => `ich werde ${x}` },
  { id: "can", pos: "verb", shift: 0, tr: (x) => `${x}ebilirim`, en: (x) => `I can ${x}`, es: (x) => `puedo ${x}`, it: (x) => `posso ${x}`, ru: (x) => `я могу ${x}`, pt: (x) => `posso ${x}`, fr: (x) => `je peux ${x}`, de: (x) => `ich kann ${x}` },
  { id: "should_we", pos: "verb", shift: 1, tr: (x) => `${x}meliyiz`, en: (x) => `we should ${x}`, es: (x) => `deberíamos ${x}`, it: (x) => `dovremmo ${x}`, ru: (x) => `нам стоит ${x}`, pt: (x) => `devemos ${x}`, fr: (x) => `nous devrions ${x}`, de: (x) => `wir sollten ${x}` },
  { id: "lets", pos: "verb", shift: 1, tr: (x) => `hadi ${x}`, en: (x) => `let's ${x}`, es: (x) => `vamos a ${x}`, it: (x) => `andiamo a ${x}`, ru: (x) => `давай ${x}`, pt: (x) => `vamos ${x}`, fr: (x) => `allons ${x}`, de: (x) => `lass uns ${x}` },
  { id: "dont", pos: "verb", shift: 1, tr: (x) => `${x}me`, en: (x) => `don't ${x}`, es: (x) => `no ${x}`, it: (x) => `non ${x}`, ru: (x) => `не ${x}`, pt: (x) => `não ${x}`, fr: (x) => `ne pas ${x}`, de: (x) => `${x} nicht` },
  { id: "you_should", pos: "verb", shift: 1, tr: (x) => `${x}melisin`, en: (x) => `you should ${x}`, es: (x) => `debería ${x}`, it: (x) => `dovrebbe ${x}`, ru: (x) => `вам следует ${x}`, pt: (x) => `você deve ${x}`, fr: (x) => `vous devriez ${x}`, de: (x) => `Sie sollten ${x}` },
  { id: "must", pos: "verb", shift: 1, tr: (x) => `${x}meliyim`, en: (x) => `I must ${x}`, es: (x) => `debo ${x}`, it: (x) => `devo ${x}`, ru: (x) => `я должен ${x}`, pt: (x) => `devo ${x}`, fr: (x) => `je dois ${x}`, de: (x) => `ich muss ${x}` },
  { id: "try_to", pos: "verb", shift: 2, tr: (x) => `${x}maya çalış`, en: (x) => `try to ${x}`, es: (x) => `intenta ${x}`, it: (x) => `prova a ${x}`, ru: (x) => `попробуйте ${x}`, pt: (x) => `tente ${x}`, fr: (x) => `essayez de ${x}`, de: (x) => `versuche zu ${x}` },

  { id: "very", pos: "adj", shift: 0, tr: (x) => `çok ${x}`, en: (x) => `very ${x}`, es: (x) => `muy ${x}`, it: (x) => `molto ${x}`, ru: (x) => `очень ${x}`, pt: (x) => `muito ${x}`, fr: (x) => `très ${x}`, de: (x) => `sehr ${x}` },
  { id: "really_adj", pos: "adj", shift: 0, tr: (x) => `gerçekten ${x}`, en: (x) => `really ${x}`, es: (x) => `realmente ${x}`, it: (x) => `davvero ${x}`, ru: (x) => `действительно ${x}`, pt: (x) => `realmente ${x}`, fr: (x) => `vraiment ${x}`, de: (x) => `wirklich ${x}` },
  { id: "too_adj", pos: "adj", shift: 1, tr: (x) => `fazla ${x}`, en: (x) => `too ${x}`, es: (x) => `demasiado ${x}`, it: (x) => `troppo ${x}`, ru: (x) => `слишком ${x}`, pt: (x) => `demasiado ${x}`, fr: (x) => `trop ${x}`, de: (x) => `zu ${x}` },
  { id: "not_adj", pos: "adj", shift: 0, tr: (x) => `${x} değil`, en: (x) => `not ${x}`, es: (x) => `no ${x}`, it: (x) => `non ${x}`, ru: (x) => `не ${x}`, pt: (x) => `não ${x}`, fr: (x) => `pas ${x}`, de: (x) => `nicht ${x}` },
  { id: "somewhat", pos: "adj", shift: 2, tr: (x) => `biraz ${x}`, en: (x) => `somewhat ${x}`, es: (x) => `algo ${x}`, it: (x) => `un po' ${x}`, ru: (x) => `немного ${x}`, pt: (x) => `um pouco ${x}`, fr: (x) => `un peu ${x}`, de: (x) => `etwas ${x}` },
  { id: "incredibly", pos: "adj", shift: 2, tr: (x) => `inanılmaz ${x}`, en: (x) => `incredibly ${x}`, es: (x) => `increíblemente ${x}`, it: (x) => `incredibilmente ${x}`, ru: (x) => `невероятно ${x}`, pt: (x) => `incrivelmente ${x}`, fr: (x) => `incroyablement ${x}`, de: (x) => `unglaublich ${x}` },
  { id: "enough_adj", pos: "adj", shift: 2, tr: (x) => `yeterince ${x}`, en: (x) => `${x} enough`, es: (x) => `suficientemente ${x}`, it: (x) => `abbastanza ${x}`, ru: (x) => `достаточно ${x}`, pt: (x) => `suficientemente ${x}`, fr: (x) => `assez ${x}`, de: (x) => `genug ${x}` },
  { id: "less_adj", pos: "adj", shift: 2, tr: (x) => `daha az ${x}`, en: (x) => `less ${x}`, es: (x) => `menos ${x}`, it: (x) => `meno ${x}`, ru: (x) => `менее ${x}`, pt: (x) => `menos ${x}`, fr: (x) => `moins ${x}`, de: (x) => `weniger ${x}` },
  { id: "more_adj", pos: "adj", shift: 1, tr: (x) => `daha ${x}`, en: (x) => `more ${x}`, es: (x) => `más ${x}`, it: (x) => `più ${x}`, ru: (x) => `более ${x}`, pt: (x) => `mais ${x}`, fr: (x) => `plus ${x}`, de: (x) => `mehr ${x}` },
  { id: "almost_adj", pos: "adj", shift: 2, tr: (x) => `neredeyse ${x}`, en: (x) => `almost ${x}`, es: (x) => `casi ${x}`, it: (x) => `quasi ${x}`, ru: (x) => `почти ${x}`, pt: (x) => `quase ${x}`, fr: (x) => `presque ${x}`, de: (x) => `fast ${x}` },
];

function conceptPos(tuple: ConceptTuple): Pos {
  const key = tuple[0];
  const cat = tuple[2];
  if (cat === "verbs" || key.startsWith("to_") || key === "download") return "verb";
  if (cat === "emotions" || ["hungry", "delicious", "cool", "awesome", "substantial", "comprehensive", "rigorous", "ambiguous", "unprecedented"].includes(key)) return "adj";
  if (cat === "phrases") return "phrase";
  return "noun";
}

function shiftLevel(level: Level, shift: number): Level {
  const order: Level[] = ["A1", "A2", "B1", "B2", "C1"];
  return order[Math.min(order.length - 1, Math.max(0, order.indexOf(level) + shift))]!;
}

const small: Record<LangCode, string[]> = {
  en: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"],
  es: ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"],
  it: ["zero", "uno", "due", "tre", "quattro", "cinque", "sei", "sette", "otto", "nove", "dieci", "undici", "dodici", "tredici", "quattordici", "quindici", "sedici", "diciassette", "diciotto", "diciannove"],
  ru: ["ноль", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять", "десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"],
  pt: ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"],
  fr: ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"],
  de: ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"],
};

function underHundred(n: number, lang: LangCode): string {
  if (n < 20) return small[lang][n]!;
  const units = small[lang];
  if (lang === "en") {
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    const t = Math.floor(n / 10), u = n % 10;
    return u ? `${tens[t]}-${units[u]}` : tens[t]!;
  }
  if (lang === "es") {
    const tens = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
    const t = Math.floor(n / 10), u = n % 10;
    if (n >= 21 && n <= 29) {
      const special: Record<number, string> = {
        22: "veintidós",
        23: "veintitrés",
        26: "veintiséis",
      };
      return special[n] ?? `veinti${units[u]}`;
    }
    return u ? `${tens[t]} y ${units[u]}` : tens[t]!;
  }
  if (lang === "it") {
    const tens = ["", "", "venti", "trenta", "quaranta", "cinquanta", "sessanta", "settanta", "ottanta", "novanta"];
    const t = Math.floor(n / 10), u = n % 10;
    if (!u) return tens[t]!;
    const base = tens[t]!;
    return u === 1 || u === 8 ? base.slice(0, -1) + units[u] : `${base}${units[u]}`;
  }
  if (lang === "de") {
    const tens = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];
    const t = Math.floor(n / 10), u = n % 10;
    return u ? `${units[u]!.replace("eins", "ein")}und${tens[t]}` : tens[t]!;
  }
  if (lang === "pt") {
    const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const t = Math.floor(n / 10), u = n % 10;
    return u ? `${tens[t]} e ${units[u]}` : tens[t]!;
  }
  if (lang === "fr") {
    if (n < 70) {
      const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"];
      const t = Math.floor(n / 10), u = n % 10;
      if (!u) return tens[t]!;
      return u === 1 ? `${tens[t]} et ${units[u]}` : `${tens[t]}-${units[u]}`;
    }
    if (n < 80) {
      const u = n - 70;
      return u === 1 ? "soixante et onze" : `soixante-${units[u]}`;
    }
    const u = n - 80;
    if (n === 80) return "quatre-vingts";
    return `quatre-vingt-${units[u]}`;
  }
  const tens = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];
  const t = Math.floor(n / 10), u = n % 10;
  return u ? `${tens[t]} ${units[u]}` : tens[t]!;
}

function underThousand(n: number, lang: LangCode): string {
  if (n < 100) return underHundred(n, lang);
  const h = Math.floor(n / 100), r = n % 100;
  const before: Record<LangCode, string[]> = {
    en: ["", "one hundred", "two hundred", "three hundred", "four hundred", "five hundred", "six hundred", "seven hundred", "eight hundred", "nine hundred"],
    es: ["", "cien", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"],
    it: ["", "cento", "duecento", "trecento", "quattrocento", "cinquecento", "seicento", "settecento", "ottocento", "novecento"],
    ru: ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"],
    pt: ["", "cem", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"],
    fr: ["", "cent", "deux cents", "trois cents", "quatre cents", "cinq cents", "six cents", "sept cents", "huit cents", "neuf cents"],
    de: ["", "hundert", "zweihundert", "dreihundert", "vierhundert", "fünfhundert", "sechshundert", "siebenhundert", "achthundert", "neunhundert"],
  };
  let head = before[lang][h]!;
  if (r) {
    if (lang === "es" && h === 1) head = "ciento";
    if (lang === "pt" && h === 1) head = "cento";
    if (lang === "fr" && h > 1) head = head.replace("cents", "cent");
    const joiner = lang === "pt" || lang === "it" ? " " : lang === "fr" ? " " : " ";
    return `${head}${joiner}${underHundred(r, lang)}`;
  }
  return head;
}

export function numberWord(n: number, lang: LangCode): string {
  if (n < 1000) return underThousand(n, lang);
  const th = Math.floor(n / 1000), r = n % 1000;
  const heads: Partial<Record<LangCode, string>> = {
    en: th === 1 ? "one thousand" : `${underThousand(th, lang)} thousand`,
    es: th === 1 ? "mil" : `${underThousand(th, lang)} mil`,
    it: th === 1 ? "mille" : `${th === 2 ? "due" : th === 3 ? "tre" : underThousand(th, lang)}mila`,
    ru: th === 1 ? "одна тысяча" : th === 2 ? "две тысячи" : th === 3 ? "три тысячи" : th === 4 ? "четыре тысячи" : `${underThousand(th, lang)} тысяч`,
    pt: th === 1 ? "mil" : `${underThousand(th, lang)} mil`,
    fr: th === 1 ? "mille" : `${underThousand(th, lang)} mille`,
    de: th === 1 ? "eintausend" : `${underThousand(th, lang)}tausend`,
  };
  const head = heads[lang]!;
  if (lang === "de" && r) {
    const thousandPrefix = th === 1 ? "ein" : underThousand(th, "de").replace(/\s+/g, "");
    return `${thousandPrefix}tausend${underThousand(r, "de").replace(/\s+/g, "")}`;
  }
  if (lang === "it" && th === 1 && r) return `mille${underThousand(r, lang)}`;
  if (lang === "pt" && th === 1 && r < 200) return `mil e ${underThousand(r, lang)}`;
  return r ? `${head} ${underThousand(r, lang)}` : head;
}

function numberLevel(n: number): Level {
  if (n <= 20) return "A1";
  if (n <= 100) return "A2";
  if (n <= 900) return "B1";
  if (n <= 2200) return "B2";
  return "C1";
}

export function expandLexicon(): SeedWord[] {
  const byLang = new Map<LangCode, SeedWord[]>();
  for (const lang of LANG_INDEX) byLang.set(lang, []);

  const add = (lang: LangCode, row: SeedWord) => {
    byLang.get(lang)!.push(row);
  };

  for (const tuple of CONCEPTS) {
    const [key, level, category, tr, en, es, it, ru, pt, fr, de] = tuple;
    const terms: Record<LangCode, string> = { en, es, it, ru, pt, fr, de };
    const pos = conceptPos(tuple);
    for (const lang of LANG_INDEX) {
      add(lang, {
        conceptKey: key,
        language: lang,
        term: terms[lang],
        translationTr: tr,
        translationEn: en,
        level,
        category,
        isCustom: false,
      });
    }
    const klass = conceptClass(key);
    for (const frame of FRAMES) {
      if (frame.pos !== "all" && frame.pos !== pos) continue;
      // Semantic gate: noun frames only combine with allowed classes, so
      // every generated line is meaningful in all seven languages.
      if (frame.pos === "noun" && !(frame.allow ?? []).includes(klass)) continue;
      for (const lang of LANG_INDEX) {
        // English verbs are stored as citation form "to drink"; inside any
        // frame the bare infinitive is required ("I want to drink",
        // "listen to drink" — never "…to to drink").
        const slot =
          pos === "verb" && lang === "en" ? terms[lang].replace(/^to /, "") : terms[lang];
        add(lang, {
          conceptKey: `${key}__${frame.id}`,
          language: lang,
          term: frame[lang](slot),
          translationTr: frame.tr(tr),
          translationEn: frame.en(en),
          level: shiftLevel(level, frame.shift),
          category,
          isCustom: false,
        });
      }
    }
  }

  let n = 1;
  while (LANG_INDEX.some((l) => byLang.get(l)!.length < TARGET_WORDS_PER_LANGUAGE)) {
    const level = numberLevel(n);
    for (const lang of LANG_INDEX) {
      const list = byLang.get(lang)!;
      if (list.length < TARGET_WORDS_PER_LANGUAGE) {
        list.push({
          conceptKey: `number_${n}`,
          language: lang,
          term: numberWord(n, lang),
          translationTr: String(n),
          translationEn: numberWord(n, "en"),
          level,
          category: "numbers",
          isCustom: false,
        });
      }
    }
    n += 1;
    if (n > 9999) break;
  }

  const rows: SeedWord[] = [];
  for (const lang of LANG_INDEX) {
    rows.push(...byLang.get(lang)!.slice(0, TARGET_WORDS_PER_LANGUAGE));
  }
  return rows;
}
