import { Router } from 'express';
import UserController from '../Controllers/User.controller.ts';
import authMiddleware from '../Middlewares/authMiddleware.ts';

const router = Router();

router.get('/', authMiddleware, UserController.getAllUsers);
router.post('/', UserController.createUser);
router.post('/login', UserController.login);
router.put('/send-friend-request', authMiddleware, UserController.sendFriendRequest);
router.put('/cancel-friend-request', authMiddleware, UserController.cancelFriendRequest);
//router.delete('/:id', authMiddleware, UserController.deleteUser);

export default router;