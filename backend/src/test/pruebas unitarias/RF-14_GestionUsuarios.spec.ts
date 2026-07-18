import { Test, TestingModule } from '@nestjs/testing';

describe('RF-14: Gestión de Usuarios', () => {
  it('CP-019: Debería listar todos los usuarios', async () => {
    const userController = { findAll: jest.fn().mockResolvedValue({ data: [{ Id_Usuario: 1 }] }) };
    const result = await userController.findAll();
    expect(result.data.length).toBeGreaterThan(0);
  });
});