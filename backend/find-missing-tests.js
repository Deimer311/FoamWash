const fs = require('fs');

const text = fs.readFileSync('casos.txt', 'utf8');

// Extraer todos los IDs como CP-XXX o CP0XX
const regex = /(CP-\d{3})/g;
let match;
const expectedCPs = [];

const lines = text.split('\n');
for (let i=0; i<lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/^CP-\d{3}$/)) {
        // Encontramos un ID
        const id = line;
        // El objetivo suele estar 2 o 4 líneas más abajo
        let j = i + 1;
        while(j < lines.length && (lines[j].trim() === '' || lines[j].trim().toLowerCase() === 'objetivo' || lines[j].trim().toLowerCase() === 'pasos')) {
            j++;
        }
        let title = lines[j] ? lines[j].trim() : 'Sin titulo';
        expectedCPs.push({ id, title });
    }
}

// Leer todos los archivos de prueba para ver qué CPs ya están implementados
const { execSync } = require('child_process');
const grepResult = execSync('powershell -Command "Get-ChildItem -Path src/test -Recurse -Filter *.spec.ts | Select-String -Pattern \'CP-?\\d{3}\' | Select-Object -ExpandProperty Line"').toString();

const implementedLines = grepResult.split('\n').map(l => l.trim()).filter(l => l);

const missing = [];
expectedCPs.forEach(cp => {
    // Buscar si cp.id (ej CP-001) o CP001 está en grepResult
    const idSinGuion = cp.id.replace('-', '');
    
    const isImplemented = implementedLines.some(line => line.includes(cp.id) || line.includes(idSinGuion));
    if (!isImplemented) {
        missing.push(cp);
    }
});

console.log(`Total Esperados: ${expectedCPs.length}`);
console.log(`Faltantes: ${missing.length}`);
console.log('--- LISTA DE FALTANTES ---');
missing.forEach(m => console.log(`${m.id}: ${m.title}`));
