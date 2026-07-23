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
  // Titles / Stats Cards
  { from: /title:"StartTime"/g, to: 'title:"Hora de Inicio"' },
  { from: /title:"Time"/g, to: 'title:"Tiempo"' },
  { from: /title:"RootDir"/g, to: 'title:"Directorio Raíz"' },
  { from: /title:"MaxWorkers"/g, to: 'title:"Trabajadores Máximos"' },
  { from: /title:"Name"/g, to: 'title:"Nombre"' },

  // Stats Card Content
  { from: /content:"Test Suites Total"/g, to: 'content:"Total de Suites"' },
  { from: /content:"Tests Total"/g, to: 'content:"Total de Pruebas"' },
  { from: /content:"Failed Suites"/g, to: 'content:"Suites Fallidas"' },
  { from: /content:"Failed Tests"/g, to: 'content:"Pruebas Fallidas"' },
  { from: /content:"Pending Suites"/g, to: 'content:"Suites Pendientes"' },
  { from: /content:"Pending Tests"/g, to: 'content:"Pruebas Pendientes"' },
  { from: /content:"Todo Tests"/g, to: 'content:"Pruebas por Hacer"' },
  { from: /content:"Runtime Errors"/g, to: 'content:"Errores de Ejecución"' },

  // Table Columns
  { from: /title:"File"/g, to: 'title:"Archivo"' },
  { from: /title:"ExecTime"/g, to: 'title:"Tiempo de Ejecución"' },
  { from: /title:"Status"/g, to: 'title:"Estado"' },
  { from: /title:"Action"/g, to: 'title:"Acción"' },

  // Filter Dropdowns & Status Values
  { from: /"Passed"/g, to: '"Aprobadas"' },
  { from: /"Failed"/g, to: '"Fallidas"' },
  { from: /"Pending"/g, to: '"Pendientes"' },
  { from: /"Todo"/g, to: '"Por Hacer"' },
  { from: /"Not Passed"/g, to: '"No Aprobadas"' },
  { from: /text:\s*"Pending"/g, to: 'text:"Pendientes"' },
  { from: /text:\s*"Todo"/g, to: 'text:"Por Hacer"' },
  { from: /text:\s*"Not Passed"/g, to: 'text:"No Aprobadas"' },

  // Header & Navigation
  { from: /"\s*Dashboard"/g, to: '" Panel General"' },
  { from: /"\s*Information"/g, to: '" Información"' },
  { from: /"\s*Details"/g, to: '" Detalles"' },
  { from: /"\s*Coverage"/g, to: '" Cobertura"' },
  { from: /"\s*Console Logs Infos"/g, to: '" Registros de Consola"' },
  
  // Execution Time Toggle & Expand All
  { from: /children:"Show Execution Time"/g, to: 'children:"Mostrar Tiempo de Ejecución"' },
  { from: /children:"Expand All"/g, to: 'children:"Expandir Todo"' },
  { from: /"All Passed"/g, to: '"Todas Aprobadas"' },

  // Modal / Dialogue boxes
  { from: /title:"INFO FOR --\\x3e "/g, to: 'title:"INFORMACIÓN DE --> "' },
  { from: /okText:"OK"/g, to: 'okText:"Aceptar"' },
  { from: /cancelText:"Cancel"/g, to: 'cancelText:"Cancelar"' },
  { from: /justOkText:"OK"/g, to: 'justOkText:"Aceptar"' },
  { from: /ok:"OK"/g, to: 'ok:"Aceptar"' },
  { from: /clear:"Clear"/g, to: 'clear:"Limpiar"' },
  { from: /filterConfirm:"OK"/g, to: 'filterConfirm:"Aceptar"' },
  { from: /filterReset:"Reset"/g, to: 'filterReset:"Reiniciar"' },
  { from: /emptyText:"No data"/g, to: 'emptyText:"Sin Datos"' },
  { from: /filterSearchPlaceholder:"Search in filters"/g, to: 'filterSearchPlaceholder:"Buscar en filtros"' },
  { from: /searchPlaceholder:"Search here"/g, to: 'searchPlaceholder:"Buscar aquí"' }
];

translations.forEach(({ from, to }) => {
  htmlContent = htmlContent.replace(from, to);
});

fs.writeFileSync(resolvedPath, htmlContent, 'utf8');

console.log(`[OK] Reporte traducido exitosamente.`);
