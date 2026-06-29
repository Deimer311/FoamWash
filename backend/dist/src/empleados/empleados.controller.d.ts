import { EmpleadosService } from './empleados.service';
export declare class EmpleadosController {
    private empleadosService;
    constructor(empleadosService: EmpleadosService);
    findAll(): Promise<{
        success: boolean;
        data: {
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
            Id_Usuario: number;
            N_Documento: string;
            Correo: string;
            Nombre: string;
            Telefono: string;
            Direccion: string;
            estado: import(".prisma/client").$Enums.usuario_estado;
            foto_perfil: string;
            tipo_de_documento: {
                idTipo_de_Documento: number;
                nombre_del_documento: string;
            };
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
    perfilCompleto(id: number): Promise<{
        success: boolean;
        data: {
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
                idTipo_de_Documento: number;
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
        };
    }>;
    desempeno(id: number): Promise<{
        success: boolean;
        data: {
            servicios_mes: number;
            calificacion_promedio: number;
            total_calificaciones: number;
            comentarios: number;
            puntualidad: any;
        };
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
    agendaMensual(id: number): Promise<{
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
    historial(id: number): Promise<{
        success: boolean;
        data: ({
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
        })[];
        total: number;
    }>;
    completados(id: number): Promise<{
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
    pendientes(id: number): Promise<{
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
