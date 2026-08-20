const fs = require('fs');

const text = fs.readFileSync('casos.txt', 'utf8');
const lines = text.split('\n').map(l => l.trim());

const cases = [];
let currentRF = 'Unknown';
let currentCategory = 'Funcionales';

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detectar RNF o RF
    const rfMatch = /^(RF-?\d+|RNF-?\d+)\s+(.*)/i.exec(line);
    if (rfMatch) {
        currentRF = rfMatch[1].toUpperCase().replace('RF', 'RF-').replace('RF--', 'RF-').replace('RNF', 'RNF-').replace('RNF--', 'RNF-');
        currentCategory = currentRF.startsWith('RNF') ? 'No Funcionales' : 'Funcionales';
    }

    // Detectar CP
    const cpMatch = /^CP-(\d\S*)\s/i.exec(line) || /^(CP\s*\d\S*)\s/i.exec(line);
    if (cpMatch) {
        let id = cpMatch[1].replace(/\s+/g, '').toUpperCase();
        // Asegurar que tenga guion
        if (!id.includes('-')) id = id.replace('CP', 'CP-');

        let j = i + 1;
        while (j < lines.length && (lines[j] === '' || lines[j].toLowerCase() === 'objetivo' || lines[j].toLowerCase() === 'pasos')) {
            j++;
        }
        let title = lines[j] ? lines[j] : 'Sin titulo';

        cases.push({
            id,
            rf: currentRF,
            title,
            category: currentCategory
        });
    }
}

fs.writeFileSync('expected-cases.json', JSON.stringify(cases, null, 2));
console.log(`Extraidos ${cases.length} casos de prueba y guardados en expected-cases.json.`);
