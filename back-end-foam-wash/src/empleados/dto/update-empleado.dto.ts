import { IsString, IsOptional } from 'class-validator';

export class UpdateEmpleadoDto {
  @IsString() @IsOptional()
  Nombre?: string;

  @IsString() @IsOptional()
  Telefono?: string;

  @IsString() @IsOptional()
  cargo?: string;

  @IsString() @IsOptional()
  especialidades?: string;
}