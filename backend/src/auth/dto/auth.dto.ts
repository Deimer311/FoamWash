// src/auth/dto/auth.dto.ts
// ============================================================
// Reemplaza los validators de express-validator en auth.validator.js
// ============================================================
import { IsEmail, IsString, MinLength, IsOptional, IsNumber } from 'class-validator';

export class RegisterDto {
  @IsString()
  nombre: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsNumber()
  tipoDocumentoId?: number;

  @IsOptional()
  @IsString()
  role?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @IsString()
  password: string;
}

export class RequestPasswordResetDto {
  @IsEmail()
  correo: string;
}

export class VerifyResetCodeDto {
  @IsString()
  token: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
