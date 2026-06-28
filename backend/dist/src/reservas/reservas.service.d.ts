import { PrismaService } from '../prisma/prisma.service';
export declare class ReservasService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        empleado: {
            Nombre: string;
        };
        observacion: {
            estado: string;
            Observaciones: string;
        };
        cliente: {
            Nombre: string;
            Telefono: string;
            Correo: string;
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
    findByEstado(estado: string): Promise<({
        cliente: {
            Nombre: string;
            Telefono: string;
        };
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
    findOne(id: number): Promise<{
        empleado: {
            Nombre: string;
        };
        observacion: {
            estado: string | null;
            Id_Observaciones: number;
            Observaciones: string | null;
        };
        cliente: {
            Nombre: string;
            Telefono: string;
            Correo: string;
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
    }>;
    private asignarEmpleadoAutomatico;
    create(data: {
        Estado?: string;
        Id_Usuario: number;
        fecha?: string;
        Hora?: string;
        Informacion_adicional?: string;
        observacion_Id_Observaciones?: number;
        empleado_Id_Usuario?: number;
        servicios?: Array<{
            Id_Servicio: number;
            cantidad?: number;
            tamano?: string;
        }>;
    }): Promise<{
        success: boolean;
        data: {
            empleado_asignado: string;
            empleado: {
                Id_Usuario: number;
                Nombre: string;
            };
            cliente: {
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
            };
            Id_Usuario: number;
            ID_Reserva: number;
            Estado: string;
            fecha: Date;
            Hora: Date;
            Informacion_adicional: string | null;
            observacion_Id_Observaciones: number;
            empleado_Id_Usuario: number | null;
        };
    }>;
    update(id: number, data: Partial<{
        Estado: string;
        fecha: Date;
        Hora: Date;
        Informacion_adicional: string;
        empleado_Id_Usuario: number;
    }>): Promise<{
        Id_Usuario: number;
        ID_Reserva: number;
        Estado: string;
        fecha: Date;
        Hora: Date;
        Informacion_adicional: string | null;
        observacion_Id_Observaciones: number;
        empleado_Id_Usuario: number | null;
    }>;
    updateEstado(id: number, estado: string): Promise<{
        cliente: {
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
    }>;
    remove(id: number): Promise<{
        Id_Usuario: number;
        ID_Reserva: number;
        Estado: string;
        fecha: Date;
        Hora: Date;
        Informacion_adicional: string | null;
        observacion_Id_Observaciones: number;
        empleado_Id_Usuario: number | null;
    }>;
    findByCliente(clienteId: number): Promise<({
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
