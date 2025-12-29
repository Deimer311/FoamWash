/**
 * Un mapa que contiene "Hola Mundo" en 40 idiomas.
 */
const traduccionesHolaMundo = {
    'Español': '¡Hola, mundo!',
    'Inglés': 'Hello, World!',
    'Chino Mandarín': '你好,世界! (Nǐ hǎo, shìjiè!)',
    'Hindi': 'नमस्ते दुनिया! (Namaste duniya!)',
    'Francés': 'Bonjour, le monde!',
    'Árabe': 'مرحباً بالعالم (Marhaban bil aalam)',
    'Ruso': 'Привет, мир! (Privet, mir!)',
    'Japonés': 'こんにちは、世界！ (Kon\'nichiwa, sekai!)',
    'Alemán': 'Hallo Welt!',
    'Portugués': 'Olá, mundo!',
    'Italiano': 'Ciao mondo!',
    'Turco': 'Merhaba dünya!',
    'Vietnamita': 'Xin chào thế giới!',
    'Coreano': '안녕하세요 세계! (Annyeonghaseyo segye!)',
    'Persa (Farsi)': 'سلام دنیا (Salam donya)',
    'Polaco': 'Witaj świecie!',
    'Ucraniano': 'Привіт світе! (Pryvit svite!)',
    'Rumano': 'Salut Lume!',
    'Holandés': 'Hallo wereld!',
    'Sueco': 'Hej världen!',
    'Griego': 'Γεια σου κόσμε! (Geia sou kosme!)',
    'Checo': 'Ahoj světe!',
    'Húngaro': 'Sziasztok világ!',
    'Finlandés': 'Hei maailma!',
    'Noruego': 'Hallo verden!',
    'Danés': 'Hej verden!',
    'Tailandés': 'สวัสดีชาวโลก (S̄wạs̄dī chāw lók)',
    'Indonesio': 'Halo Dunia!',
    'Malayo': 'Hai dunia!',
    'Hebreo': 'שלום עולם (Shalom olam)',
    'Serbio': 'Здраво свете (Zdravo svete)',
    'Búlgaro': 'Здравейте свят (Zdraveyte svyat)',
    'Croata': 'Pozdrav svijete!',
    'Eslovaco': 'Ahoj svet!',
    'Esloveno': 'Pozdravljen svet!',
    'Lituano': 'Labas pasauli!',
    'Letón': 'Sveika pasaule!',
    'Estonio': 'Tere maailm!',
    'Islandés': 'Halló heimur!',
    'Gallego': 'Ola mundo!',
    'Catalán': 'Hola món!'
};

/**
 * Función para obtener una selección aleatoria de elementos de un array.
 * @param {Array} arr - El array del que se seleccionarán elementos.
 * @param {number} num - El número de elementos a seleccionar.
 * @returns {Array} Un nuevo array con elementos seleccionados al azar.
 */
function seleccionarAleatorio(arr, num) {
    const mezclado = [...arr].sort(() => 0.5 - Math.random());
    return mezclado.slice(0, num);
}

// 1. Obtener todos los nombres de idiomas (keys)
const listaIdiomas = Object.keys(traduccionesHolaMundo);

// 2. Seleccionar 20 idiomas al azar de la lista completa
const idiomasSeleccionados = seleccionarAleatorio(listaIdiomas, 20);

console.log(`--- Imprimiendo "Hola Mundo" en 20 idiomas seleccionados al azar ---`);

// 3. Iterar sobre los idiomas seleccionados e imprimir la traducción correspondiente
for (const idioma of idiomasSeleccionados) {
    const frase = traduccionesHolaMundo[idioma];
    console.log(`${idioma}: ${frase}`);
}

console.log("------------------------------------------------------------------");
