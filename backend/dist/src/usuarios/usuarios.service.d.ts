import { PrismaService } from '../prisma/prisma.service';
export declare class UsuariosService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        Id_Usuario: number;
        Nombre: string;
        Telefono: string;
        N_Documento: string;
        Direccion: string;
        Correo: string;
        estado: import(".prisma/client").$Enums.usuario_estado;
        fecha_registro: Date;
        foto_perfil: string;
        tipo_de_documento: {
            nombre_del_documento: string;
        };
        rol: {
            Rol: string;
        };
    }[]>;
    findOne(id: number): Promise<{
        stats: {
            total_reservas: number;
            completadas: number;
            pendientes: number;
            calificacion_promedio: string;
        };
        Id_Usuario: number;
        Nombre: string;
        Telefono: string;
        N_Documento: string;
        Direccion: string;
        Correo: string;
        estado: import(".prisma/client").$Enums.usuario_estado;
        last_login: Date;
        fecha_registro: Date;
        foto_perfil: string;
        reservasComoCliente: ({
            observacion: {
                estado: string | null;
                Id_Observaciones: number;
                Observaciones: string | null;
            };
            servicios: {
                estado: string;
                Id_Servicio: number;
                Nombre_Servicio: string;
                Precio: import("@prisma/client/runtime/library").Decimal;
                descripcion: string;
                imagen_url: string | null;
                cotizacion_Id_Cotizacion: number | null;
                reserva_ID_Reserva: number | null;
                duracion_estimada: string | null;
            }[];
        } & {
            Id_Usuario: number;
            ID_Reserva: number;
            Estado: string;
            fecha: Date;
            Hora: Date;
            Informacion_adicional: string | null;
            observacion_Id_Observaciones: number;
            empleado_Id_Usuario: number | null;
        })[];
        tipo_de_documento: {
            idTipo_de_Documento: number;
            nombre_del_documento: string;
        };
        rol: {
            Id_Rol: number;
            Rol: string;
        };
    }>;
    update(id: number, data: any): Promise<{
        Id_Usuario: number;
        Nombre: string;
        Telefono: string;
        N_Documento: string;
        Direccion: string;
        Correo: string;
        estado: import(".prisma/client").$Enums.usuario_estado;
        foto_perfil: string;
        tipo_de_documento: {
            idTipo_de_Documento: number;
            nombre_del_documento: string;
        };
    }>;
    softDelete(id: number): Promise<{
        Id_Usuario: number;
        Nombre: string | null;
        Telefono: string | null;
        N_Documento: string | null;
        Direccion: string | null;
        Correo: string | null;
        password_hash: string | null;
        estado: import(".prisma/client").$Enums.usuario_estado | null;
        rol_Id_Rol: number | null;
        tipo_de_documento_id_tipo_de_documento: number | null;
        reset_token: string | null;
        reset_token_expires: Date | null;
        last_login: Date | null;
        fecha_registro: Date | null;
        access_token: string | null;
        refresh_token: string | null;
        token_created_at: Date | null;
        token_expires_at: Date | null;
        foto_perfil: string | null;
    }>;
    usuariosPorRol(): Promise<({
        _count: {
            usuarios: number;
        };
    } & {
        Id_Rol: number;
        Rol: string;
    })[]>;
    empleadosActivos(): Promise<{
        Id_Usuario: number;
        Nombre: string;
        Telefono: string;
        Correo: string;
        last_login: Date;
    }[]>;
    historialCliente(id: number): Promise<({
        observacion: {
            estado: string | null;
            Id_Observaciones: number;
            Observaciones: string | null;
        };
        servicios: {
            estado: string;
            Id_Servicio: number;
            Nombre_Servicio: string;
            Precio: import("@prisma/client/runtime/library").Decimal;
            descripcion: string;
            imagen_url: string | null;
            cotizacion_Id_Cotizacion: number | null;
            reserva_ID_Reserva: number | null;
            duracion_estimada: string | null;
        }[];
    } & {
        Id_Usuario: number;
        ID_Reserva: number;
        Estado: string;
        fecha: Date;
        Hora: Date;
        Informacion_adicional: string | null;
        observacion_Id_Observaciones: number;
        empleado_Id_Usuario: number | null;
    })[]>;
}
