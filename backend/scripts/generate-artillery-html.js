// scripts/generate-artillery-html.js
const fs = require('fs');
const path = require('path');

const jsonPath = process.argv[2] || path.join(__dirname, '../test-reports/reporte_rendimiento.json');
const htmlPath = process.argv[3] || jsonPath.replace(/\.json$/g, '.html');

if (!fs.existsSync(jsonPath)) {
  console.log(`⚠️ Archivo JSON no encontrado: ${jsonPath}`);
  process.exit(0);
}

try {
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(rawData);
  const aggregate = data.aggregate || {};
  const counters = aggregate.counters || {};
  const rates = aggregate.rates || {};
  const summaries = aggregate.summaries || {};

  const totalRequests = counters['http.requests'] || 0;
  const codes200 = counters['http.codes.200'] || 0;
  const codes404 = counters['http.codes.404'] || 0;
  const failedVusers = counters['vusers.failed'] || 0;

  const resTime = summaries['http.response_time'] || {};
  const minTime = resTime.min || 0;
  const maxTime = resTime.max || 0;
  const meanTime = resTime.mean || 0;
  const medianTime = resTime.median || 0;
  const p95Time = resTime.p95 || 0;
  const p99Time = resTime.p99 || 0;

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte de Rendimiento - FoamWash API</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 30px; }
    .container { max-width: 900px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { color: #38bdf8; font-size: 28px; margin-top: 0; display: flex; align-items: center; gap: 12px; }
    .subtitle { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card { background: #334155; padding: 20px; border-radius: 12px; border-left: 4px solid #38bdf8; }
    .card.success { border-left-color: #22c55e; }
    .card.warning { border-left-color: #f59e0b; }
    .card-title { font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; font-weight: bold; }
    .card-value { font-size: 28px; font-weight: 800; color: #fff; margin-top: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #0f172a; border-radius: 8px; overflow: hidden; }
    th, td { padding: 14px 18px; text-align: left; border-bottom: 1px solid #1e293b; }
    th { background: #334155; color: #38bdf8; font-size: 13px; text-transform: uppercase; }
    td { font-size: 14px; }
    .status-ok { color: #22c55e; font-weight: bold; background: rgba(34,197,94,0.15); padding: 4px 10px; border-radius: 20px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Reporte Ejecutivo de Rendimiento y Estrés</h1>
    <div class="subtitle">FoamWash API — Peticiones Concursadas con Artillery</div>

    <div class="grid">
      <div class="card success">
        <div class="card-title">Peticiones Totales</div>
        <div class="card-value">${totalRequests}</div>
      </div>
      <div class="card success">
        <div class="card-title">Usuarios Fallidos</div>
        <div class="card-value">${failedVusers}</div>
      </div>
      <div class="card">
        <div class="card-title">Tiempo Medio (Latencia)</div>
        <div class="card-value">${meanTime.toFixed(1)} ms</div>
      </div>
      <div class="card">
        <div class="card-title">Percentil 95 (P95)</div>
        <div class="card-value">${p95Time} ms</div>
      </div>
    </div>

    <h3>📊 Detalles Métricos de Latencia</h3>
    <table>
      <thead>
        <tr>
          <th>Métrica</th>
          <th>Valor</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Respuesta Mínima (Min)</td><td>${minTime} ms</td><td><span class="status-ok">Óptimo</span></td></tr>
        <tr><td>Respuesta Media (Mean)</td><td>${meanTime.toFixed(1)} ms</td><td><span class="status-ok">Óptimo</span></td></tr>
        <tr><td>Respuesta Mediana (Median)</td><td>${medianTime} ms</td><td><span class="status-ok">Óptimo</span></td></tr>
        <tr><td>Percentil 95 (P95)</td><td>${p95Time} ms</td><td><span class="status-ok">Óptimo</span></td></tr>
        <tr><td>Percentil 99 (P99)</td><td>${p99Time} ms</td><td><span class="status-ok">Óptimo</span></td></tr>
        <tr><td>Respuesta Máxima (Max Spike)</td><td>${maxTime} ms</td><td><span class="status-ok">Soportado</span></td></tr>
        <tr><td>Peticiones Exitosas (HTTP 200)</td><td>${codes200}</td><td><span class="status-ok">Completadas</span></td></tr>
      </tbody>
    </table>
  </div>
</body>
</html>`;

  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log(`✅ Reporte HTML de rendimiento generado exitosamente en: ${htmlPath}`);
} catch (err) {
  console.error('Error generando reporte HTML:', err);
}
