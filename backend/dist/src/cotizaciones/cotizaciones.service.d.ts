import { PrismaService } from '../prisma/prisma.service';
export declare class CotizacionesService {
    private prisma;
    constructor(prisma: PrismaService);
    getServicios(): Promise<{
        Id_Servicio: number;
        Nombre_Servicio: string;
        Precio: import("@prisma/client/runtime/library").Decimal;
        descripcion: string;
        imagen_url: string;
    }[]>;
    findAll(): Promise<({
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
        Precio_cotizado: import("@prisma/client/runtime/library").Decimal;
        Id_Cotizacion: number;
        Id_usuario: number;
        Cantidad: number;
        Id_servicio: number | null;
        fecha_cotizacion: Date | null;
        Tamaño: string;
    })[]>;
    create(data: {
        Precio_cotizado: number;
        Cantidad: number;
        Tamaño?: string;
        Tamano?: string;
        Id_usuario: number;
        Id_servicio?: number;
        fecha_cotizacion?: Date;
    }): Promise<{
        Precio_cotizado: import("@prisma/client/runtime/library").Decimal;
        Id_Cotizacion: number;
        Id_usuario: number;
        Cantidad: number;
        Id_servicio: number | null;
        fecha_cotizacion: Date | null;
        Tamaño: string;
    }>;
    sincronizar(items: any[], userId: number): Promise<any[]>;
}
