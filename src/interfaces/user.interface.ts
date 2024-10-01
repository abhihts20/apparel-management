import { Request } from 'express';
import { UserRole } from '../enums/user.enum';

export interface UserRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
