import { Injectable, Inject } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';

@Injectable()
export class UsersService {
  constructor(@Inject('DATABASE_POOL') private readonly db: Pool) {}

  // --- Mapeadores (Tus funciones originales convertidas a métodos) ---

  private mapDbToApp(dbRow: any) {
    if (!dbRow) return null;
    return {
      id: dbRow.Id_Usuario,
      nombre: dbRow.Nombre,
      telefono: dbRow.Telefono,
      nDocumento: dbRow.N_Documento,
      direccion: dbRow.Direccion,
      correo: dbRow.Correo,
      passwordHash: dbRow.password_hash,
      rolId: dbRow.rol_Id_Rol,
      tipoDocumentoId: dbRow.Tipo_de_Documento_idTipo_de_Documento,
      fechaRegistro: dbRow.fecha_registro,
      lastLogin: dbRow.last_login,
      estado: dbRow.estado,
    };
  }

  private excludeSensitiveFields(user: any) {
    if (!user) return null;
    const { passwordHash, resetToken, resetTokenExpires, ...safeUser } = user;
    return safeUser;
  }

  // --- Ejemplo de uso en una consulta ---

  async findOne(id: number) {
    const [rows]: any = await this.db.query(
      'SELECT * FROM usuario WHERE Id_Usuario = ?', 
      [id]
    );
    
    const user = this.mapDbToApp(rows[0]);
    return this.excludeSensitiveFields(user);
  }
}