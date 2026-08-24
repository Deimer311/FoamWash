import { Test, TestingModule } from '@nestjs/testing';
import { ServiciosService } from '../../servicios/servicios.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ConsultarServicios', () => {
  let serviciosService: ServiciosService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    servicio: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiciosService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    serviciosService = module.get<ServiciosService>(ServiciosService);
    prismaService = module.get(PrismaService);
  });

  it('CP-023: Pueda consultar el listado de servicios disponibles.', async () => {
    const serviciosMock = [
      { Id_Servicio: 1, Nombre_Servicio: 'Lavado Mueble 3 Puestos', Precio: 120000, estado: 'activo' },
      { Id_Servicio: 2, Nombre_Servicio: 'Lavado Colchón Queen', Precio: 140000, estado: 'activo' },
    ];
    mockPrismaService.servicio.findMany.mockResolvedValue(serviciosMock);

    const result = await serviciosService.findAll();

    expect(result).toHaveLength(2);
    expect(result[0].Nombre_Servicio).toBe('Lavado Mueble 3 Puestos');
  });

  it('CP-024: Muestre la tarifa correspondiente a cada servicio.', async () => {
    mockPrismaService.servicio.findMany.mockResolvedValue([
      { Id_Servicio: 1, Nombre_Servicio: 'Lavado Sofa', Precio: 95000 },
    ]);

    const result = await serviciosService.findAll();
    expect(result[0].Precio).toBe(95000);
  });

  it('CP-025: Pueda visualizar la información detallada de un servicio.', async () => {
    mockPrismaService.servicio.findUnique.mockResolvedValue({
      Id_Servicio: 1,
      Nombre_Servicio: 'Lavado de Alfombra',
      Precio: 80000,
      descripcion: 'Limpieza profunda de alfombra con espuma seca',
    });

    const result = await serviciosService.findOne(1);
    expect(result.Id_Servicio).toBe(1);
    expect(result.descripcion).toContain('espuma seca');
  });

  it('CP-026: Permita consultar los servicios sin iniciar sesión.', async () => {
    mockPrismaService.servicio.findMany.mockResolvedValue([]);
    const result = await serviciosService.findAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it('CP-027: Las tarifas mostradas correspondan a las registradas en el sistema.', async () => {
    mockPrismaService.servicio.findUnique.mockResolvedValue({
      Id_Servicio: 5,
      Nombre_Servicio: 'Limpieza Premium',
      Precio: 200000,
    });

    const result = await serviciosService.findOne(5);
    expect(result.Precio).toBeGreaterThan(0);
  });

  it('CP-028: Cargue correctamente la información de los servicios o lance 404 si no existe.', async () => {
    mockPrismaService.servicio.findUnique.mockResolvedValue(null);
    await expect(serviciosService.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('CP-029: Muestre una imagen representativa del servicio (si aplica).', async () => {
    mockPrismaService.servicio.findUnique.mockResolvedValue({
      Id_Servicio: 1,
      Nombre_Servicio: 'Lavado Autos',
      Precio: 150000,
      imagen_url: 'http://localhost:3000/uploads/auto.jpg',
    });

    const result = await serviciosService.findOne(1);
    expect(result.imagen_url).toBeDefined();
  });
});
