import { BadRequestException } from '@nestjs/common';

describe('RNF-06: Manejo de Errores', () => {
  it('CP-033: BadRequestException', () => {
    const err = new BadRequestException();
    expect(err.getStatus()).toBe(400);
  });
});