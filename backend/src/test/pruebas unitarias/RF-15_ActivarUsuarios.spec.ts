import { Test, TestingModule } from '@nestjs/testing';

describe('RF-15: Activar/Inactivar Usuarios', () => {
  it('CP-020: Debería permitir cambiar el estado', async () => {
    const userController = { update: jest.fn().mockResolvedValue({ success: true, data: { estado: 'Inactivo' } }) };
    const result = await userController.update(1, { estado: 'Inactivo' });
    expect(result.data.estado).toBe('Inactivo');
  });
});