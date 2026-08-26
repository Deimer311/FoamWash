import { Test, TestingModule } from '@nestjs/testing';
import { CotizacionesService } from '../../cotizaciones/cotizaciones.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CotizacionesService', () => {
  let cotizacionesService: CotizacionesService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    servicio: {
      findMany: jest.fn(),
    },
    cotizacion: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CotizacionesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    cotizacionesService = module.get<CotizacionesService>(CotizacionesService);
    prismaService = module.get(PrismaService);
  });

  describe('getServicios', () => {
    it('debe retornar lista de servicios', async () => {
      mockPrismaService.servicio.findMany.mockResolvedValue([{ Id_Servicio: 1 }]);
      const res = await cotizacionesService.getServicios();
      expect(res).toEqual([{ Id_Servicio: 1 }]);
    });
  });

  describe('findAll', () => {
    it('debe retornar todas las cotizaciones', async () => {
      mockPrismaService.cotizacion.findMany.mockResolvedValue([{ Id_Cotizacion: 1 }]);
      const res = await cotizacionesService.findAll();
      expect(res).toEqual([{ Id_Cotizacion: 1 }]);
    });
  });

  describe('findByCliente', () => {
    it('debe retornar cotizaciones de un cliente', async () => {
      mockPrismaService.cotizacion.findMany.mockResolvedValue([{ Id_Cotizacion: 1 }]);
      const res = await cotizacionesService.findByCliente(1);
      expect(res).toEqual([{ Id_Cotizacion: 1 }]);
    });
  });

  describe('create', () => {
    it('debe crear una cotizacion', async () => {
      mockPrismaService.cotizacion.create.mockResolvedValue({ Id_Cotizacion: 1 });
      const res = await cotizacionesService.create({ 
        Precio_cotizado: 100,
        Cantidad: 1,
        Id_usuario: 1
      });
      expect(res).toEqual({ Id_Cotizacion: 1 });
    });
  });

  describe('sincronizar', () => {
    it('debe sincronizar cotizaciones', async () => {
      mockPrismaService.cotizacion.findFirst = jest.fn().mockResolvedValue(null);
      mockPrismaService.cotizacion.create.mockResolvedValue({ Id_Cotizacion: 1 });
      const res = await cotizacionesService.sincronizar([{ servicioId: 1, precio: 100 }], 1);
      expect(res).toEqual([{ Id_Cotizacion: 1 }]);
    });
  });
});
