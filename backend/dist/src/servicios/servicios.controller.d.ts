import { ServiciosService } from './servicios.service';
export declare class ServiciosController {
    private serviciosService;
    constructor(serviciosService: ServiciosService);
    findAll(): Promise<{
        success: boolean;
        count: number;
        data: {
            estado: string;
            Id_Servicio: number;
            Nombre_Servicio: string;
            Precio: import("@prisma/client/runtime/library").Decimal;
            descripcion: string;
            imagen_url: string;
            duracion_estimada: string;
        }[];
    }>;
    masSolicitados(): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    programadosHoy(): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        data: {
            estado: string;
            Id_Servicio: number;
            Nombre_Servicio: string;
            Precio: import("@prisma/client/runtime/library").Decimal;
            descripcion: string;
            imagen_url: string | null;
            cotizacion_Id_Cotizacion: number | null;
            duracion_estimada: string | null;
        };
    }>;
    create(body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            estado: string;
            Id_Servicio: number;
            Nombre_Servicio: string;
            Precio: import("@prisma/client/runtime/library").Decimal;
            descripcion: string;
            imagen_url: string | null;
            cotizacion_Id_Cotizacion: number | null;
            duracion_estimada: string | null;
        };
    }>;
    update(id: number, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            estado: string;
            Id_Servicio: number;
            Nombre_Servicio: string;
            Precio: import("@prisma/client/runtime/library").Decimal;
            descripcion: string;
            imagen_url: string | null;
            cotizacion_Id_Cotizacion: number | null;
            duracion_estimada: string | null;
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
