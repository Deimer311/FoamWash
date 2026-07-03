// src/auth/dto/auth.dto.ts
// ============================================================
// Reemplaza los validators de express-validator en auth.validator.js
// ============================================================
import { IsEmail, IsString, MinLength, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiPropertyOptional({ example: '3001234567' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ example: 'Calle Falsa 123' })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  tipoDocumentoId?: number;

  @ApiPropertyOptional({ example: 'Cliente' })
  @IsOptional()
  @IsString()
  role?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  password: string;
}

export class RequestPasswordResetDto {
  @ApiProperty({ description: 'Correo electrónico registrado del usuario', example: 'juan@example.com' })
  @IsEmail()
  correo: string;
}

export class VerifyResetCodeDto {
  @ApiProperty({ description: 'Código de 6 dígitos enviado al correo', example: '123456' })
  @IsString()
  token: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Código de seguridad validado', example: '123456' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Nueva contraseña elegida por el usuario', example: 'NuevaClaveSegura123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
