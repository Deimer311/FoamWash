import { EmpleadosService } from './empleados.service';
export declare class EmpleadosController {
    private empleadosService;
    constructor(empleadosService: EmpleadosService);
    findAll(): Promise<{
        success: boolean;
        data: {
            Id_Usuario: number;
            Correo: string;
            Nombre: string;
            Telefono: string;
            estado: import(".prisma/client").$Enums.usuario_estado;
            foto_perfil: string;
        }[];
    }>;
    sinServicios(): Promise<{
        success: boolean;
        data: {
            Id_Usuario: number;
            Correo: string;
            Nombre: string;
            Telefono: string;
        }[];
    }>;
    serviciosFinalizados(): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    productividadGeneral(): Promise<{
        success: boolean;
        data: {
            Id_Usuario: number;
            Nombre: string;
            _count: {
                reservasComoEmpleado: number;
            };
        }[];
    }>;
    serviciosHoy(id: number): Promise<{
        success: boolean;
        data: ({
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
        })[];
        total: number;
    }>;
    agendaSemanal(id: number): Promise<{
        success: boolean;
        data: ({
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
        })[];
        total: number;
    }>;
    updateFoto(id: number, file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            Id_Usuario: number;
            foto_perfil: string;
        };
        message?: undefined;
    }>;
}
