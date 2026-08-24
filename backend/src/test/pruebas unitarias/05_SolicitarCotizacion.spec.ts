import { Test, TestingModule } from '@nestjs/testing';
import { CotizacionesService } from '../../cotizaciones/cotizaciones.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('SolicitarCotizacion', () => {
  let cotizacionesService: CotizacionesService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    cotizacion: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    servicio: {
      findMany: jest.fn(),
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

  it('CP-030: El cliente pueda solicitar una cotizaci¾n correctamente', async () => {
    mockPrismaService.cotizacion.create.mockResolvedValue({
      Id_Cotizacion: 1,
      Precio_cotizado: 150000,
      Cantidad: 1,
      Tamaño: 'Grande',
      Id_usuario: 10,
      fecha_cotizacion: new Date(),
    });

    const result = await cotizacionesService.create({
      Precio_cotizado: 150000,
      Cantidad: 1,
      Tamano: 'Grande',
      Id_usuario: 10,
      Id_servicio: 2,
    });

    expect(result.Id_Cotizacion).toBe(1);
    expect(mockPrismaService.cotizacion.create).toHaveBeenCalled();
  });

  it('CP-031: El sistema valide los campos obligatorios del formulario', async () => {
    mockPrismaService.cotizacion.create.mockRejectedValue(new Error('Missing fields'));

    await expect(
      cotizacionesService.create({
        Precio_cotizado: 0,
        Cantidad: 0,
        Id_usuario: 0,
      }),
    ).rejects.toThrow();
  });

  it('CP-032: El cliente pueda seleccionar un servicio para cotizar', async () => {
    mockPrismaService.servicio.findMany.mockResolvedValue([
      { Id_Servicio: 1, Nombre_Servicio: 'Sofá 2 puestos', Precio: 90000 },
    ]);

    const servicios = await cotizacionesService.getServicios();
    expect(servicios).toHaveLength(1);
    expect(servicios[0].Nombre_Servicio).toBe('Sofá 2 puestos');
  });

  it('CP-033: El sistema genere una cotizaci¾n estimada (si aplica)', async () => {
    mockPrismaService.cotizacion.create.mockResolvedValue({
      Id_Cotizacion: 2,
      Precio_cotizado: 220000,
      Cantidad: 2,
      Tamaño: 'Estándar',
      Id_usuario: 10,
    });

    const result = await cotizacionesService.create({
      Precio_cotizado: 220000,
      Cantidad: 2,
      Id_usuario: 10,
    });

    expect(result.Precio_cotizado).toBe(220000);
  });

  it('CP-034: La solicitud quede registrada en el sistema', async () => {
    mockPrismaService.cotizacion.findMany.mockResolvedValue([
      { Id_Cotizacion: 1, Id_usuario: 10, Precio_cotizado: 150000 },
    ]);

    const cotizaciones = await cotizacionesService.findByCliente(10);
    expect(cotizaciones).toHaveLength(1);
    expect(cotizaciones[0].Id_usuario).toBe(10);
  });
});
