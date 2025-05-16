import { Router } from 'express';
import UserController from '../Controllers/User.controller.ts';
import authMiddleware from '../Middlewares/authMiddleware.ts';

const router = Router();

router.get('/', authMiddleware, UserController.getAllUsers);
router.post('/', UserController.createUser);
router.post('/login', UserController.login);
// router.delete('/:id', authMiddleware, UserController.deleteUser);

export default router;