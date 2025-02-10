// routes/index.ts
import { UserController } from "../controllers/userController";
import { AdminController } from "../controllers/adminController";
import {authenticateUser, authenticateAdmin} from '../middleware/auth'
import {validateUserLogin} from '../middleware/userAuth'
import { validateAdminLogin } from "../middleware/adminAuth";

const exp = require('express');

const router = exp.Router();

console.log(UserController.register);

// User routes
router.post('/register', UserController.register);
router.post('/login', validateUserLogin, UserController.login);
router.get('/slots', authenticateUser, UserController.getAvailableSlots);
router.post('/slots/register', authenticateUser, UserController.registerSlot);
router.put('/slots/update', authenticateUser, UserController.updateSlot);

// Admin routes
router.post('/admin/login', validateAdminLogin, AdminController.login);
router.get('/admin/users', authenticateAdmin, AdminController.getUsers);
router.get('/admin/slots', authenticateAdmin, AdminController.getSlotRegistrations);

module.exports = router