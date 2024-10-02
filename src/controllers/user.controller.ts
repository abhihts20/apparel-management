import bcrypt from 'bcryptjs';
import { User } from '../interfaces/user.interface';
import { readData, writeData } from '../utils/data-file.utility';
import { v4 as uuidv4 } from 'uuid';
import { errorConstants } from '../constants/index.constant';
import { generateToken } from '../utils/auth.utility';
import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger.utility';
import { HttpStatusCode } from '../enums/status-code.enum';

const errorMessages = errorConstants.messages;

/**
 * @description Function to handler user registration
 * only admin can register a vendor/user for now
 */
const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { name, email, password, role } = req.body;
  try {
    const fileData = readData();

    const isUserAlreadyExists = fileData?.users.find(
      (el) => el.email === email
    );
    if (isUserAlreadyExists) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: errorMessages.emailAlreadyExists });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      password: hashPassword,
      role,
    };

    fileData?.users.push(newUser);
    writeData(fileData);

    return res.status(HttpStatusCode.Created).json({
      message: 'Registration Successful!',
      data: { name, email, token: generateToken(newUser) },
    });
  } catch (err: any) {
    logger.error({
      apiMethod: 'controller/user/register',
      message: 'Error in main handler',
      data: err.stack,
    });
    next(err);
  }
};

/**
 * @description Function to handler user login
 * Once application starts , admin login creds will be seeded into the data file
 * One can use those credentials to register new vendors or users
 */
const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { email, password } = req.body;
    const fileData = readData();
    const currUserByEmail = fileData?.users.find(
      ({ email: emailInData }: User) => emailInData === email
    );
    if (
      !currUserByEmail ||
      !(await bcrypt.compare(password, currUserByEmail.password))
    ) {
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: errorMessages.invalidCredentials });
    }

    const token = generateToken(currUserByEmail);

    return res
      .status(HttpStatusCode.OK)
      .json({ message: 'Login Successful!', data: { token, email } });
  } catch (err: any) {
    logger.error({
      apiMethod: 'controller/user/login',
      message: 'Error in main handler',
      data: err.stack,
    });
    next(err);
  }
};

export { login, register };
