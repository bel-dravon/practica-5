import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, BadRequestException, NotFoundException } from '@nestjs/common';

const mockUserRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockUser = { id: 1, name: 'Test user', email: 'test@example.com', password: 'Test password' };

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<MockRepository<User>>(getRepositoryToken(User));
  });

  it('should create a user', async () => {
    jest.spyOn(repository, 'save').mockResolvedValue(mockUser as User);

    const result = await service.create({
      name: 'Test user',
      email: 'test@example.com',
      password: 'Test password',
    });

    expect(result).toEqual(mockUser);
    expect(repository.save).toHaveBeenCalled();
    expect(repository.create).toHaveBeenCalled();
  });

  it('should throw a BadRequestException if the email already exist', async () => {
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockUser as User);

    try {
      await service.create({
        name: 'Test user',
        email: 'test@example.com',
        password: 'Test password',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe('Email already exists');
      expect(error.getStatus()).toBe(400);
    }

    expect(repository.findOneBy).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('should retrieve all notes', async () => {
    const mockUser = [
      { id: 1, name: 'Test name', email: 'test@example.com' },
      { id: 2, name: 'Test name', email: 'test@example.com' },
    ];

    jest.spyOn(repository, 'find').mockResolvedValue(mockUser as User[]);

    const result = await service.findAll();
    expect(result).toEqual(mockUser);
    expect(repository.find).toHaveBeenCalled();
  });

  it('should retrieve a note by id', async () => {
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockUser as User);

    const result = await service.findOne(1);
    expect(result).toEqual(mockUser);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('should throw a NotFoundException id the user does not exist', async () => {
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

    try {
      await service.findOne(1);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('User not found');
      expect(error.getStatus()).toBe(404);
    }

    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('should update a user', async () => {
    const updateUser = { ...mockUser, name: 'Test user', email: 'test@example.com' };

    jest.spyOn(repository, 'update').mockResolvedValue({ affected: 1 } as any);
    jest.spyOn(repository, 'findOneBy').mockResolvedValue(updateUser as User);

    const result = await service.update(1, {
      name: 'Test user',
      email: 'test@example.com',
    });

    expect(result).toEqual(updateUser);
    expect(repository.update).toHaveBeenCalledWith(1, {
      name: 'Test user',
      email: 'test@example.com',
    });
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('should throw NotFoundException if the user to update does not exist', async () => {
    jest.spyOn(repository, 'update').mockResolvedValue({ affected: 0 } as any);

    try {
      await service.update(1, {
        name: 'Non-existing Note',
        email: 'Non-existing Content',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('User not found');
      expect(error.getStatus()).toBe(404);
    }

    expect(repository.update).toHaveBeenCalledWith(1, {
      name: 'Non-existing Note',
      email: 'Non-existing Content',
    });
  });

  it('should remove a user', async () => {
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);

    try {
      await service.remove(1);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe('User deleted successfully');
      expect(error.getStatus()).toBe(200);
    }

    expect(repository.delete).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if the user to remove does not exist', async () => {
    jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 0 } as any);

    try {
      await service.remove(1);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('User not found');
      expect(error.getStatus()).toBe(404);
    }

    expect(repository.delete).toHaveBeenCalledWith(1);
  });
});
