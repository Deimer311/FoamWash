import { Test, TestingModule } from '@nestjs/testing';
import { CotizacionesController } from '../../cotizaciones/cotizaciones.controller';
import { CotizacionesService } from '../../cotizaciones/cotizaciones.service';

describe('RF-11: Cotizar Servicio', () => {
  let controller: CotizacionesController;
  const mockCotizacionesService = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CotizacionesController],
      providers: [{ provide: CotizacionesService, useValue: mockCotizacionesService }],
    }).compile();
    controller = module.get<CotizacionesController>(CotizacionesController);
  });

  it('CP-016: Debería guardar la cotización', async () => {
    const payload: any = { Total: 50000, Id_servicio: 1, Tamano: 'S' };
    mockCotizacionesService.create.mockResolvedValue({ Id_Cotizacion: 1, ...payload });
    const result = await controller.create(payload, { user: { id: 2 } });
    expect(result.success).toBe(true);
  });
});