import { IsNotEmpty, IsString } from 'class-validator';

export class CommandDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
