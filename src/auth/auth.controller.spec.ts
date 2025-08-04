import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should call authService.signup with dto and return result', async () => {
      const dto: AuthDto = { email: 'test@example.com', password: 'pass123' };
      const result = { id: 1, email: dto.email };
      mockAuthService.signup.mockResolvedValue(result);

      await expect(controller.signup(dto)).resolves.toEqual(result);
      expect(mockAuthService.signup).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call authService.login with dto and return result', async () => {
      const dto: AuthDto = { email: 'test@example.com', password: 'pass123' };
      const result = { access_token: 'jwt.token.here' };
      mockAuthService.login.mockResolvedValue(result);

      await expect(controller.login(dto)).resolves.toEqual(result);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException if email is missing', () => {
      const dto: AuthDto = { email: '', password: 'pass123' };
      expect(() => controller.login(dto)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is missing', () => {
      const dto: AuthDto = { email: 'test@example.com', password: '' };
      expect(() => controller.login(dto)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException if both email and password are missing', () => {
      const dto: AuthDto = { email: '', password: '' };
      expect(() => controller.login(dto)).toThrow(BadRequestException);
    });
  });
});
