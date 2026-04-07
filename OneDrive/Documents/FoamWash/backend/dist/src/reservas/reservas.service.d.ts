import { PrismaService } from '../prisma/prisma.service';
export declare class ReservasService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
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
    })[]>;
    findByEstado(estado: string): Promise<({
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
    })[]>;
    findOne(id: number): Promise<{
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
    }>;
    private asignarEmpleadoAutomatico;
    create(data: {
        Estado?: string;
        Id_Usuario: number;
        fecha?: string;
        Hora?: string;
        Informacion_adicional?: string;
        observacion_Id_Observaciones?: number;
        empleado_Id_Usuario?: number;
        servicios?: Array<{
            Id_Servicio: number;
            cantidad?: number;
            tamano?: string;
        }>;
    }): Promise<{
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
    }>;
    update(id: number, data: Partial<{
        Estado: string;
        fecha: Date;
        Hora: Date;
        Informacion_adicional: string;
        empleado_Id_Usuario: number;
    }>): Promise<{
        Id_Usuario: number;
        ID_Reserva: number;
        Estado: string;
        fecha: Date;
        Hora: Date;
        Informacion_adicional: string | null;
        observacion_Id_Observaciones: number;
        empleado_Id_Usuario: number | null;
    }>;
    updateEstado(id: number, estado: string): Promise<{
        Id_Usuario: number;
        ID_Reserva: number;
        Estado: string;
        fecha: Date;
        Hora: Date;
        Informacion_adicional: string | null;
        observacion_Id_Observaciones: number;
        empleado_Id_Usuario: number | null;
    }>;
    remove(id: number): Promise<{
        Id_Usuario: number;
        ID_Reserva: number;
        Estado: string;
        fecha: Date;
        Hora: Date;
        Informacion_adicional: string | null;
        observacion_Id_Observaciones: number;
        empleado_Id_Usuario: number | null;
    }>;
    findByCliente(clienteId: number): Promise<({
        observacion: {
            estado: string | null;
            Id_Observaciones: number;
            Observaciones: string | null;
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
    })[]>;
}
