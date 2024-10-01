import { User } from '../interfaces/user.interface';
import jwt from 'jsonwebtoken';

/**
 * Function to handle token generation
 **/
export const generateToken = (user: User) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET_KEY!, {
    expiresIn: '1h',
  });
};
