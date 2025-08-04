import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let jwtService: JwtService;

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    jwtService = {
      sign: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should create a user if email does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass');
      userRepo.create.mockReturnValue({
        email: 'test@mail.com',
        password: 'hashedpass',
        id: '',
      });
      userRepo.save.mockResolvedValue({
        id: '',
        email: 'test@mail.com',
        password: 'hashedpass',
      });

      const dto: AuthDto = { email: 'test@mail.com', password: 'pass' };
      const result = await service.signup(dto);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(userRepo.create).toHaveBeenCalledWith({
        email: dto.email,
        password: 'hashedpass',
      });
      expect(userRepo.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'User created' });
    });

    it('should throw ConflictException if email exists', async () => {
      userRepo.findOne.mockResolvedValue({
        id: '',
        email: 'test@mail.com',
        password: 'hashed',
      });

      const dto: AuthDto = { email: 'test@mail.com', password: 'pass' };
      await expect(service.signup(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return access_token if credentials are valid', async () => {
      const user = { id: '', email: 'test@mail.com', password: 'hashedpass' };
      userRepo.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('jwt-token');

      const dto: AuthDto = { email: 'test@mail.com', password: 'pass' };
      const result = await service.login(dto);

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: user.id,
        email: user.email,
      });
      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const dto: AuthDto = { email: 'notfound@mail.com', password: 'pass' };
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const user = { id: '', email: 'test@mail.com', password: 'hashedpass' };
      userRepo.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const dto: AuthDto = { email: 'test@mail.com', password: 'wrongpass' };
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
