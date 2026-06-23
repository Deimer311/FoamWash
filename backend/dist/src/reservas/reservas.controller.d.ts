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
                Nombre: string;
                Telefono: string;
                Correo: string;
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
    findByEstado(estado: string): Promise<{
        success: boolean;
        data: ({
            cliente: {
                Nombre: string;
                Telefono: string;
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
                Nombre: string;
                Telefono: string;
                Correo: string;
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
                cliente: {
                    Id_Usuario: number;
                    Nombre: string | null;
                    Telefono: string | null;
                    N_Documento: string | null;
                    Direccion: string | null;
                    Correo: string | null;
                    password_hash: string | null;
                    estado: import(".prisma/client").$Enums.usuario_estado | null;
                    rol_Id_Rol: number | null;
                    tipo_de_documento_id_tipo_de_documento: number | null;
                    reset_token: string | null;
                    reset_token_expires: Date | null;
                    last_login: Date | null;
                    fecha_registro: Date | null;
                    access_token: string | null;
                    refresh_token: string | null;
                    token_created_at: Date | null;
                    token_expires_at: Date | null;
                    foto_perfil: string | null;
                };
                Id_Usuario: number;
                fecha: Date;
                ID_Reserva: number;
                Estado: string;
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
            fecha: Date;
            ID_Reserva: number;
            Estado: string;
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
            cliente: {
                Id_Usuario: number;
                Nombre: string | null;
                Telefono: string | null;
                N_Documento: string | null;
                Direccion: string | null;
                Correo: string | null;
                password_hash: string | null;
                estado: import(".prisma/client").$Enums.usuario_estado | null;
                rol_Id_Rol: number | null;
                tipo_de_documento_id_tipo_de_documento: number | null;
                reset_token: string | null;
                reset_token_expires: Date | null;
                last_login: Date | null;
                fecha_registro: Date | null;
                access_token: string | null;
                refresh_token: string | null;
                token_created_at: Date | null;
                token_expires_at: Date | null;
                foto_perfil: string | null;
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
        };
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
