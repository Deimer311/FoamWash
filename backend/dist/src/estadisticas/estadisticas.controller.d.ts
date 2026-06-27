import { EstadisticasService } from './estadisticas.service';
export declare class EstadisticasController {
    private estadisticasService;
    constructor(estadisticasService: EstadisticasService);
    getDashboard(periodo?: string): Promise<{
        Total_Clientes: number;
        Total_Reservas: number;
        Reservas_Completadas: number;
        Reservas_Pendientes: number;
        Ingresos_Totales: number;
        Servicios_Ofrecidos: number;
    }>;
}
