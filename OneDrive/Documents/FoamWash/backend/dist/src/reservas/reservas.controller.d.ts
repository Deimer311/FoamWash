import { ReservasService } from './reservas.service';
export declare class ReservasController {
    private reservasService;
    constructor(reservasService: ReservasService);
    findAll(): Promise<{
        success: boolean;
        data: ({
            empleado: {
                Nombre: string;
            };
            observacion: {
                estado: string;
                Observaciones: string;
            };
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
    }>;
    findByEstado(estado: string): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        data: {
            empleado: {
                Nombre: string;
            };
            observacion: {
                estado: string | null;
                Id_Observaciones: number;
                Observaciones: string | null;
            };
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
        };
    }>;
    create(body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            success: boolean;
            data: {
                empleado_asignado: string;
                empleado: {
                    Id_Usuario: number;
                    Nombre: string;
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
        };
    }>;
    update(id: number, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
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
    updateEstado(id: number, estado: string): Promise<{
        success: boolean;
        message: string;
        data: {
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
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
