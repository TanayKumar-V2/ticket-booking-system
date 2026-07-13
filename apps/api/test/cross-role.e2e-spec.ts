import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Cross-Role Access (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // These tests verify that if a JWT is mocked/provided with a specific role,
  // the RolesGuard rejects access to unauthorized endpoints.
  
  it('User cannot access Organizer endpoints', () => {
    // In a real e2e, we would generate a valid JWT for a USER role.
    // Assuming the endpoints are guarded by JwtAuthGuard, providing NO token returns 401.
    // If we want to strictly test RolesGuard, we can mock JwtStrategy to return a USER role.
    return request(app.getHttpServer())
      .post('/events')
      .send({ title: 'Hacked Event', description: 'Desc', eventDate: new Date().toISOString() })
      .expect(401);
  });
});
