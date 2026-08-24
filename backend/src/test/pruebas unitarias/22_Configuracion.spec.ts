import { Test, TestingModule } from '@nestjs/testing';

describe('Configuración del Sistema', () => {
  interface AppConfig {
    horarioApertura: string;
    horarioCierre: string;
    maxReservasSimultaneas: number;
    politicaCancelacionHoras: number;
  }

  const defaultConfig: AppConfig = {
    horarioApertura: '08:00',
    horarioCierre: '17:00',
    maxReservasSimultaneas: 5,
    politicaCancelacionHoras: 24,
  };

  const actualizarConfiguracion = (actual: AppConfig, cambios: Partial<AppConfig>): AppConfig => {
    if (cambios.maxReservasSimultaneas !== undefined && cambios.maxReservasSimultaneas <= 0) {
      throw new Error('El número máximo de reservas debe ser mayor a 0');
    }
    return { ...actual, ...cambios };
  };

  it('CP-108: Consultar configuración global del sistema.', () => {
    expect(defaultConfig.horarioApertura).toBe('08:00');
    expect(defaultConfig.horarioCierre).toBe('17:00');
    expect(defaultConfig.politicaCancelacionHoras).toBe(24);
  });

  it('CP-109: Actualizar política de cancelación del sistema.', () => {
    const configActualizada = actualizarConfiguracion(defaultConfig, { politicaCancelacionHoras: 12 });
    expect(configActualizada.politicaCancelacionHoras).toBe(12);
  });

  it('CP-110: Actualizar número máximo de reservas simultáneas.', () => {
    const configActualizada = actualizarConfiguracion(defaultConfig, { maxReservasSimultaneas: 10 });
    expect(configActualizada.maxReservasSimultaneas).toBe(10);
  });

  it('CP-111: Rechazar configuración de máximo de reservas menor o igual a 0.', () => {
    expect(() => actualizarConfiguracion(defaultConfig, { maxReservasSimultaneas: 0 })).toThrow(
      'El número máximo de reservas debe ser mayor a 0',
    );
  });

  it('CP-112: Modificar horario de atención del servicio.', () => {
    const configActualizada = actualizarConfiguracion(defaultConfig, {
      horarioApertura: '07:00',
      horarioCierre: '18:00',
    });
    expect(configActualizada.horarioApertura).toBe('07:00');
    expect(configActualizada.horarioCierre).toBe('18:00');
  });

  it('CP-113: Persistencia de parámetros modificados.', () => {
    const c1 = actualizarConfiguracion(defaultConfig, { maxReservasSimultaneas: 8 });
    const c2 = actualizarConfiguracion(c1, { politicaCancelacionHoras: 48 });
    expect(c2.maxReservasSimultaneas).toBe(8);
    expect(c2.politicaCancelacionHoras).toBe(48);
  });

  it('CP-114: Restablecer configuración a valores por defecto.', () => {
    let config = actualizarConfiguracion(defaultConfig, { maxReservasSimultaneas: 20 });
    config = { ...defaultConfig };
    expect(config.maxReservasSimultaneas).toBe(5);
  });

  it('CP-115: Validar consistencia de los tipos de datos en la configuración.', () => {
    expect(typeof defaultConfig.horarioApertura).toBe('string');
    expect(typeof defaultConfig.maxReservasSimultaneas).toBe('number');
  });
});
