import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';

describe('Auth Endpoints', () => {
  let user: any;
  const testUserCredentials = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  };

  beforeAll(async () => {
    // Clean up previous test runs to ensure a clean state
    await prisma.user.deleteMany({ where: { email: testUserCredentials.email } });
    
    // Create a user for testing via the API
    const res = await request(app)
      .post('/auth/register')
      .send(testUserCredentials);
    
    expect(res.statusCode).toEqual(201);
    user = res.body; // Save the created user for other tests
  });

  afterAll(async () => {
    // Clean up the test user and related tokens after all tests
    if (user && user.id) {
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    await prisma.$disconnect();
  });

  it('should not register a user with an existing email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send(testUserCredentials); // Try to register the same user again

    expect(res.statusCode).toEqual(409);
    expect(res.body.error).toEqual("Email already in use");
  });

  it('should login a user and return tokens', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: testUserCredentials.email,
        password: testUserCredentials.password,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should not login with invalid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: testUserCredentials.email,
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
  });

  it('should refresh the access token', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: testUserCredentials.email,
        password: testUserCredentials.password,
      });

    const cookieHeader = loginRes.headers['set-cookie'];
    const cookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader].filter(c => c);
    const refreshTokenCookie = cookies.find((cookie: string) => cookie.startsWith('refreshToken'));
    expect(refreshTokenCookie).toBeDefined();
    const refreshToken = refreshTokenCookie!.split(';')[0].split('=')[1];

    const res = await request(app)
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should logout a user', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: testUserCredentials.email,
        password: testUserCredentials.password,
      });

    const cookieHeader = loginRes.headers['set-cookie'];
    const cookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader].filter(c => c);
    const refreshTokenCookie = cookies.find((cookie: string) => cookie.startsWith('refreshToken'));
    expect(refreshTokenCookie).toBeDefined();
    const refreshToken = refreshTokenCookie!.split(';')[0].split('=')[1];

    const res = await request(app)
      .post('/auth/logout')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Logged out successfully');
  });
});
