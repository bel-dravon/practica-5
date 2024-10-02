import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'The name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'The email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'The password is required' })
  password: string;
}
