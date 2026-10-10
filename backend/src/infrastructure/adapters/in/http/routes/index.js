import { Router } from 'express';
import { asyncHandler as h } from '../middlewares/asyncHandler.js';
import { authenticate, requireRole } from '../middlewares/auth.js';
import * as auth from '../controllers/authController.js';
import * as users from '../controllers/userController.js';
import * as products from '../controllers/productController.js';
import * as orders from '../controllers/orderController.js';
import * as analytics from '../controllers/analyticsController.js';

const router = Router();
const admin = requireRole('admin');
const productAccess = requireRole('admin', 'product_manager');
const orderAccess = requireRole('admin', 'order_manager');

// Auth
router.post('/auth/register', h(auth.register));
router.post('/auth/login', h(auth.login));

// Usuarios (gestión de cuentas y roles: solo admin)
router.get('/users', authenticate, admin, h(users.list));
router.get('/users/:id', authenticate, h(users.getById));
router.put('/users/:id', authenticate, h(users.update));
router.delete('/users/:id', authenticate, admin, h(users.remove));

// Productos: catálogo público para leer, mutaciones solo admin y product_manager
router.get('/products', h(products.list));
router.get('/products/:id', h(products.getById));
router.post('/products', authenticate, productAccess, h(products.create));
router.put('/products/:id', authenticate, productAccess, h(products.update));
router.delete('/products/:id', authenticate, productAccess, h(products.remove));

// Pedidos: todo el módulo restringido a admin y order_manager
router.post('/orders', authenticate, orderAccess, h(orders.create));
router.get('/orders', authenticate, orderAccess, h(orders.list));
router.get('/orders/:id', authenticate, orderAccess, h(orders.getById));
router.put('/orders/:id/status', authenticate, orderAccess, h(orders.updateStatus));
router.delete('/orders/:id', authenticate, orderAccess, h(orders.cancel));

// Analítica: dashboard solo para admin
router.get('/analytics/dashboard', authenticate, admin, h(analytics.dashboard));

export default router;
