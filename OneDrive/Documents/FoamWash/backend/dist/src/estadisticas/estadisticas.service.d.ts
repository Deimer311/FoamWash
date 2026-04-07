import { PrismaService } from '../prisma/prisma.service';
export declare class EstadisticasService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboard(): Promise<{
        Total_Clientes: number;
        Total_Reservas: number;
        Reservas_Completadas: number;
        Reservas_Pendientes: number;
        Ingresos_Totales: number | import("@prisma/client/runtime/library").Decimal;
        Servicios_Ofrecidos: number;
    }>;
}
