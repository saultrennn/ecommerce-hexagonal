// Único lugar donde se "conectan" los adaptadores con los casos de uso.
import { PostgresUserRepository } from '../adapters/out/persistence/PostgresUserRepository.js';
import { PostgresProductRepository } from '../adapters/out/persistence/PostgresProductRepository.js';
import { PostgresOrderRepository } from '../adapters/out/persistence/PostgresOrderRepository.js';
import { BcryptPasswordHasher } from '../adapters/out/security/BcryptPasswordHasher.js';
import { JwtTokenService } from '../adapters/out/security/JwtTokenService.js';
import { NodemailAdapter } from '../adapters/out/notifications/NodemailAdapter.js';
import { config } from './env.js';

import { RegisterUser, Login, ListUsers, GetUser, UpdateUser, DeleteUser } from '../../application/use-cases/users.js';
import { CreateProduct, ListProducts, GetProduct, UpdateProduct, DeleteProduct } from '../../application/use-cases/products.js';
import { CreateOrder, ListOrders, GetOrder, UpdateOrderStatus, CancelOrder } from '../../application/use-cases/orders.js';

const userRepository = new PostgresUserRepository();
const productRepository = new PostgresProductRepository();
const orderRepository = new PostgresOrderRepository();
const passwordHasher = new BcryptPasswordHasher();
const notificationService = new NodemailAdapter(config.mail);
export const tokenService = new JwtTokenService();

export const useCases = {
  registerUser: new RegisterUser({ userRepository, passwordHasher }),
  login: new Login({ userRepository, passwordHasher, tokenService }),
  listUsers: new ListUsers({ userRepository }),
  getUser: new GetUser({ userRepository }),
  updateUser: new UpdateUser({ userRepository, passwordHasher }),
  deleteUser: new DeleteUser({ userRepository }),

  createProduct: new CreateProduct({ productRepository }),
  listProducts: new ListProducts({ productRepository }),
  getProduct: new GetProduct({ productRepository }),
  updateProduct: new UpdateProduct({ productRepository }),
  deleteProduct: new DeleteProduct({ productRepository }),

  createOrder: new CreateOrder({ orderRepository, productRepository, userRepository, notificationService }),
  listOrders: new ListOrders({ orderRepository }),
  getOrder: new GetOrder({ orderRepository }),
  updateOrderStatus: new UpdateOrderStatus({ orderRepository }),
  cancelOrder: new CancelOrder({ orderRepository }),
};
