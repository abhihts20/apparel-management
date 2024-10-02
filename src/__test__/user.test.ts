import request from 'supertest';
import { app } from '../index';
import * as dataUtils from '../utils/data-file.utility';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/auth.utility';
import http from 'http';
import jwt from 'jsonwebtoken';
import { User } from '../interfaces/user.interface';
import { UserRole } from '../enums/user.enum';

jest.mock('../utils/data-file.utility');
jest.mock('../utils/auth.utility');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
const mockPayload: User = {
  id: 'mockUserId',
  role: UserRole.ADMIN,
  email: 'mock@gmail.com',
  password: 'adminpassword',
  name: 'User',
};

beforeEach(() => {
  
  (jwt.verify as jest.Mock).mockImplementation((token, secret) => {
    return { id: 'mockUserId', role: UserRole.ADMIN, email: 'admin@example.com' };
  });
});
describe('Auth Service - Login and User registeration', () => {
  it('should login successfully with valid credentials', async () => {
    const mockUser = {
      email: 'testuser@example.com',
      password: 'hashedPassword',
    };
    (dataUtils.readData as jest.Mock).mockReturnValue({ users: [mockUser] });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (generateToken as jest.Mock).mockReturnValue('mockToken');

    const response = await request(app).post('/api/auth/login').send({
      email: 'testuser@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login Successful!');
    expect(response.body.data.token).toBe('mockToken');
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'password123',
      'hashedPassword'
    );
  });

  it('should throw error with invalid credentials', async () => {
    const mockUser = {
      email: 'testuser@example.com',
      password: 'hashedPasswordff',
    };
    (dataUtils.readData as jest.Mock).mockReturnValue({ users: [mockUser] });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    (generateToken as jest.Mock).mockReturnValue('mockToken');

    const response = await request(app).post('/api/auth/login').send({
      email: 'testuser@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid email or password');
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'password123',
      'hashedPassword'
    );
  });

  it('should test for invalid email', async () => {
    const newUser = {
      name: 'New User',
      email: 'newuser',
      password: 'password123',
      role: 'user',
    };
    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('"email" must be a valid email');
  });

  it('should test if user already exists', async () => {
    const mockUser = {
      email: 'testuser@example.com',
      password: 'hashedPasswordff',
      name: 'Sample user',
      role: 'vendor',
    };
    (dataUtils.readData as jest.Mock).mockReturnValue({ users: [mockUser] });

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const token = generateToken(mockPayload);

    const response = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Another User',
        email: 'testuser@example.com',
        password: 'password123',
        role: 'vendor',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email already exists');
  });

  it('should register a new user successfully with admin token', async () => {
    const newUser = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
      role: 'user',
    };

    const mockAdminPayload = {
      id: 'adminUserId',
      role: UserRole.ADMIN,
      email: 'admin@example.com',
    };

    (dataUtils.readData as jest.Mock).mockReturnValue({ users: [] });
    
    (dataUtils.writeData as jest.Mock).mockImplementation(() => {
        return Promise.resolve(true);
    });
    
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

   
    (jwt.verify as jest.Mock).mockReturnValue(mockAdminPayload); 

    // Generate a mock admin token
    const secretKey = process.env.JWT_SECRET_KEY!;
    const adminToken = jwt.sign(mockAdminPayload, secretKey, { expiresIn: '1h' });

    // Send request with Authorization header (admin token)
    const response = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`) // Admin token
      .send(newUser); // Send the new user data

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Registration Successful!');
    expect(response.body.data.email).toBe(newUser.email);
    expect(response.body.data.token).toBeDefined(); // Ensure a token is generated
});

});
