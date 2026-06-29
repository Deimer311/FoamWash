import { ClientesService } from './clientes.service';
export declare class ClientesController {
    private clientesService;
    constructor(clientesService: ClientesService);
    getPerfil(id: number): Promise<{
        success: boolean;
        data: {
            rol: {
                Rol: string;
            };
            Id_Usuario: number;
            N_Documento: string;
            Correo: string;
            Nombre: string;
            Telefono: string;
            Direccion: string;
            estado: import(".prisma/client").$Enums.usuario_estado;
            last_login: Date;
            fecha_registro: Date;
            foto_perfil: string;
            cotizaciones: {
                Id_Cotizacion: number;
                Id_usuario: number;
                Precio_cotizado: import("@prisma/client/runtime/library").Decimal;
                Cantidad: number;
                Tamaño: string;
                fecha_cotizacion: Date | null;
                Id_servicio: number | null;
            }[];
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
                nombre_del_documento: string;
            };
        };
    }>;
    updatePerfil(id: number, body: any): Promise<{
        success: boolean;
        data: {
            Id_Usuario: number;
            N_Documento: string;
            Correo: string;
            Nombre: string;
            Telefono: string;
            Direccion: string;
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
            foto_perfil: string;
        };
        message?: undefined;
    }>;
}
