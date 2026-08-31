const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock de la base de données
const mockDb = {
  query: jest.fn(),
};

// Mock des modules
jest.mock('../../src/db', () => mockDb);
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Import de l'app après les mocks
const app = require('../../src/server');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if email or password is missing', async () => {
      const response = await request(app).post('/api/auth/login').send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email et mot de passe requis.');
    });

    it('should return 401 if user not found', async () => {
      mockDb.query.mockResolvedValueOnce([[]]);

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Email ou mot de passe incorrect.');
    });

    it('should return 401 if password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      mockDb.query.mockResolvedValueOnce([
        [
          {
            id: 1,
            email: 'test@example.com',
            password: hashedPassword,
            role: 'utilisateur',
          },
        ],
      ]);
      bcrypt.compare.mockResolvedValueOnce(false);

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Email ou mot de passe incorrect.');
    });

    it('should return 200 and token if credentials are correct', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
        civility: 'M',
        prenom: 'John',
        nom: 'Doe',
        role: 'utilisateur',
      };

      mockDb.query.mockResolvedValueOnce([[mockUser]]);
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValueOnce('mock.jwt.token');

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'correctpassword',
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('mock.jwt.token');
      expect(response.body.user).toHaveProperty('id', 1);
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Tous les champs sont requis.');
    });

    it('should return 400 if email already exists', async () => {
      mockDb.query.mockResolvedValueOnce([[{ id: 1 }]]);

      const response = await request(app).post('/api/auth/register').send({
        civility: 'M',
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '1990-01-01',
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email déjà utilisé.');
    });

    it('should return 201 and create user if registration is successful', async () => {
      mockDb.query
        .mockResolvedValueOnce([[]]) // Email check
        .mockResolvedValueOnce([{ insertId: 1 }]) // Insert user
        .mockResolvedValueOnce([[{ id: 1, email: 'test@example.com' }]]); // Get user

      bcrypt.hash.mockResolvedValueOnce('hashedpassword');

      const response = await request(app).post('/api/auth/register').send({
        civility: 'M',
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '1990-01-01',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Utilisateur créé avec succès 🎉');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });
  });
});
