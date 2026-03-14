import { 
  Controller, 
  Get, 
  Put, 
  Param, 
  Body, 
  HttpStatus, 
  HttpException, 
  Post, 
  UseInterceptors, 
  UploadedFile,
  Inject
} from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { FileInterceptor } from '@nestjs/platform-express';
import { hashPassword, comparePassword } from '../utils/password.util';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('api/empleados')
export class EmpleadosController {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  // ============================================================
  // AGENDA: Reservas (Hoy, Semana, Pendientes, Completadas)
  // ============================================================

  @Get(':id/reservas/hoy')
  async getReservasHoy(@Param('id') id: string) {
    try {
      const [rows]: any = await this.pool.query(`
        SELECT r.ID_Reserva, r.Estado, r.fecha, r.Hora, r.Informacion_adicional,
               u.Nombre AS nombre_cliente, u.Telefono AS telefono_cliente, u.Direccion AS direccion_cliente,
               s.Nombre_Servicio, s.Precio, s.descripcion AS descripcion_servicio
        FROM reserva r
        INNER JOIN usuario u ON r.Id_Usuario = u.Id_Usuario
        LEFT JOIN servicio s ON s.reserva_ID_Reserva = r.ID_Reserva
        WHERE r.empleado_Id_Usuario = ? AND DATE(r.fecha) = CURDATE()
        ORDER BY r.Hora ASC
      `, [id]);

      return { success: true, data: rows, total: rows.length };
    } catch (error) {
      throw new HttpException('Error al obtener reservas de hoy', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/reservas/semana')
  async getReservasSemana(@Param('id') id: string) {
    try {
      const [rows]: any = await this.pool.query(`
        SELECT r.ID_Reserva, r.Estado, r.fecha, r.Hora, u.Nombre AS nombre_cliente,
               s.Nombre_Servicio, s.Precio
        FROM reserva r
        INNER JOIN usuario u ON r.Id_Usuario = u.Id_Usuario
        LEFT JOIN servicio s ON s.reserva_ID_Reserva = r.ID_Reserva
        WHERE r.empleado_Id_Usuario = ? 
        AND r.fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        ORDER BY r.fecha ASC, r.Hora ASC
      `, [id]);

      return { success: true, data: rows, total: rows.length };
    } catch (error) {
      throw new HttpException('Error al obtener reservas de la semana', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('reservas/:id/estado')
  async updateEstadoReserva(@Param('id') id: string, @Body('estado') estado: string) {
    const estadosValidos = ['Pendiente', 'En Proceso', 'Completado', 'Cancelado'];
    if (!estadosValidos.includes(estado)) {
      throw new HttpException('Estado inválido', HttpStatus.BAD_REQUEST);
    }

    await this.pool.query('UPDATE reserva SET Estado = ? WHERE ID_Reserva = ?', [estado, id]);
    return { success: true, message: `Estado actualizado a: ${estado}` };
  }

  // ============================================================
  // PERFIL: Gestión de datos y Password
  // ============================================================

  @Get(':id/perfil')
  async getPerfil(@Param('id') id: string) {
    const [rows]: any = await this.pool.query(`
      SELECT u.Id_Usuario, u.Nombre, u.Correo, u.Telefono, u.Direccion, u.foto_perfil,
             e.Id_Empleado, e.cargo, e.especialidades, e.horario
      FROM usuario u
      LEFT JOIN empleado e ON e.usuario_Id_Usuario = u.Id_Usuario
      WHERE u.Id_Usuario = ?
    `, [id]);

    if (rows.length === 0) throw new HttpException('Empleado no encontrado', HttpStatus.NOT_FOUND);
    return { success: true, data: rows[0] };
  }

  @Put(':id/perfil')
  async updatePerfil(@Param('id') id: string, @Body() body: any) {
    try {
      // Actualizar Usuario
      await this.pool.query(`
        UPDATE usuario SET Nombre = ?, Telefono = ?, Direccion = ? WHERE Id_Usuario = ?
      `, [body.nombre, body.telefono, body.direccion, id]);

      // Actualizar o Insertar Empleado
      const [existe]: any = await this.pool.query('SELECT Id_Empleado FROM empleado WHERE usuario_Id_Usuario = ?', [id]);

      if (existe.length > 0) {
        await this.pool.query(`
          UPDATE empleado SET cargo = ?, especialidades = ?, horario = ? WHERE usuario_Id_Usuario = ?
        `, [body.cargo, body.especialidades, body.horario, id]);
      } else {
        await this.pool.query(`
          INSERT INTO empleado (usuario_Id_Usuario, cargo, especialidades) VALUES (?, ?, ?)
        `, [id, body.cargo, body.especialidades]);
      }

      return { success: true, message: 'Perfil actualizado' };
    } catch (error) {
      throw new HttpException('Error al actualizar perfil', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/password')
  async updatePassword(
    @Param('id') id: string, 
    @Body() body: { passwordActual: string, passwordNueva: string }
  ) {
    const [rows]: any = await this.pool.query('SELECT password_hash FROM usuario WHERE Id_Usuario = ?', [id]);
    if (rows.length === 0) throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);

    const valida = await comparePassword(body.passwordActual, rows[0].password_hash);
    if (!valida) throw new HttpException('Contraseña actual incorrecta', HttpStatus.BAD_REQUEST);

    const nuevoHash = await hashPassword(body.passwordNueva);
    await this.pool.query('UPDATE usuario SET password_hash = ? WHERE Id_Usuario = ?', [nuevoHash, id]);

    return { success: true, message: 'Contraseña actualizada' };
  }

  // ============================================================
  // DESEMPEÑO Y FOTO (Manejo de Archivos)
  // ============================================================

  @Get(':id/desempeno')
  async getDesempeno(@Param('id') id: string) {
    const [metricas]: any = await this.pool.query(`
      SELECT COUNT(DISTINCT r.ID_Reserva) AS servicios_completados,
             ROUND(AVG(c.puntaje), 1) AS calificacion_promedio
      FROM reserva r
      LEFT JOIN calificacion c ON c.reserva_ID_Reserva = r.ID_Reserva
      WHERE r.empleado_Id_Usuario = ? AND r.Estado = 'Completado'
      AND MONTH(r.fecha) = MONTH(CURDATE())
    `, [id]);

    return {
      success: true,
      data: {
        servicios_completados: metricas[0].servicios_completados || 0,
        calificacion_promedio: metricas[0].calificacion_promedio || 0
      }
    };
  }

  @Post(':id/foto')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/fotos',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async updateFoto(@Param('id') id: string, @UploadedFile() file: any) {
    if (!file) throw new HttpException('No se recibió imagen', HttpStatus.BAD_REQUEST);

    const rutaFoto = `/uploads/fotos/${file.filename}`;
    await this.pool.query('UPDATE usuario SET foto_perfil = ? WHERE Id_Usuario = ?', [rutaFoto, id]);

    return { success: true, data: { foto_perfil: rutaFoto } };
  }
}