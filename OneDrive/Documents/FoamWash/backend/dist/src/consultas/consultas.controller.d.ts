import { ConsultasService } from './consultas.service';
export declare class ConsultasController {
    private consultasService;
    constructor(consultasService: ConsultasService);
    c1(): Promise<{
        success: boolean;
        consulta: number;
        data: {
            _count: {
                usuarios: number;
            };
            Rol: string;
        }[];
    }>;
    c2(): Promise<{
        success: boolean;
        consulta: number;
        data: {
            Id_Servicio: number;
            Nombre_Servicio: string;
            Precio: import("@prisma/client/runtime/library").Decimal;
            descripcion: string;
        }[];
    }>;
    c3(): Promise<{
        success: boolean;
        consulta: number;
        data: {
            Id_Usuario: number;
            Correo: string;
            Nombre: string;
            reservasComoCliente: {
                ID_Reserva: number;
                Estado: string;
                fecha: Date;
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
            }[];
        }[];
    }>;
    c4(id: number): Promise<{
        success: boolean;
        consulta: number;
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
            ID_Reserva: number;
            Estado: string;
            fecha: Date;
            Hora: Date;
            Informacion_adicional: string | null;
            observacion_Id_Observaciones: number;
            empleado_Id_Usuario: number | null;
        })[];
    }>;
    c5(): Promise<{
        success: boolean;
        consulta: number;
        data: ({
            cliente: {
                Correo: string;
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
    c6(): Promise<{
        success: boolean;
        consulta: number;
        data: {
            _count: {
                servicios: number;
            };
            ID_Reserva: number;
            Estado: string;
            fecha: Date;
        }[];
    }>;
    c7(): Promise<{
        success: boolean;
        consulta: number;
        data: {
            Id_Usuario: number;
            Correo: string;
            Nombre: string;
            _count: {
                reservasComoCliente: number;
            };
        }[];
    }>;
    c8(): Promise<{
        success: boolean;
        consulta: number;
        data: {
            Id_Usuario: number;
            Nombre: string;
            reservasComoEmpleado: {
                ID_Reserva: number;
                Estado: string;
                fecha: Date;
            }[];
        }[];
    }>;
    c9(): Promise<{
        success: boolean;
        consulta: number;
        data: {
            Id_Usuario: number;
            Correo: string;
            Nombre: string;
            Telefono: string;
        }[];
    }>;
    c10(): Promise<{
        success: boolean;
        consulta: number;
        data: ({
            empleado: {
                Nombre: string;
            };
            cliente: {
                Nombre: string;
                Telefono: string;
            };
            servicios: {
                Nombre_Servicio: string;
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
    todas(): Promise<{
        success: boolean;
        data: {
            consulta1_usuariosPorRol: {
                _count: {
                    usuarios: number;
                };
                Rol: string;
            }[];
            consulta2_serviciosDisponibles: {
                Id_Servicio: number;
                Nombre_Servicio: string;
                Precio: import("@prisma/client/runtime/library").Decimal;
                descripcion: string;
            }[];
            consulta3_serviciosPorCliente: {
                Id_Usuario: number;
                Correo: string;
                Nombre: string;
                reservasComoCliente: {
                    ID_Reserva: number;
                    Estado: string;
                    fecha: Date;
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
                }[];
            }[];
            consulta5_clientesSemana: ({
                cliente: {
                    Correo: string;
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
            consulta6_reservasPorServicio: {
                _count: {
                    servicios: number;
                };
                ID_Reserva: number;
                Estado: string;
                fecha: Date;
            }[];
            consulta7_reservasPorCliente: {
                Id_Usuario: number;
                Correo: string;
                Nombre: string;
                _count: {
                    reservasComoCliente: number;
                };
            }[];
            consulta9_empleadosSinServicios: {
                Id_Usuario: number;
                Correo: string;
                Nombre: string;
                Telefono: string;
            }[];
        };
    }>;
}
