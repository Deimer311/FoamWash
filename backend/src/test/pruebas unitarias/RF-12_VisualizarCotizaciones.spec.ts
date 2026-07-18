import { Test, TestingModule } from '@nestjs/testing';
import { CotizacionesController } from '../../cotizaciones/cotizaciones.controller';
import { CotizacionesService } from '../../cotizaciones/cotizaciones.service';

describe('RF-12: Visualizar Cotizaciones Guardadas', () => {
  let controller: CotizacionesController;
  const mockCotizacionesService = { findByCliente: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CotizacionesController],
      providers: [{ provide: CotizacionesService, useValue: mockCotizacionesService }],
    }).compile();
    controller = module.get<CotizacionesController>(CotizacionesController);
  });

  it('CP-017: Debería devolver las cotizaciones específicas del cliente', async () => {
    mockCotizacionesService.findByCliente.mockResolvedValue([{ Id_Cotizacion: 1, Total: 50000 }]);
    const result = await controller.findByCliente(2);
    expect(result.data).toHaveLength(1);
  });
});