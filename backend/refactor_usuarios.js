const fs = require('fs');
let content = fs.readFileSync('src/usuarios/usuarios.service.ts', 'utf8');

const newMethods = `
  async update(id: number, data: any) {
    const exists = await this.prisma.usuario.findUnique({ where: { Id_Usuario: id } });
    if (!exists) throw new NotFoundException('Usuario no encontrado');

    const updateData: any = {};
    if (data.Nombre !== undefined) updateData.Nombre = data.Nombre;
    if (data.nombre !== undefined && data.Nombre === undefined) updateData.Nombre = data.nombre;
    if (data.Telefono !== undefined) updateData.Telefono = data.Telefono;
    if (data.telefono !== undefined && data.Telefono === undefined) updateData.Telefono = data.telefono;
    if (data.Direccion !== undefined) updateData.Direccion = data.Direccion;
    if (data.direccion !== undefined && data.Direccion === undefined) updateData.Direccion = data.direccion;
    if (data.foto_perfil !== undefined) updateData.foto_perfil = data.foto_perfil;

    await this._validarYAsignarCorreoYDoc(id, data, updateData);
    await this._validarYAsignarTipoDoc(data, updateData);
    await this._actualizarEmpleadoData(id, exists.rol_Id_Rol, data);

    return this.prisma.usuario.update({
      where: { Id_Usuario: id },
      data: updateData,
      select: {
        Id_Usuario: true, Nombre: true, Correo: true, Telefono: true,
        Direccion: true, N_Documento: true, estado: true, foto_perfil: true,
        tipo_de_documento: { select: { idTipo_de_Documento: true, nombre_del_documento: true } },
        empleado: true,
      },
    });
  }

  private async _validarYAsignarCorreoYDoc(id: number, data: any, updateData: any) {
    if (data.Correo !== undefined || data.correo !== undefined) {
      const targetCorreo = data.Correo ?? data.correo;
      if (targetCorreo) {
        const duplicado = this.prisma.usuario.findFirst ? await this.prisma.usuario.findFirst({ where: { Correo: targetCorreo, NOT: { Id_Usuario: id } } }) : null;
        if (duplicado && duplicado.Id_Usuario !== id) throw new ConflictException('El correo ya está registrado en otro usuario');
        updateData.Correo = targetCorreo;
      } else {
        updateData.Correo = null;
      }
    }
    if (data.N_Documento !== undefined) {
      if (data.N_Documento) {
        const duplicado = this.prisma.usuario.findFirst ? await this.prisma.usuario.findFirst({ where: { N_Documento: data.N_Documento, NOT: { Id_Usuario: id } } }) : null;
        if (duplicado && duplicado.Id_Usuario !== id) throw new ConflictException('El número de documento ya está registrado en otro usuario');
        updateData.N_Documento = data.N_Documento;
      } else {
        updateData.N_Documento = null;
      }
    }
  }

  private async _validarYAsignarTipoDoc(data: any, updateData: any) {
    if (data.tipo_de_documento_id_tipo_de_documento !== undefined) {
      const tipo = await this.prisma.tipoDeDocumento.findUnique({ where: { idTipo_de_Documento: data.tipo_de_documento_id_tipo_de_documento } });
      if (!tipo) throw new BadRequestException('Tipo de documento no válido');
      updateData.tipo_de_documento_id_tipo_de_documento = data.tipo_de_documento_id_tipo_de_documento;
    }
  }

  private _parseDateSafe(dateVal: any, errorMsg: string): Date | null {
    if (!dateVal || dateVal.toString().trim() === '' || dateVal === 'Invalid Date') return null;
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) throw new BadRequestException(errorMsg);
    return d;
  }

  private async _actualizarEmpleadoData(id: number, rolId: number, data: any) {
    const hasEmpleadoFields = data.cargo !== undefined || data.especialidad !== undefined || data.especialidades !== undefined || data.certificaciones !== undefined || data.fecha_nacimiento !== undefined || data.fecha_ingreso !== undefined || data.dias_laborales !== undefined || data.horario !== undefined;
    if (hasEmpleadoFields && (rolId === 2 || data.cargo !== undefined)) {
      const empleadoData: any = {};
      if (data.cargo !== undefined) empleadoData.cargo = data.cargo;
      if (data.especialidad !== undefined || data.especialidades !== undefined) empleadoData.especialidades = data.especialidades ?? data.especialidad;
      if (data.certificaciones !== undefined) empleadoData.certificaciones = data.certificaciones;
      if (data.fecha_nacimiento !== undefined) empleadoData.fecha_nacimiento = this._parseDateSafe(data.fecha_nacimiento, 'Fecha de nacimiento no es válida');
      if (data.fecha_ingreso !== undefined) empleadoData.fecha_ingreso = this._parseDateSafe(data.fecha_ingreso, 'Fecha de ingreso no es válida');
      if (data.dias_laborales !== undefined) empleadoData.dias_laborales = data.dias_laborales;
      if (data.horario !== undefined) empleadoData.horario = data.horario;

      const existingEmp = await this.prisma.empleado.findFirst({ where: { usuario_Id_Usuario: id } });
      if (existingEmp) {
        await this.prisma.empleado.update({ where: { Id_Empleado: existingEmp.Id_Empleado }, data: empleadoData });
      } else {
        await this.prisma.empleado.create({ data: { ...empleadoData, usuario_Id_Usuario: id } });
      }
    }
  }
`;

const startIndex = content.indexOf('async update(id: number, data: any) {');
const endIndex = content.indexOf('async createEmpleado(data: any) {');
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newMethods + '\n  ' + content.substring(endIndex);
  fs.writeFileSync('src/usuarios/usuarios.service.ts', content, 'utf8');
}
