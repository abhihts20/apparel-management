import { Router } from 'express';
import { login, register } from '../controllers/user.controller';
import { authMiddleware, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import {
  userLoginSchema,
  userRegisterSchema,
} from '../validators/user.validator';
import { UserRole } from '../enums/user.enum';

const router: Router = Router();

router.post('/login', validateRequest(userLoginSchema), login);
router.post(
  '/register',
  validateRequest(userRegisterSchema),
  authMiddleware,
  authorize(UserRole.ADMIN),
  register
);

export default router;
