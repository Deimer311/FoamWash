import { PrismaService } from '../prisma/prisma.service';
export declare class EmpleadosService {
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
        foto_perfil: string;
        empleado: {
            cargo: string;
            fecha_nacimiento: Date;
            fecha_ingreso: Date;
            dias_laborales: string;
            horario: string;
            especialidades: string;
            certificaciones: string;
            contacto_emergencia_nombre: string;
            contacto_emergencia_telefono: string;
        }[];
        tipo_de_documento: {
            idTipo_de_Documento: number;
            nombre_del_documento: string;
        };
    }[]>;
    getReservasHoy(id: number): Promise<({
        cliente: {
            Nombre: string;
            Telefono: string;
            Direccion: string;
        };
        servicios: {
            Nombre_Servicio: string;
            Precio: import("@prisma/client/runtime/library").Decimal;
            descripcion: string;
        }[];
    } & {
        Id_Usuario: number;
        fecha: Date;
        ID_Reserva: number;
        Estado: string;
        Hora: Date;
        Informacion_adicional: string | null;
        observacion_Id_Observaciones: number;
        empleado_Id_Usuario: number | null;
    })[]>;
    getReservasSemana(id: number): Promise<({
        cliente: {
            Nombre: string;
            Telefono: string;
            Direccion: string;
        };
        servicios: {
            Nombre_Servicio: string;
            Precio: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        Id_Usuario: number;
        fecha: Date;
        ID_Reserva: number;
        Estado: string;
        Hora: Date;
        Informacion_adicional: string | null;
        observacion_Id_Observaciones: number;
        empleado_Id_Usuario: number | null;
    })[]>;
    getSinServicios(): Promise<{
        Id_Usuario: number;
        Nombre: string;
        Telefono: string;
        Correo: string;
    }[]>;
    getServiciosFinalizados(): Promise<({
        empleado: {
            Nombre: string;
        };
        cliente: {
            Nombre: string;
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
        fecha: Date;
        ID_Reserva: number;
        Estado: string;
        Hora: Date;
        Informacion_adicional: string | null;
        observacion_Id_Observaciones: number;
        empleado_Id_Usuario: number | null;
    })[]>;
    getProductividadGeneral(): Promise<{
        Id_Usuario: number;
        Nombre: string;
        _count: {
            reservasComoEmpleado: number;
        };
    }[]>;
    getHistorial(id: number): Promise<({
        observacion: {
            estado: string;
            Observaciones: string;
        };
        cliente: {
            Nombre: string;
            Telefono: string;
            Direccion: string;
        };
        servicios: {
            Nombre_Servicio: string;
            Precio: import("@prisma/client/runtime/library").Decimal;
            descripcion: string;
        }[];
    } & {
        Id_Usuario: number;
        fecha: Date;
        ID_Reserva: number;
        Estado: string;
        Hora: Date;
        Informacion_adicional: string | null;
        observacion_Id_Observaciones: number;
        empleado_Id_Usuario: number | null;
    })[]>;
    getCompletados(id: number): Promise<({
        cliente: {
            Nombre: string;
            Telefono: string;
            Direccion: string;
        };
        servicios: {
            Nombre_Servicio: string;
            Precio: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        Id_Usuario: number;
        fecha: Date;
        ID_Reserva: number;
        Estado: string;
        Hora: Date;
        Informacion_adicional: string | null;
        observacion_Id_Observaciones: number;
        empleado_Id_Usuario: number | null;
    })[]>;
    getPendientes(id: number): Promise<({
        cliente: {
            Nombre: string;
            Telefono: string;
            Direccion: string;
        };
        servicios: {
            Nombre_Servicio: string;
            Precio: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        Id_Usuario: number;
        fecha: Date;
        ID_Reserva: number;
        Estado: string;
        Hora: Date;
        Informacion_adicional: string | null;
        observacion_Id_Observaciones: number;
        empleado_Id_Usuario: number | null;
    })[]>;
    getPerfilCompleto(id: number): Promise<{
        Id_Usuario: number;
        Nombre: string;
        Correo: string;
        Telefono: string;
        N_Documento: string;
        Direccion: string;
        foto_perfil: string;
        estado: import(".prisma/client").$Enums.usuario_estado;
        fecha_registro: Date;
        tipo_de_documento: {
            nombre_del_documento: string;
        };
        rol: {
            Rol: string;
        };
        cargo: string;
        fecha_nacimiento: Date;
        fecha_ingreso: Date;
        dias_laborales: string;
        horario: string;
        especialidades: string;
        certificaciones: string;
        contacto_emergencia_nombre: string;
        contacto_emergencia_telefono: string;
    }>;
    getDesempeno(id: number): Promise<{
        servicios_mes: number;
        calificacion_promedio: number;
        total_calificaciones: number;
        comentarios: number;
        puntualidad: any;
    }>;
    updateFoto(id: number, fotoUrl: string): Promise<{
        Id_Usuario: number;
        foto_perfil: string;
    }>;
}
