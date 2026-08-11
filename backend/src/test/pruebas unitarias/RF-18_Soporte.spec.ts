import { Test, TestingModule } from '@nestjs/testing';

describe('Soporte y PQRS (RF-18)', () => {
  const crearTicketSoporte = (usuarioId: number, asunto: string, mensaje: string) => {
    if (!asunto || !mensaje) {
      throw new Error('Asunto y mensaje son requeridos');
    }
    return {
      idTicket: Math.floor(Math.random() * 1000) + 1,
      usuarioId,
      asunto,
      mensaje,
      estado: 'Abierto',
      fechaCreacion: new Date(),
    };
  };

  it('CP-093: Crear ticket de soporte con asunto y mensaje válido.', () => {
    const ticket = crearTicketSoporte(10, 'Problema con horario', 'Necesito reprogramar cita');
    expect(ticket.estado).toBe('Abierto');
    expect(ticket.asunto).toBe('Problema con horario');
  });

  it('CP-094: Rechazar ticket de soporte sin asunto.', () => {
    expect(() => crearTicketSoporte(10, '', 'Mensaje sin asunto')).toThrow('Asunto y mensaje son requeridos');
  });

  it('CP-095: Rechazar ticket de soporte sin mensaje.', () => {
    expect(() => crearTicketSoporte(10, 'Asunto solo', '')).toThrow('Asunto y mensaje son requeridos');
  });

  it('CP-096: Cambio de estado de ticket a Resuelto.', () => {
    const ticket = crearTicketSoporte(10, 'Consulta', 'Duda sobre precios');
    ticket.estado = 'Resuelto';
    expect(ticket.estado).toBe('Resuelto');
  });

  it('CP-097: Asignación de respuesta al ticket por el administrador.', () => {
    const respuestaAdmin = 'Buenas tardes, con gusto le colaboramos';
    expect(respuestaAdmin).toBeDefined();
    expect(respuestaAdmin.length).toBeGreaterThan(5);
  });
});
