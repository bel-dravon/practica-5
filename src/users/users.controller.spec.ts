import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockUser = { id: 1, name: 'Test user', email: 'test@example.com', password: 'Test password' };

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockUser),
            findAll: jest.fn().mockResolvedValue([mockUser]),
            findByTitle: jest.fn().mockResolvedValue([mockUser]),
            findOne: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue(mockUser),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Test user',
      email: 'test@example.com',
      password: 'Test password',
    };

    const result = await controller.create(createUserDto);
    expect(result).toEqual(mockUser);
    expect(service.create).toHaveBeenCalledWith(createUserDto);
  });

  it('should throw BadRequestException if the user is not found', async () => {
    jest.spyOn(service, 'findOne').mockRejectedValue(new BadRequestException());
    await expect(controller.findOne('999')).rejects.toThrow(BadRequestException);
  });

  it('should find all user', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockUser]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should find a user by ID', async () => {
    const result = await controller.findOne('1');
    expect(result).toEqual(mockUser);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when user is not found', async () => {
    jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
    await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
  });

  it('should update a user', async () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
    };

    const result = await controller.update('1', updateUserDto);
    expect(result).toEqual(mockUser);
    expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
  });

  it('should throw BadRequestException if the user is not found', async () => {
    jest.spyOn(service, 'findOne').mockRejectedValue(new BadRequestException());
    await expect(controller.findOne('999')).rejects.toThrow(BadRequestException);
  });

  it('should delete a user', async () => {
    const result = await controller.remove('1');
    expect(result).toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when deleting a non-existing user', async () => {
    jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());
    await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
  });
});
