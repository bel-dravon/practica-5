import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Nombre del usuario', required: false })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Email del usuario', required: false })
  email?: string;
}
