const fs = require('fs');
const path = require('path');

const map = {
  'Registro.spec.ts': '01_Registro.spec.ts',
  'Login.spec.ts': '02_Login.spec.ts',
  'RecuperarPassword.spec.ts': '03_RecuperarPassword.spec.ts',
  'ConsultarServicios.spec.ts': '04_ConsultarServicios.spec.ts',
  'SolicitarCotizacion.spec.ts': '05_SolicitarCotizacion.spec.ts',
  'ProgramarServicio.spec.ts': '06_ProgramarServicio.spec.ts',
  'Notificaciones.spec.ts': '07_Notificaciones.spec.ts',
  'HistorialServicios.spec.ts': '08_HistorialServicios.spec.ts',
  'GestionEmpleados.spec.ts': '09_GestionEmpleados.spec.ts',
  'AgendaEmpleados.spec.ts': '10_AgendaEmpleados.spec.ts',
  'GestionRoles.spec.ts': '11_GestionRoles.spec.ts',
  'Reportes.spec.ts': '12_Reportes.spec.ts',
  'Pagos.spec.ts': '13_Pagos.spec.ts',
  'Facturacion.spec.ts': '14_Facturacion.spec.ts',
  'Inventario.spec.ts': '15_Inventario.spec.ts',
  'Promociones.spec.ts': '16_Promociones.spec.ts',
  'Calificaciones.spec.ts': '17_Calificaciones.spec.ts',
  'Soporte.spec.ts': '18_Soporte.spec.ts',
  'Auditoria.spec.ts': '19_Auditoria.spec.ts',
  'Exportacion.spec.ts': '20_Exportacion.spec.ts',
  'Importacion.spec.ts': '21_Importacion.spec.ts',
  'Configuracion.spec.ts': '22_Configuracion.spec.ts'
};

const dir = path.join(__dirname, 'src', 'test', 'pruebas unitarias');
for (const [oldName, newName] of Object.entries(map)) {
  const oldPath = path.join(dir, oldName);
  const newPath = path.join(dir, newName);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed ${oldName} to ${newName}`);
  }
}
