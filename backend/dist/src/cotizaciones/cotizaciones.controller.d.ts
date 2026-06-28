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
                Nombre: string;
                Telefono: string;
                Correo: string;
            };
            servicios: {
                Id_Servicio: number;
                Nombre_Servicio: string;
                Precio: import("@prisma/client/runtime/library").Decimal;
                descripcion: string;
                imagen_url: string | null;
                cotizacion_Id_Cotizacion: number | null;
                estado: string;
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
        })[];
    }>;
    create(body: any, req: any): Promise<{
        success: boolean;
        data: {
            Precio_cotizado: import("@prisma/client/runtime/library").Decimal;
            Id_Cotizacion: number;
            Id_usuario: number;
            Cantidad: number;
            Id_servicio: number | null;
            fecha_cotizacion: Date | null;
            Tamaño: string;
        };
    }>;
    sincronizar(items: any[], req: any): Promise<{
        success: boolean;
        sincronizados: number;
        data: any[];
    }>;
}
