import { UsuariosService } from './usuarios.service';
export declare class UsuariosController {
    private usuariosService;
    constructor(usuariosService: UsuariosService);
    findAll(): Promise<{
        success: boolean;
        count: number;
        data: {
            Id_Usuario: number;
            Nombre: string;
            Telefono: string;
            N_Documento: string;
            Direccion: string;
            Correo: string;
            estado: import(".prisma/client").$Enums.usuario_estado;
            fecha_registro: Date;
            foto_perfil: string;
            tipo_de_documento: {
                nombre_del_documento: string;
            };
            rol: {
                Rol: string;
            };
        }[];
    }>;
    createEmpleado(body: any): Promise<{
        success: boolean;
        data: {
            Id_Usuario: number;
            Nombre: string;
            Telefono: string;
            Correo: string;
        };
    }>;
    usuariosPorRol(): Promise<{
        success: boolean;
        data: ({
            _count: {
                usuarios: number;
            };
        } & {
            Id_Rol: number;
            Rol: string;
        })[];
    }>;
    empleadosActivos(): Promise<{
        success: boolean;
        data: {
            Id_Usuario: number;
            Nombre: string;
            Telefono: string;
            Correo: string;
            last_login: Date;
        }[];
    }>;
    historialCliente(id: number): Promise<{
        success: boolean;
        data: ({
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
    findOne(id: number): Promise<{
        success: boolean;
        data: {
            stats: {
                total_reservas: number;
                completadas: number;
                pendientes: number;
                calificacion_promedio: string;
            };
            Id_Usuario: number;
            Nombre: string;
            Telefono: string;
            N_Documento: string;
            Direccion: string;
            Correo: string;
            estado: import(".prisma/client").$Enums.usuario_estado;
            last_login: Date;
            fecha_registro: Date;
            foto_perfil: string;
            reservasComoCliente: ({
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
            tipo_de_documento: {
                idTipo_de_Documento: number;
                nombre_del_documento: string;
            };
            rol: {
                Id_Rol: number;
                Rol: string;
            };
        };
    }>;
    update(id: number, body: any): Promise<{
        success: boolean;
        data: {
            Id_Usuario: number;
            Nombre: string;
            Telefono: string;
            N_Documento: string;
            Direccion: string;
            Correo: string;
            estado: import(".prisma/client").$Enums.usuario_estado;
            foto_perfil: string;
            tipo_de_documento: {
                idTipo_de_Documento: number;
                nombre_del_documento: string;
            };
        };
    }>;
    updateFoto(id: number, file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            Id_Usuario: number;
            Nombre: string;
            Telefono: string;
            N_Documento: string;
            Direccion: string;
            Correo: string;
            estado: import(".prisma/client").$Enums.usuario_estado;
            foto_perfil: string;
            tipo_de_documento: {
                idTipo_de_Documento: number;
                nombre_del_documento: string;
            };
        };
        message?: undefined;
    }>;
    softDelete(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
