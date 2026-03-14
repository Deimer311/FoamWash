import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsInt } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  Nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  @IsOptional()
  Telefono?: string;

  @IsString()
  @IsOptional()
  N_Documento?: string;

  @IsInt()
  @IsOptional()
  rol_Id_Rol?: number; // Por defecto será 3 (Cliente)
}