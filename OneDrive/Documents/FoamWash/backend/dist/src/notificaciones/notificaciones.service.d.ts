import { PrismaService } from '../prisma/prisma.service';
export declare class NotificacionesService {
    private prisma;
    constructor(prisma: PrismaService);
    findByUsuario(userId: number): Promise<({
        usuario: {
            Nombre: string;
        };
    } & {
        id_notificaciones: number;
        descripcion_notificacion: string;
        fecha_notificacion: Date | null;
        usuario_Id_Usuario: number;
    })[]>;
}
