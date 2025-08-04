import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBody({
    description: 'User signup payload',
    type: AuthDto,
    examples: {
      default: {
        summary: 'Signup Example',
        value: {
          email: 'user@example.com',
          password: 'StrongPassword123',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @ApiBody({
    description: 'User login payload',
    type: AuthDto,
    examples: {
      default: {
        summary: 'Login Example',
        value: {
          email: 'user@example.com',
          password: 'StrongPassword123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns JWT access token',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  login(@Body() dto: AuthDto) {
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email and password are required');
    }
    return this.authService.login(dto);
  }
}
