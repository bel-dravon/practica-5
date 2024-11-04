import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

describe('Users Integration (UsersService)', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: '',
          database: 'users_test',
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();
    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    const connection = repository.manager.connection;
    if (connection.isInitialized) {
      await connection.destroy();
    }
  });

  it('Debería crear un nuevo usuario en la base de datos', async () => {
    await repository.query('DELETE FROM user;');
    const nuevoUser = {
      name: 'Usuario de prueba',
      email: 'EmailPrueba@gmail.com',
      password: 'Password de prueba',
    };

    const userCreado = await service.create(nuevoUser);
    expect(userCreado).toHaveProperty('id');
    expect(userCreado.name).toEqual(nuevoUser.name);
    expect(userCreado.email).toEqual(nuevoUser.email);
    expect(userCreado.password).toEqual(nuevoUser.password);

    const userEnBaseDatos = await repository.findOneBy({ id: userCreado.id });
    expect(userEnBaseDatos).toBeDefined();
    expect(userEnBaseDatos.name).toEqual(nuevoUser.name);
    expect(userEnBaseDatos.email).toEqual(nuevoUser.email);
    expect(userEnBaseDatos.password).toEqual(nuevoUser.password);
  });

  it('Debería lanzar BadRequestException si el email ya existe', async () => {
    await repository.query('DELETE FROM user;');
    const existingUser = {
      name: 'Usuario Existente',
      email: 'test@email.com',
      password: 'password123',
    };

    await service.create(existingUser);
    try {
      await service.create({
        name: 'Test user',
        email: 'test@example.com',
        password: 'Test password',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(`Email already exists`);
      expect(error.getStatus()).toBe(400);
    }
  });

  it('Debería mostrar los usuarios en la base de datos', async () => {
    await repository.query('DELETE FROM user;');
    await repository.save([
      { name: 'User 1', email: 'Email1@gmail.com', password: 'Password 1' },
      { name: 'User 2', email: 'Email2@gmail.com', password: 'Password 2' },
    ]);

    const users = await service.findAll();
    expect(users.length).toBe(2);
    expect(users[0].name).toBe('User 1');
    expect(users[1].name).toBe('User 2');
  });

  it('Debería lanzar NotFoundException al no encontrar un usuario por ID', async () => {
    const userInexistente = 999;
    try {
      await service.findOne(userInexistente);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe(`User not found`);
    }
  });

  it('Debería actualizar un usuario existente', async () => {
    await repository.query('DELETE FROM user;');

    const nuevoUser = await repository.save({
      name: 'Usuario antes de Actualizar',
      email: 'Email antes de Actualizar',
      password: 'Password',
    });

    const userActualizado = await service.update(nuevoUser.id, {
      name: 'Usuario Actualizado',
      email: 'Email Actualizado',
    });

    expect(userActualizado).toBeDefined();
    expect(userActualizado.name).toEqual('Usuario Actualizado');
    expect(userActualizado.email).toEqual('Email Actualizado');

    const usersEnBaseDatos = await repository.findOneBy({ id: userActualizado.id });
    expect(usersEnBaseDatos).toBeDefined();
    expect(usersEnBaseDatos.name).toEqual(userActualizado.name);
    expect(usersEnBaseDatos.email).toEqual(userActualizado.email);
  });

  it('Debería lanzar BadRequestException si el email ya existe', async () => {
    await repository.save([
      { name: 'User 1', email: 'Email1@gmail.com', password: 'Password 1' },
      { name: 'User 2', email: 'Email2@gmail.com', password: 'Password 2' },
    ]);
    try {
      await service.create({
        name: 'Test user',
        email: 'Email2@gmail.com',
        password: 'Test password',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(`Email already exists`);
      expect(error.getStatus()).toBe(400);
    }
  });

  it('Debería lanzar NotFoundException al no encontrar un usuario para modificar', async () => {
    const userInexistente = 999;
    try {
      await service.update(userInexistente, {
        name: 'User Actualizado',
        email: 'Email Actualizado',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe(`User not found`);
    }
  });

  it('Debería eliminar un usuario existente', async () => {
    await repository.query('DELETE FROM user;');
    const nuevaUser = await repository.save({
      name: 'Usuario para Eliminar',
      email: 'Contenido para Eliminar',
      password: 'Password para eliminar',
    });

    try {
      await service.remove(nuevaUser.id);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.OK);
      expect(error.message).toBe(`User deleted successfully`);
    }

    const userEliminado = await repository.findOneBy({ id: nuevaUser.id });
    expect(userEliminado).toBe(null);
  });

  it('Debería lanzar NotFoundException al no encontrar un usuario para eliminar', async () => {
    const userInexistente = 999;
    try {
      await service.remove(userInexistente);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe(`User not found`);
    }
  });
});
