import { PrismaService } from '../prisma/prisma.service';
export declare class ClientesService {
    private prisma;
    constructor(prisma: PrismaService);
    getPerfil(id: number): Promise<{
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
        cotizaciones: {
            Precio_cotizado: import("@prisma/client/runtime/library").Decimal;
            Id_Cotizacion: number;
            Id_usuario: number;
            Cantidad: number;
            Id_servicio: number | null;
            fecha_cotizacion: Date | null;
            Tamaño: string;
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
        tipo_de_documento: {
            nombre_del_documento: string;
        };
        rol: {
            Rol: string;
        };
    }>;
    updatePerfil(id: number, data: Partial<{
        Nombre: string;
        Telefono: string;
        Direccion: string;
        N_Documento: string;
    }>): Promise<{
        Id_Usuario: number;
        Nombre: string;
        Telefono: string;
        Direccion: string;
        Correo: string;
    }>;
    updateFoto(id: number, fotoUrl: string): Promise<{
        Id_Usuario: number;
        foto_perfil: string;
    }>;
}
