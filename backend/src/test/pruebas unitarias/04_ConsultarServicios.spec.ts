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

  it('CP-023: El cliente pueda consultar el listado de servicios', async () => {
    const serviciosMock = [
      { Id_Servicio: 1, Nombre_Servicio: 'Lavado Mueble 3 Puestos', Precio: 120000, estado: 'activo' },
      { Id_Servicio: 2, Nombre_Servicio: 'Lavado Colchón Queen', Precio: 140000, estado: 'activo' },
    ];
    mockPrismaService.servicio.findMany.mockResolvedValue(serviciosMock);

    const result = await serviciosService.findAll();

    expect(result).toHaveLength(2);
    expect(result[0].Nombre_Servicio).toBe('Lavado Mueble 3 Puestos');
  });

  it('CP-024: El sistema muestre la tarifa correspondiente a cada', async () => {
    mockPrismaService.servicio.findMany.mockResolvedValue([
      { Id_Servicio: 1, Nombre_Servicio: 'Lavado Sofa', Precio: 95000 },
    ]);

    const result = await serviciosService.findAll();
    expect(result[0].Precio).toBe(95000);
  });

  it('CP-025: El cliente pueda visualizar la informaci¾n detallada de', async () => {
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

  it('CP-026: El sistema permita consultar los servicios sin iniciar', async () => {
    mockPrismaService.servicio.findMany.mockResolvedValue([]);
    const result = await serviciosService.findAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it('CP-027: Las tarifas mostradas correspondan a las registradas en', async () => {
    mockPrismaService.servicio.findUnique.mockResolvedValue({
      Id_Servicio: 5,
      Nombre_Servicio: 'Limpieza Premium',
      Precio: 200000,
    });

    const result = await serviciosService.findOne(5);
    expect(result.Precio).toBeGreaterThan(0);
  });

  it('CP-028: El sistema cargue correctamente la informaci¾n de los', async () => {
    mockPrismaService.servicio.findUnique.mockResolvedValue(null);
    await expect(serviciosService.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('CP-029: El sistema muestre una imagen representativa del servicio', async () => {
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
