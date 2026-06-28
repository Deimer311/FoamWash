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
            Nombre: string;
            Correo: string;
            reservasComoCliente: {
                fecha: Date;
                ID_Reserva: number;
                Estado: string;
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
            fecha: Date;
            ID_Reserva: number;
            Estado: string;
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
                Nombre: string;
                Telefono: string;
                Correo: string;
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
    }>;
    c6(): Promise<{
        success: boolean;
        consulta: number;
        data: {
            _count: {
                servicios: number;
            };
            fecha: Date;
            ID_Reserva: number;
            Estado: string;
        }[];
    }>;
    c7(): Promise<{
        success: boolean;
        consulta: number;
        data: {
            Id_Usuario: number;
            Nombre: string;
            Correo: string;
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
                fecha: Date;
                ID_Reserva: number;
                Estado: string;
            }[];
        }[];
    }>;
    c9(): Promise<{
        success: boolean;
        consulta: number;
        data: {
            Id_Usuario: number;
            Nombre: string;
            Telefono: string;
            Correo: string;
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
            fecha: Date;
            ID_Reserva: number;
            Estado: string;
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
                Nombre: string;
                Correo: string;
                reservasComoCliente: {
                    fecha: Date;
                    ID_Reserva: number;
                    Estado: string;
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
                }[];
            }[];
            consulta5_clientesSemana: ({
                cliente: {
                    Nombre: string;
                    Telefono: string;
                    Correo: string;
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
            consulta6_reservasPorServicio: {
                _count: {
                    servicios: number;
                };
                fecha: Date;
                ID_Reserva: number;
                Estado: string;
            }[];
            consulta7_reservasPorCliente: {
                Id_Usuario: number;
                Nombre: string;
                Correo: string;
                _count: {
                    reservasComoCliente: number;
                };
            }[];
            consulta9_empleadosSinServicios: {
                Id_Usuario: number;
                Nombre: string;
                Telefono: string;
                Correo: string;
            }[];
        };
    }>;
}
