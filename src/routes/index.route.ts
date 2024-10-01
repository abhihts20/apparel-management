import { Router } from 'express';
import userRoutes from './user.route';
import inventoryRoutes from './inventory.route';

const router: Router = Router();

router.use('/auth', userRoutes);
router.use('/inventory', inventoryRoutes);

export default router;
