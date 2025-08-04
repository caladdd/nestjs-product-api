import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @IsEmail()
  @ApiProperty({ example: 'admin@example.com' })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'password123' })
  password: string;
}
