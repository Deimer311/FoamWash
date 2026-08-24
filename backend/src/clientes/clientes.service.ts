// src/clientes/clientes.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPerfil(id: number) {
    const cliente = await this.prisma.usuario.findUnique({
      where: { Id_Usuario: id },
      select: {
        Id_Usuario: true,
        Nombre: true,
        Correo: true,
        Telefono: true,
        Direccion: true,
        N_Documento: true,
        foto_perfil: true,
        fecha_registro: true,
        last_login: true,
        estado: true,
        rol: { select: { Rol: true } },
        // CORRECCIÓN: tipoDocumento → tipo_de_documento
        tipo_de_documento: { select: { nombre_del_documento: true } },
        reservasComoCliente: {
          include: { servicios: true, observacion: true },
          orderBy: { fecha: 'desc' },
          take: 10,
        },
        cotizaciones: { orderBy: { fecha_cotizacion: 'desc' }, take: 5 },
      },
    });

    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async updatePerfil(id: number, data: Partial<{ 
    Nombre: string; 
    Telefono: string; 
    Direccion: string; 
    N_Documento: string; 
    Correo: string;
    tipo_de_documento_id_tipo_de_documento: number;
  }>) {
    return this.prisma.usuario.update({
      where: { Id_Usuario: id },
      data,
      select: { Id_Usuario: true, Nombre: true, Correo: true, Telefono: true, Direccion: true, N_Documento: true },
    });
  }

  async updateFoto(id: number, fotoUrl: string) {
    return this.prisma.usuario.update({
      where: { Id_Usuario: id },
      data: { foto_perfil: fotoUrl },
      select: { Id_Usuario: true, foto_perfil: true },
    });
  }
}