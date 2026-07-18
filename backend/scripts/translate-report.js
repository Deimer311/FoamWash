// scripts/translate-report.js
// ============================================================
// Script para traducir el reporte HTML generado por jest-html-reporters
// Busca palabras clave en inglés en el bundle minificado y las
// reemplaza por sus equivalentes en español para hacer el reporte
// más fácil de leer.
// ============================================================
const fs = require('fs');
const path = require('path');

const reportPath = process.argv[2];

if (!reportPath) {
  console.error("Error: Se debe proporcionar la ruta al reporte HTML como argumento.");
  process.exit(1);
}

const resolvedPath = path.resolve(reportPath);

if (!fs.existsSync(resolvedPath)) {
  console.error(`Error: No se encontró el archivo en ${resolvedPath}`);
  process.exit(1);
}

console.log(`[i]  Traduciendo reporte a español: ${resolvedPath}`);

let htmlContent = fs.readFileSync(resolvedPath, 'utf8');

// Diccionario de traducciones (buscando reemplazos seguros en la UI de React)
const translations = [
  { from: />Dashboard</g, to: ">Panel General<" },
  { from: />Passed</g, to: ">Aprobadas<" },
  { from: />Failed</g, to: ">Fallidas<" },
  { from: />Total</g, to: ">Total<" },
  { from: />Test Suites</g, to: ">Suites de Pruebas<" },
  { from: />Tests</g, to: ">Pruebas<" },
  { from: />Execution Time</g, to: ">Tiempo de Ejecución<" },
  { from: />Estimated</g, to: ">Estimado<" },
  { from: />Search</g, to: ">Buscar<" },
  { from: /placeholder="Search"/g, to: 'placeholder="Buscar..."' },
  { from: />All</g, to: ">Todas<" },
  { from: />Status</g, to: ">Estado<" },
  { from: />Duration</g, to: ">Duración<" },
  { from: />Title</g, to: ">Título<" },
  { from: />Information</g, to: ">Información<" },
  { from: />Expand all</g, to: ">Expandir todo<" },
  { from: />Collapse all</g, to: ">Contraer todo<" },
  { from: />Configuration</g, to: ">Configuración<" },
  { from: />Details</g, to: ">Detalles<" },
  { from: />Time</g, to: ">Tiempo<" },
  { from: />Console Log</g, to: ">Registro de Consola<" },
  { from: />Show less</g, to: ">Ver menos<" },
  { from: />Show more</g, to: ">Ver más<" },
  { from: /"Passed"/g, to: '"Aprobadas"' },
  { from: /"Failed"/g, to: '"Fallidas"' }
];

translations.forEach(({ from, to }) => {
  htmlContent = htmlContent.replace(from, to);
});

fs.writeFileSync(resolvedPath, htmlContent, 'utf8');

console.log(`[OK] Reporte traducido exitosamente.`);
