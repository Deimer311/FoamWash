import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateNotificacionDto {
  @IsString()
  @IsNotEmpty()
  descripcion_notificacion: string;

  @IsInt()
  usuario_Id_Usuario: number;
}