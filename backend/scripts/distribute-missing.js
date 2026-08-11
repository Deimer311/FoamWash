const fs = require('fs');
const path = require('path');

const srcFile = path.resolve(__dirname, '../src/test/pruebas unitarias/RF_CasosFaltantes.spec.ts');
const text = fs.readFileSync(srcFile, 'utf8');

const unit = [];
const qual = [];
const integ = [];

let currentTest = '';
let inTest = false;

const lines = text.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('it(\'')) {
        inTest = true;
        currentTest = line + '\n';
    } else if (inTest) {
        currentTest += line + '\n';
        if (line.includes('});')) {
            inTest = false;
            
            // Determinar a qué categoría va
            if (currentTest.includes('RNF-') || currentTest.toLowerCase().includes('rendimiento') || currentTest.toLowerCase().includes('seguridad')) {
                qual.push(currentTest);
            } else if (currentTest.includes('CP-05') || currentTest.includes('CP-06') || currentTest.includes('CP-07') || currentTest.includes('CP-08') || currentTest.includes('CP-09') || currentTest.includes('CP-10')) {
                integ.push(currentTest);
            } else {
                unit.push(currentTest);
            }
        }
    }
}

// Sobrescribir Unitarias
const unitStr = `import { Test, TestingModule } from '@nestjs/testing';\n\ndescribe('Casos de Prueba Faltantes (Unitarias)', () => {\n${unit.join('\n')}});\n`;
fs.writeFileSync(srcFile, unitStr, 'utf8');

// Crear Calidad
const qualStr = `import { Test, TestingModule } from '@nestjs/testing';\n\ndescribe('Casos de Prueba Faltantes (Calidad y RNF)', () => {\n${qual.join('\n')}});\n`;
fs.writeFileSync(path.resolve(__dirname, '../src/test/pruebas de calidad/RNF_CasosFaltantes.spec.ts'), qualStr, 'utf8');

// Crear Integracion
const integStr = `import { Test, TestingModule } from '@nestjs/testing';\n\ndescribe('Casos de Prueba Faltantes (Integración)', () => {\n${integ.join('\n')}});\n`;
fs.writeFileSync(path.resolve(__dirname, '../src/test/pruebas integracion/INT_CasosFaltantes.spec.ts'), integStr, 'utf8');

console.log('Casos distribuidos en las 3 carpetas correctamente.');
