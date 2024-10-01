import { Router } from 'express';
import {
  createInventory,
  updateInventory,
  getAllInventory,
  getAProductOnInventoryByProductCode,
  updateInventoryInBulk,
  checkForInventory,
  findMinimumPriceToFulfilOrder,
} from '../controllers/inventory.controller';
import { authMiddleware, authorize } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate-request.middleware';
import {
  apparelBulkUpdateSchema,
  apparelRegisterSchema,
  apparelUpdateSchema,
  checkForOrderFulfilmentSchema,
} from '../validators/inventory.validator';
import { UserRole } from '../enums/user.enum';

const router: Router = Router();

router.post(
  '/',
  validateRequest(apparelRegisterSchema),
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.VENDOR),
  createInventory
);
router.put(
  '/:code/:size',
  validateRequest(apparelUpdateSchema),
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.VENDOR),
  updateInventory
);
router.put(
  '/bulk',
  validateRequest(apparelBulkUpdateSchema),
  authMiddleware,
  authorize(UserRole.ADMIN, UserRole.VENDOR),
  updateInventoryInBulk
);
router.get('/', authMiddleware, getAllInventory);
router.get('/code/:code', authMiddleware, getAProductOnInventoryByProductCode);
router.post(
  '/checkForOrderFulfilment',
  validateRequest(checkForOrderFulfilmentSchema),
  authMiddleware,
  checkForInventory
);
router.post(
  '/minimumPriceForOrder',
  validateRequest(checkForOrderFulfilmentSchema),
  authMiddleware,
  findMinimumPriceToFulfilOrder
);

export default router;
