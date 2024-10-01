import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { HttpStatusCode } from '../enums/status-code.enum';

export const validateRequest = (
  schema: Joi.ObjectSchema | Joi.ArraySchema
): any => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(HttpStatusCode.BadRequest).json({
        message: error.details.map((err) => err.message).join(', '),
      });
    }

    next();
  };
};
