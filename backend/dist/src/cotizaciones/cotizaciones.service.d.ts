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
            Correo: string;
            Nombre: string;
            Telefono: string;
        };
        servicios: {
            estado: string;
            Id_Servicio: number;
            Nombre_Servicio: string;
            Precio: import("@prisma/client/runtime/library").Decimal;
            descripcion: string;
            imagen_url: string | null;
            cotizacion_Id_Cotizacion: number | null;
            duracion_estimada: string | null;
        }[];
    } & {
        Id_Cotizacion: number;
        Id_usuario: number;
        Precio_cotizado: import("@prisma/client/runtime/library").Decimal;
        Cantidad: number;
        Tamaño: string;
        fecha_cotizacion: Date | null;
        Id_servicio: number | null;
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
        Id_Cotizacion: number;
        Id_usuario: number;
        Precio_cotizado: import("@prisma/client/runtime/library").Decimal;
        Cantidad: number;
        Tamaño: string;
        fecha_cotizacion: Date | null;
        Id_servicio: number | null;
    }>;
    sincronizar(items: any[], userId: number): Promise<any[]>;
}
