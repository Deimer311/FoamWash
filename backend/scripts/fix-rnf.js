const fs = require('fs');
const path = require('path');

const rf22Path = path.resolve(__dirname, '../src/test/pruebas unitarias/RF-22_Configuracion.spec.ts');
let rf22Content = fs.readFileSync(rf22Path, 'utf8');

const rnfCps = [];
const lines = rf22Content.split('\n');
let newRf22Content = [];
let inRnfTest = false;
let currentRnfTest = '';

// Extract all CP-001 to CP-023 that are actually RNFs
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if it's an RNF CP (CP-001 to CP-023) but NOT CP-108
    if (line.includes("it('CP-0") && !line.includes("CP-108")) {
        inRnfTest = true;
        currentRnfTest = line + '\n';
    } else if (inRnfTest) {
        currentRnfTest += line + '\n';
        if (line.includes("});")) {
            inRnfTest = false;
            rnfCps.push(currentRnfTest);
        }
    } else {
        newRf22Content.push(line);
    }
}

// Write back RF-22 without the RNFs
fs.writeFileSync(rf22Path, newRf22Content.join('\n'), 'utf8');

// Create the RNF file in pruebas de calidad
const rnfPath = path.resolve(__dirname, '../src/test/pruebas de calidad/RNF_General.spec.ts');
let rnfContent = `import { Test, TestingModule } from '@nestjs/testing';\n\n`;
rnfContent += `describe('Suite RNF - Pruebas No Funcionales (Calidad)', () => {\n\n`;
rnfContent += `  beforeEach(async () => {\n`;
rnfContent += `    // Setup del módulo para RNF\n`;
rnfContent += `  });\n\n`;

rnfCps.forEach(test => {
    rnfContent += test + '\n';
});

rnfContent += `});\n`;

fs.writeFileSync(rnfPath, rnfContent, 'utf8');

console.log('RNFs separados correctamente en pruebas de calidad.');
