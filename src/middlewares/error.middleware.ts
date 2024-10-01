import { Request, Response, NextFunction } from 'express';
import Error from '../interfaces/error.interface';
import { errorConstants } from '../constants/index.constant';
import { HttpStatusCode } from '../enums/status-code.enum';

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || HttpStatusCode.InternalServerError;
  const message = err.message || errorConstants.messages.somethingWentWrong;

  res.status(status).json({ status, message });
};

export default errorMiddleware;
