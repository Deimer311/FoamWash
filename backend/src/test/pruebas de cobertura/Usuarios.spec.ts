import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmpleadosService } from '../../empleados/empleados.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsuariosService', () => {
  let usuariosService: UsuariosService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    usuario: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    reserva: {
      findMany: jest.fn(),
    },
    calificacion: {
      findMany: jest.fn(),
    },
    rol: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmpleadosService, useValue: {} },
      ],
    }).compile();

    usuariosService = module.get<UsuariosService>(UsuariosService);
    prismaService = module.get(PrismaService);
  });

  it('findAll - debe retornar usuarios activos', async () => {
    mockPrismaService.usuario.findMany.mockResolvedValue([{ Id_Usuario: 1, Nombre: 'Test' }]);
    const result = await usuariosService.findAll();
    expect(result).toEqual([{ Id_Usuario: 1, Nombre: 'Test' }]);
  });

  describe('findOne', () => {
    it('debe lanzar NotFoundException si no existe el usuario', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      await expect(usuariosService.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('debe retornar usuario con estadísticas si existe', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        Id_Usuario: 1,
        Nombre: 'User',
        reservasComoCliente: [
          { ID_Reserva: 10, Estado: 'Completado' },
          { ID_Reserva: 11, Estado: 'Pendiente' },
        ],
      });
      mockPrismaService.calificacion.findMany.mockResolvedValue([
        { puntaje: '5' },
        { puntaje: '4' },
      ]);

      const result = await usuariosService.findOne(1);
      expect(result.Nombre).toBe('User');
      expect(result.stats).toEqual({
        total_reservas: 2,
        completadas: 1,
        pendientes: 1,
        calificacion_promedio: '4.5',
      });
    });
  });

  describe('update', () => {
    it('debe lanzar NotFoundException si no existe el usuario', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      await expect(usuariosService.update(1, {})).rejects.toThrow(NotFoundException);
    });

    it('debe actualizar el usuario si existe y no hay cambio de contraseña', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({ Id_Usuario: 1 });
      mockPrismaService.usuario.update.mockResolvedValue({ Id_Usuario: 1, Nombre: 'Updated' });

      const result = await usuariosService.update(1, { Nombre: 'Updated' });
      expect(result).toEqual({ Id_Usuario: 1, Nombre: 'Updated' });
      expect(mockPrismaService.usuario.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { Id_Usuario: 1 },
        data: { Nombre: 'Updated' },
      }));
    });
  });

  describe('softDelete', () => {
    it('debe lanzar NotFoundException si no existe el usuario', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      await expect(usuariosService.softDelete(1)).rejects.toThrow(NotFoundException);
    });

    it('debe desactivar al usuario si existe', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({ Id_Usuario: 1 });
      mockPrismaService.usuario.update.mockResolvedValue({ Id_Usuario: 1, estado: 'inactivo' });
      const result = await usuariosService.softDelete(1);
      expect(result.estado).toBe('inactivo');
    });
  });

  describe('usuariosPorRol', () => {
    it('debe retornar lista de usuarios por rol', async () => {
      mockPrismaService.rol.findMany.mockResolvedValue([{ Id_Usuario: 1 }]);
      const res = await usuariosService.usuariosPorRol();
      expect(res).toEqual([{ Id_Usuario: 1 }]);
    });
  });

  describe('empleadosActivos', () => {
    it('debe retornar empleados activos', async () => {
      mockPrismaService.usuario.findMany.mockResolvedValue([{ Id_Usuario: 1 }]);
      const res = await usuariosService.empleadosActivos();
      expect(res).toEqual([{ Id_Usuario: 1 }]);
    });
  });

  describe('historialCliente', () => {
    it('debe retornar historial de reservas del cliente', async () => {
      mockPrismaService.reserva = { findMany: jest.fn().mockResolvedValue([{ ID_Reserva: 1 }]) };
      const res = await usuariosService.historialCliente(1);
      expect(res).toEqual([{ ID_Reserva: 1 }]);
    });
  });

});
