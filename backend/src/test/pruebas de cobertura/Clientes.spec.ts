import { Test, TestingModule } from '@nestjs/testing';
import { ClientesService } from '../../clientes/clientes.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ClientesService', () => {
  let service: ClientesService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    usuario: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ClientesService>(ClientesService);
    prismaService = module.get(PrismaService);
  });

  describe('getPerfil', () => {
    it('debe retornar perfil del cliente', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({ Id_Usuario: 1 } as any);
      const res = await service.getPerfil(1);
      expect(res).toEqual({ Id_Usuario: 1 });
    });

    it('debe lanzar excepcion si no existe', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      await expect(service.getPerfil(1)).rejects.toThrow('Cliente no encontrado');
    });
  });

  describe('updatePerfil', () => {
    it('debe actualizar perfil del cliente', async () => {
      mockPrismaService.usuario.update.mockResolvedValue({ Id_Usuario: 1 } as any);
      const res = await service.updatePerfil(1, { Nombre: 'Juan' });
      expect(res).toEqual({ Id_Usuario: 1 });
    });
  });

  describe('updateFoto', () => {
    it('debe actualizar foto del cliente', async () => {
      mockPrismaService.usuario.update.mockResolvedValue({ Id_Usuario: 1, foto_perfil: 'url' } as any);
      const res = await service.updateFoto(1, 'url');
      expect(res).toEqual({ Id_Usuario: 1, foto_perfil: 'url' });
    });
  });
});
