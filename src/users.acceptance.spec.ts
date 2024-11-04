import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import * as request from 'supertest';

import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { CreateUserDto } from './users/dto/create-user.dto';
import { UpdateUserDto } from './users/dto/update.user.dto';

describe('users Acceptance', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;

  beforeAll(async () => {
    const moduledFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
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
      ],
    }).compile();
    app = moduledFixture.createNestApplication();
    usersRepository = moduledFixture.get<Repository<User>>(getRepositoryToken(User));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /* afterEach(async () => {
    await usersRepository.query('DELETE FORM user');
  }); */

  it('Debería craer un usuario y retornar la respuesta', async () => {
    const nuevoUser: CreateUserDto = {
      name: 'Usuario de prueba',
      email: 'EmailPrueba@gmail.com',
      password: 'Password de prueba',
    };
    const respuestaCrear = await request(app.getHttpServer()).post('/users').send(nuevoUser);
    expect(respuestaCrear.status).toBe(201);
    expect(respuestaCrear.body.name).toEqual(nuevoUser.name);
    expect(respuestaCrear.body.email).toEqual(nuevoUser.email);
    expect(respuestaCrear.body.password).toEqual(nuevoUser.password);
  });

  it('Debería lanzar BadRequestException si el email ya existe', async () => {
    const nuevoUser: CreateUserDto = {
      name: 'Usuario de prueba',
      email: 'EmailPrueba@gmail.com',
      password: 'Password de prueba',
    };
    const respuestaCrear = await request(app.getHttpServer()).post('/users').send(nuevoUser);
    expect(respuestaCrear.status).toBe(400);
    expect(respuestaCrear.body.message).toEqual('Email already exists');
  });

  it('Debería obtener todos los usuarios', async () => {
    const respuestaObtener = await request(app.getHttpServer()).get('/users');
    expect(respuestaObtener.status).toBe(200);
    expect(Array.isArray(respuestaObtener.body)).toBeTruthy();
  });

  it('Debería obtener un usuario por su ID', async () => {
    const nuevoUser = await usersRepository.save({
      name: 'Usuario de ejemplo',
      email: 'EmailEjemplo@gmail.com',
      password: 'Password de ejemplo',
    });
    const respuestaBuscar = await request(app.getHttpServer()).get(`/users/${nuevoUser.id}`);
    expect(respuestaBuscar.status).toBe(200);
    expect(respuestaBuscar.body.name).toEqual(nuevoUser.name);
    expect(respuestaBuscar.body.email).toEqual(nuevoUser.email);
    expect(respuestaBuscar.body.password).toEqual(nuevoUser.password);
  });

  it('Debería lanzar NotFoundException al no encontrar un usuario por ID', async () => {
    const userInexistente = 999;
    const respuestaBuscar = await request(app.getHttpServer()).get(`/users/${userInexistente}`);
    expect(respuestaBuscar.status).toBe(404);
    expect(respuestaBuscar.body.message).toEqual(`User not found`);
  });

  it('Debería actualizar el usuario existente', async () => {
    const nuevoUser = await usersRepository.save({
      name: 'Usuario para Actualizar',
      email: 'EmailActualizar@gmail.com',
      password: 'Password para Actualizar',
    });

    const userActualizado: UpdateUserDto = {
      name: 'Usuario Actualizado',
      email: 'EmailActualizado@gmail.com',
    };

    const respuestaObtener = await request(app.getHttpServer())
      .put(`/users/${nuevoUser.id}`)
      .send(userActualizado);
    expect(respuestaObtener.status).toBe(200);
    expect(respuestaObtener.body.name).toEqual(userActualizado.name);
    expect(respuestaObtener.body.email).toEqual(userActualizado.email);
  });

  it('Debería lanzar BadRequestException si el email ya existe al actualizar', async () => {
    const usuarioParaActualizar = await usersRepository.save({
      name: 'Usuario para Actualizar',
      email: 'email_actualizar@gmail.com',
      password: 'Password2',
    });

    const userActualizado: UpdateUserDto = {
      name: 'Usuario Actualizado',
      email: 'email_existente@gmail.com',
    };

    const respuestaActualizar = await request(app.getHttpServer())
      .put(`/users/${usuarioParaActualizar.id}`)
      .send(userActualizado);

    expect(respuestaActualizar.status).toBe(400);
    expect(respuestaActualizar.body.message).toEqual('Email already exists');
  });

  it('Debería lanzar NotFoundException al no encontrar un usuario para modificar', async () => {
    const userInexistente = 999;
    const userActualizada: UpdateUserDto = {
      name: 'Usuario Actualizado',
      email: 'email_existente@gmail.com',
    };
    const respuestaBuscar = await request(app.getHttpServer())
      .put(`/users/${userInexistente}`)
      .send(userActualizada);
    expect(respuestaBuscar.status).toBe(404);
    expect(respuestaBuscar.body.message).toEqual(`User not found`);
  });

  it('Debería eliminar el usuario existente', async () => {
    const nuevaUser = await usersRepository.save({
      name: 'User para eliminar',
      email: 'email_eliminar@gmail.com',
      password: 'Password para eliminar',
    });

    const respuestaObtener = await request(app.getHttpServer()).delete(`/users/${nuevaUser.id}`);
    expect(respuestaObtener.status).toBe(200);
    expect(respuestaObtener.body.message).toEqual(`User deleted successfully`);
  });

  it('Debería lanzar NotFoundException al no encontrar una user para eliminar', async () => {
    const userInexistente = 999;
    const respuestaBuscar = await request(app.getHttpServer()).delete(`/users/${userInexistente}`);
    expect(respuestaBuscar.status).toBe(404);
    expect(respuestaBuscar.body.message).toEqual(`User not found`);
  });
});
