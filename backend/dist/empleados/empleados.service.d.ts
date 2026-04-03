import { PrismaService } from '../prisma/prisma.service';
export declare class EmpleadosService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        Id_Usuario: number;
        Correo: string;
        Nombre: string;
        Telefono: string;
        estado: import(".prisma/client").$Enums.usuario_estado;
        foto_perfil: string;
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
        ID_Reserva: number;
        Estado: string;
        fecha: Date;
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
        ID_Reserva: number;
        Estado: string;
        fecha: Date;
        Hora: Date;
        Informacion_adicional: string | null;
        observacion_Id_Observaciones: number;
        empleado_Id_Usuario: number | null;
    })[]>;
    getPerfil(id: number): Promise<{
        Id_Usuario: number;
        Nombre: string;
        Correo: string;
        Telefono: string;
        Direccion: string;
        N_Documento: string;
        foto_perfil: string;
        tipo_de_documento: {
            nombre_del_documento: string;
        };
        cargo: string;
        dias_laborales: string;
        horario: string;
        especialidades: string;
        certificaciones: string;
        fecha_ingreso: Date;
        fecha_nacimiento: Date;
    }>;
    getDesempeno(id: number): Promise<{
        servicios_completados: number;
        servicios_pendientes: number;
        calificacion_promedio: string | import("@prisma/client/runtime/library").Decimal;
        puntualidad: string;
        comentarios_positivos: number;
    }>;
    getSinServicios(): Promise<{
        Id_Usuario: number;
        Correo: string;
        Nombre: string;
        Telefono: string;
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
        ID_Reserva: number;
        Estado: string;
        fecha: Date;
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
    updateFoto(id: number, fotoUrl: string): Promise<{
        Id_Usuario: number;
        foto_perfil: string;
    }>;
}
