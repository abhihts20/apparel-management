import request from 'supertest';
import { app } from '../index';
import * as dataUtils from '../utils/data-file.utility';
import jwt from 'jsonwebtoken';
import { UserRole } from '../enums/user.enum';

jest.mock('../utils/data-file.utility');
jest.mock('jsonwebtoken');

describe('Inventory Service - Create Inventory', () => {
    const vendorPayload = { id: 'vendorUserId', role: UserRole.VENDOR, email: 'vendor@example.com' };
    
    beforeEach(() => {
        const secretKey = process.env.JWT_SECRET_KEY!;
        const token = jwt.sign(vendorPayload, secretKey, { expiresIn: '1h' });
        
        (jwt.verify as jest.Mock).mockReturnValue(vendorPayload);
        
        (dataUtils.writeData as jest.Mock).mockImplementation(() => {
            return Promise.resolve(true);
        });
        
    });

    it('should create a new inventory item with vendor token', async () => {
        const newItem = {
            size: 'M',
            quantity: 10,
            price: 99.99,
            code: 'P1',
            title: 'Sample product',
            description: 'Desc'
        };

        const secretKey = process.env.JWT_SECRET_KEY!;
        const vendorToken = jwt.sign(vendorPayload, secretKey, { expiresIn: '1h' });
        (dataUtils.readData as jest.Mock).mockReturnValueOnce({ inventory: [] });

        const response = await request(app)
            .post('/api/inventory')
            .set('Authorization', `Bearer ${vendorToken}`)
            .send(newItem);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Apparel created');
    });

    it('should not allow inventory creation without a valid vendor token', async () => {
        const newItem = {
            quantity: 10,
            price: 99.99,
            code: 'P1',
            title: 'Sample product',
            description: 'Desc',
            size:'M'
        };

        const response = await request(app)
            .post('/api/inventory')
            .send(newItem);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('No Token Found!');
    });
});
