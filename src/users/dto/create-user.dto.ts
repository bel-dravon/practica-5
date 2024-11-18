import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'The name is required' })
  @ApiProperty({ description: 'Nombre del usuario' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'The email is required' })
  @ApiProperty({ description: 'Email del usuario' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'The password is required' })
  @ApiProperty({ description: 'Contraseña para el usuarioss' })
  password: string;
}
