import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/config/prisma.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await prismaService.refreshToken.deleteMany({});
    await prismaService.session.deleteMany({});
    await prismaService.user.deleteMany({});

    // Create regular user
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'user@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    });

    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'password123',
      });

    accessToken = userLoginResponse.body.data.accessToken;

    // Create admin user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _adminUser = await prismaService.user.create({
      data: {
        email: 'admin@example.com',
        password:
          '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    });

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });

    adminToken = adminLoginResponse.body.data.accessToken;
  });

  describe('/users (GET)', () => {
    it('should get all users as admin', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('should return 403 for regular user', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  describe('/users/change-password (PUT)', () => {
    it('should change password successfully', () => {
      return request(app.getHttpServer())
        .put('/users/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
        })
        .expect(200)
        .expect(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.message).toBe('Password changed successfully');
        });
    });

    it('should return 401 for wrong current password', () => {
      return request(app.getHttpServer())
        .put('/users/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        })
        .expect(401);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .put('/users/change-password')
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
        })
        .expect(401);
    });
  });
});
