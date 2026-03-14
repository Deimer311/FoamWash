import { IsNotEmpty, IsString, IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreateReservaDto {
  @IsInt()
  Id_Usuario: number;

  @IsDateString()
  fecha: string;

  @IsString()
  Hora: string; // Se enviará como "14:30:00"

  @IsOptional()
  @IsString()
  Informacion_adicional?: string;

  @IsInt()
  observacion_Id_Observaciones: number;

  @IsOptional()
  @IsInt()
  empleado_Id_Usuario?: number;
}