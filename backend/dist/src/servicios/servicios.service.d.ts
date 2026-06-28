import { PrismaService } from '../prisma/prisma.service';
export declare class ServiciosService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        estado: string;
        Id_Servicio: number;
        Nombre_Servicio: string;
        Precio: import("@prisma/client/runtime/library").Decimal;
        descripcion: string;
        imagen_url: string;
        duracion_estimada: string;
    }[]>;
    findOne(id: number): Promise<{
        estado: string;
        Id_Servicio: number;
        Nombre_Servicio: string;
        Precio: import("@prisma/client/runtime/library").Decimal;
        descripcion: string;
        imagen_url: string | null;
        cotizacion_Id_Cotizacion: number | null;
        duracion_estimada: string | null;
    }>;
    create(data: {
        Nombre_Servicio: string;
        Precio: number;
        descripcion?: string;
        imagen_url?: string;
    }): Promise<{
        estado: string;
        Id_Servicio: number;
        Nombre_Servicio: string;
        Precio: import("@prisma/client/runtime/library").Decimal;
        descripcion: string;
        imagen_url: string | null;
        cotizacion_Id_Cotizacion: number | null;
        duracion_estimada: string | null;
    }>;
    update(id: number, data: Partial<{
        Nombre_Servicio: string;
        Precio: number;
        descripcion: string;
        imagen_url: string;
    }>): Promise<{
        estado: string;
        Id_Servicio: number;
        Nombre_Servicio: string;
        Precio: import("@prisma/client/runtime/library").Decimal;
        descripcion: string;
        imagen_url: string | null;
        cotizacion_Id_Cotizacion: number | null;
        duracion_estimada: string | null;
    }>;
    remove(id: number): Promise<{
        estado: string;
        Id_Servicio: number;
        Nombre_Servicio: string;
        Precio: import("@prisma/client/runtime/library").Decimal;
        descripcion: string;
        imagen_url: string | null;
        cotizacion_Id_Cotizacion: number | null;
        duracion_estimada: string | null;
    }>;
    masSolicitados(): Promise<({
        reservas: {
            Id_Usuario: number;
            fecha: Date;
            ID_Reserva: number;
            Estado: string;
            Hora: Date;
            Informacion_adicional: string | null;
            observacion_Id_Observaciones: number;
            empleado_Id_Usuario: number | null;
        }[];
    } & {
        estado: string;
        Id_Servicio: number;
        Nombre_Servicio: string;
        Precio: import("@prisma/client/runtime/library").Decimal;
        descripcion: string;
        imagen_url: string | null;
        cotizacion_Id_Cotizacion: number | null;
        duracion_estimada: string | null;
    })[]>;
    programadosHoy(): Promise<({
        reservas: ({
            empleado: {
                Nombre: string;
            };
            cliente: {
                Nombre: string;
            };
        } & {
            Id_Usuario: number;
            fecha: Date;
            ID_Reserva: number;
            Estado: string;
            Hora: Date;
            Informacion_adicional: string | null;
            observacion_Id_Observaciones: number;
            empleado_Id_Usuario: number | null;
        })[];
    } & {
        estado: string;
        Id_Servicio: number;
        Nombre_Servicio: string;
        Precio: import("@prisma/client/runtime/library").Decimal;
        descripcion: string;
        imagen_url: string | null;
        cotizacion_Id_Cotizacion: number | null;
        duracion_estimada: string | null;
    })[]>;
}
