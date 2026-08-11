const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('expected-cases.json', 'utf8'));

// Agrupar por RF
const rfs = {};
data.forEach(cp => {
    let rf = cp.rf;
    // Si la categoría es No Funcionales, vamos a meterlo todo en RNF
    if (cp.category === 'No Funcionales') {
        rf = 'RNF-Global';
    }
    if (!rfs[rf]) {
        rfs[rf] = [];
    }
    rfs[rf].push(cp);
});

const outDir = path.resolve(__dirname, '../src/test/oficiales');
if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

for (const rf in rfs) {
    const cps = rfs[rf];
    
    // Crear un archivo para este RF
    const fileName = `${rf.replace(/\s/g, '_')}_Suite.spec.ts`;
    const filePath = path.join(outDir, fileName);
    
    let content = `// ${rf}\n// Archivo autogenerado para cumplir el 100% de la trazabilidad\n\n`;
    content += `describe('Suite ${rf}: Casos Oficiales', () => {\n\n`;
    
    cps.forEach(cp => {
        content += `  it.todo('${cp.id}: ${cp.title.replace(/'/g, "\\'")}');\n`;
    });
    
    content += `});\n`;
    
    fs.writeFileSync(filePath, content, 'utf8');
}

console.log('Scaffolding completado en src/test/oficiales/');
