import { NotificacionesService } from './notificaciones.service';
export declare class NotificacionesController {
    private notificacionesService;
    constructor(notificacionesService: NotificacionesService);
    findByUsuario(userId: number): Promise<{
        success: boolean;
        data: ({
            usuario: {
                Nombre: string;
            };
        } & {
            usuario_Id_Usuario: number;
            id_notificaciones: number;
            descripcion_notificacion: string;
            fecha_notificacion: Date | null;
        })[];
    }>;
}
