import Joi from 'joi';
import { UserRole } from '../enums/user.enum';

export const userRegisterSchema = Joi.object({
    name: Joi.string().required().min(3).max(40),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    role: Joi.string().required().valid(...Object.values(UserRole))
});

export const userLoginSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6)
});