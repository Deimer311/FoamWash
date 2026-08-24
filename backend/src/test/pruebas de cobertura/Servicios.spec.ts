import { Test, TestingModule } from '@nestjs/testing';
import { ServiciosService } from '../../servicios/servicios.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ServiciosService', () => {
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

  describe('findAll', () => {
    it('debe retornar lista de servicios', async () => {
      mockPrismaService.servicio.findMany.mockResolvedValue([{ Id_Servicio: 1 }]);
      const res = await serviciosService.findAll();
      expect(res).toEqual([{ Id_Servicio: 1 }]);
    });
  });

  describe('findOne', () => {
    it('debe lanzar NotFoundException si no existe', async () => {
      mockPrismaService.servicio.findUnique.mockResolvedValue(null);
      await expect(serviciosService.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('debe retornar el servicio si existe', async () => {
      mockPrismaService.servicio.findUnique.mockResolvedValue({ Id_Servicio: 1 });
      const res = await serviciosService.findOne(1);
      expect(res).toEqual({ Id_Servicio: 1 });
    });
  });

  describe('create', () => {
    it('debe crear un nuevo servicio', async () => {
      mockPrismaService.servicio.create.mockResolvedValue({ Id_Servicio: 1, Nombre_Servicio: 'Test' });
      const res = await serviciosService.create({ Nombre_Servicio: 'Test', Precio: 100 });
      expect(res).toEqual({ Id_Servicio: 1, Nombre_Servicio: 'Test' });
    });
  });

  describe('update', () => {
    it('debe lanzar NotFoundException si no existe el servicio a actualizar', async () => {
      mockPrismaService.servicio.findUnique.mockResolvedValue(null);
      await expect(serviciosService.update(99, {})).rejects.toThrow(NotFoundException);
    });

    it('debe actualizar el servicio correctamente', async () => {
      mockPrismaService.servicio.findUnique.mockResolvedValue({ Id_Servicio: 1 });
      mockPrismaService.servicio.update.mockResolvedValue({ Id_Servicio: 1, Precio: 200 });
      const res = await serviciosService.update(1, { Precio: 200 });
      expect(res).toEqual({ Id_Servicio: 1, Precio: 200 });
    });
  });

  describe('remove', () => {
    it('debe lanzar NotFoundException si no existe el servicio a eliminar', async () => {
      mockPrismaService.servicio.findUnique.mockResolvedValue(null);
      await expect(serviciosService.remove(99)).rejects.toThrow(NotFoundException);
    });

    it('debe eliminar el servicio', async () => {
      mockPrismaService.servicio.findUnique.mockResolvedValue({ Id_Servicio: 1 });
      mockPrismaService.servicio.delete.mockResolvedValue({ Id_Servicio: 1 });
      const res = await serviciosService.remove(1);
      expect(res).toEqual({ Id_Servicio: 1 });
    });
  });

  describe('masSolicitados', () => {
    it('debe retornar servicios más solicitados', async () => {
      mockPrismaService.servicio.findMany.mockResolvedValue([{ Id_Servicio: 1 }]);
      const res = await serviciosService.masSolicitados();
      expect(res).toEqual([{ Id_Servicio: 1 }]);
    });
  });

  describe('programadosHoy', () => {
    it('debe retornar servicios programados hoy', async () => {
      mockPrismaService.servicio.findMany.mockResolvedValue([{ Id_Servicio: 2 }]);
      const res = await serviciosService.programadosHoy();
      expect(res).toEqual([{ Id_Servicio: 2 }]);
    });
  });

});
