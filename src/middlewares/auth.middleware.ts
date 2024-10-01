import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { errorConstants, genericConstants } from '../constants/index.constant';
import { UserRequest } from '../interfaces/user.interface';
import logger from '../utils/logger.utility';
import { HttpStatusCode } from '../enums/status-code.enum';
import { UserRole } from '../enums/user.enum';

const errorMessages = errorConstants.messages;

interface DecodedToken extends JwtPayload {
  id: string;
  role: UserRole;
}

const authMiddleware = (
  req: UserRequest,
  res: Response,
  next: NextFunction
): any => {
  const token = req
    .header(genericConstants.authHeaderKey)
    ?.replace(genericConstants.bearerTokenKey, '')
    .trim();

  if (!token)
    return res
      .status(HttpStatusCode.Unauthorized)
      .json({ message: errorMessages.noTokenFound });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY!
    ) as DecodedToken;
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err: any) {
    logger.error({
      apiMethod: 'middleware/auth',
      data: err.stack,
      message: 'Error in auth middleware',
    });
    next(err);
  }
};

const authorize =
  (...roles: UserRole[]) =>
  (req: UserRequest, res: Response, next: NextFunction): any => {
    if (!roles.includes(req.user?.role!)) {
      return res
        .status(HttpStatusCode.Forbidden)
        .json({ message: errorMessages.notAuthorizedForAction });
    }
    next();
  };

export { authMiddleware, authorize };
