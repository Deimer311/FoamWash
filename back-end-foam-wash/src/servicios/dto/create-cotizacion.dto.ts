import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCotizacionDto {
  @IsInt()
  Id_usuario: number;

  @IsOptional()
  @IsInt()
  Id_servicio?: number;

  @IsNumber()
  Precio_cotizado: number;

  @IsOptional()
  @IsInt()
  Cantidad?: number;

  @IsOptional()
  @IsString()
  Tamaño?: string;
}