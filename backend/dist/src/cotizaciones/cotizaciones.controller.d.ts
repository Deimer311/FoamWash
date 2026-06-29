import { CotizacionesService } from './cotizaciones.service';
export declare class CotizacionesController {
    private cotizacionesService;
    constructor(cotizacionesService: CotizacionesService);
    getServicios(): Promise<{
        success: boolean;
        data: {
            Id_Servicio: number;
            Nombre_Servicio: string;
            Precio: import("@prisma/client/runtime/library").Decimal;
            descripcion: string;
            imagen_url: string;
        }[];
    }>;
    findAll(): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    create(body: any, req: any): Promise<{
        success: boolean;
        data: {
            Id_Cotizacion: number;
            Id_usuario: number;
            Precio_cotizado: import("@prisma/client/runtime/library").Decimal;
            Cantidad: number;
            Tamaño: string;
            fecha_cotizacion: Date | null;
            Id_servicio: number | null;
        };
    }>;
    sincronizar(items: any[], req: any): Promise<{
        success: boolean;
        sincronizados: number;
        data: any[];
    }>;
}
