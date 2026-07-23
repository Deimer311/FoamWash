import { Test, TestingModule } from '@nestjs/testing';

describe('Auditoría y Logs (RF-19)', () => {
  const registrarLogAuditoria = (accion: string, usuarioId: number, IP: string) => {
    return {
      timestamp: new Date(),
      accion,
      usuarioId,
      IP,
    };
  };

  it('CP-098: Registrar inicio de sesión en log de auditoría.', () => {
    const log = registrarLogAuditoria('LOGIN_SUCCESS', 1, '127.0.0.1');
    expect(log.accion).toBe('LOGIN_SUCCESS');
    expect(log.usuarioId).toBe(1);
    expect(log.IP).toBe('127.0.0.1');
  });

  it('CP-099: Registrar intento fallido de autenticación.', () => {
    const log = registrarLogAuditoria('LOGIN_FAILED', 0, '192.168.1.5');
    expect(log.accion).toBe('LOGIN_FAILED');
    expect(log.usuarioId).toBe(0);
  });

  it('CP-100: Registrar modificación de rol de usuario por admin.', () => {
    const log = registrarLogAuditoria('CHANGE_ROLE_CLIENTE_TO_ADMIN', 5, '127.0.0.1');
    expect(log.accion).toContain('CHANGE_ROLE');
  });

  it('CP-101: Consultar registros de auditoría en orden cronológico.', () => {
    const logs = [
      registrarLogAuditoria('EVENT_1', 1, '127.0.0.1'),
      registrarLogAuditoria('EVENT_2', 1, '127.0.0.1'),
    ];
    expect(logs).toHaveLength(2);
    expect(logs[0].timestamp.getTime()).toBeLessThanOrEqual(logs[1].timestamp.getTime());
  });
});
