const request = require('supertest');
const jwt = require('jsonwebtoken');
const fs = require('fs/promises');
require('dotenv').config();

const { User, newUser } = require('../model/__mocks__/data');
const app = require('../app');

const SECRET_KEY = process.env.JWT_SECRET;
const issueToken = (payload, secret) => jwt.sign(payload, secret);
// generate valid token for user
const token = issueToken({ id: User._id }, SECRET_KEY);
User.token = token;

// let newToken = '';

jest.mock('../model/users.js');
jest.mock('../model/contacts.js');
jest.mock('cloudinary');

describe('tests for the route api/users', () => {
  describe('Test for register and login', () => {
    it('should return 201 registration', async () => {
      const res = await request(app)
        .post(`/api/users/auth/register`)
        .send(newUser)
        .set('Accept', 'application/json');

      expect(res.status).toEqual(201);
      expect(res.body).toBeDefined();
    });

    it('should return 200 login', async () => {
      const res = await request(app)
        .post(`/api/users/auth/login`)
        .send(newUser)
        .set('Accept', 'application/json');

      // newToken = res.body.data.token;

      expect(res.status).toEqual(200);
      expect(res.body).toBeDefined();
    });
  });

  describe('tests for the route api/users/avatars', () => {
    it('should receive status 401 with invalid token in patch request', async () => {
      const buffer = await fs.readFile('./test/default.jpg');
      const res = await request(app)
        .patch('/api/users/avatars')
        .set('Authorization', `Bearer abc123`)
        .attach('avatar', buffer, 'default.jpg');

      expect(res.body.code).toEqual(401);
      expect(res.body).toBeDefined();
    });

    it('should receive status 200, updated avatarUrl and correct body with valid token', async () => {
      const buffer = await fs.readFile('./test/default.jpg');

      const res = await request(app)
        .patch('/api/users/avatars')
        .set('Authorization', `Bearer ${token}`)
        .attach('avatar', buffer, 'default.jpg');

      expect(res.status).toEqual(200);
      expect(res.body).toBeDefined();
      expect(res.body.data).toHaveProperty('avatarURL');
    });
  });
});
