const express = require('express');
const { generarReporteEmpleados } = require('./RNF-009/reportesModule');
const app = express();
app.use(express.json());

// Estado simulado del servidor (en FoamWash real esto reflejaría la conexión a la BD / servicios)
let estadoServidor = {
  activo: true,
  ultimaCaida: null,
  ultimaRecuperacion: null,
};

// CP-008: endpoint de salud que se monitorea para medir disponibilidad
app.get('/health', (req, res) => {
  if (estadoServidor.activo) {
    return res.status(200).json({ status: 'ok', uptime: process.uptime() });
  }
  return res.status(503).json({ status: 'unavailable' });
});

// Endpoints auxiliares SOLO para pruebas: simulan una caída y su recuperación (CP-009)
app.post('/simular-falla', (req, res) => {
  estadoServidor.activo = false;
  estadoServidor.ultimaCaida = Date.now();
  res.json({ mensaje: 'Falla simulada' });
});

app.post('/restablecer', (req, res) => {
  estadoServidor.activo = true;
  estadoServidor.ultimaRecuperacion = Date.now();
  res.json({ mensaje: 'Servicio restablecido' });
});

// RNF-005: endpoint de ejemplo que simula una consulta a la base de datos
// (usado para las pruebas de carga / concurrencia, CP-010 y CP-011)
app.get('/empleados', async (req, res) => {
  // Simula la latencia real de una consulta a la BD (0-20ms)
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 20));
  res.status(200).json({
    empleados: [
      { id: 1, nombre: 'Empleado 1' },
      { id: 2, nombre: 'Empleado 2' },
    ],
  });
});

// RNF-009: endpoint del módulo NUEVO (reportes), agregado sin tocar los endpoints existentes
app.get('/reportes/empleados', (req, res) => {
  const empleados = [
    { id: 1, nombre: 'Empleado 1' },
    { id: 2, nombre: 'Empleado 2' },
  ];
  const reporte = generarReporteEmpleados(empleados);
  res.status(200).json(reporte);
});

module.exports = app;