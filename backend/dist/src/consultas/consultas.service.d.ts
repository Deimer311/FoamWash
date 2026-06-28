import { PrismaService } from '../prisma/prisma.service';
export declare class ConsultasService {
    private prisma;
    constructor(prisma: PrismaService);
    usuariosPorRol(): Promise<{
        _count: {
            usuarios: number;
        };
        Rol: string;
    }[]>;
    serviciosDisponibles(): Promise<{
        Id_Servicio: number;
        Nombre_Servicio: string;
        Precio: import("@prisma/client/runtime/library").Decimal;
        descripcion: string;
    }[]>;
    serviciosPorCliente(): Promise<{
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
    }[]>;
    agendaEmpleado(id: number): Promise<({
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
    })[]>;
    clientesSemana(): Promise<({
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
    })[]>;
    reservasPorServicio(): Promise<{
        _count: {
            servicios: number;
        };
        fecha: Date;
        ID_Reserva: number;
        Estado: string;
    }[]>;
    reservasPorCliente(): Promise<{
        Id_Usuario: number;
        Nombre: string;
        Correo: string;
        _count: {
            reservasComoCliente: number;
        };
    }[]>;
    empleadosServiciosMes(): Promise<{
        Id_Usuario: number;
        Nombre: string;
        reservasComoEmpleado: {
            fecha: Date;
            ID_Reserva: number;
            Estado: string;
        }[];
    }[]>;
    empleadosSinServicios(): Promise<{
        Id_Usuario: number;
        Nombre: string;
        Telefono: string;
        Correo: string;
    }[]>;
    agendaSemanalCompleta(): Promise<({
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
    })[]>;
    todas(): Promise<{
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
    }>;
}
