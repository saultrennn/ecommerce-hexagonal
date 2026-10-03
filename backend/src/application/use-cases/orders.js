import { Order } from '../../domain/entities/Order.js';
import { ForbiddenError, NotFoundError } from '../../domain/errors/DomainError.js';

const isManager = (requester) => requester.role === 'admin' || requester.role === 'order_manager';

function assertOwnerOrManager(requester, order) {
  if (!isManager(requester) && Number(requester.id) !== Number(order.userId)) {
    throw new ForbiddenError();
  }
}

export class CreateOrder {
  constructor({ orderRepository, productRepository, userRepository, notificationService }) {
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
    this.userRepository = userRepository;
    this.notificationService = notificationService;
  }

  // El pedido ya está guardado: un fallo al notificar no debe revertirlo ni romper la respuesta.
  async notify(order, requesterId) {
    try {
      const customer = await this.userRepository.findById(requesterId);
      if (!customer) return;
      const results = await Promise.allSettled([
        this.notificationService.sendOrderReceipt(order, customer),
        this.notificationService.notifyAdminNewOrder(order, customer),
      ]);
      results.forEach((r) => {
        if (r.status === 'rejected') {
          console.error(`[notificaciones] pedido #${order.id}:`, r.reason?.message || r.reason);
        }
      });
    } catch (err) {
      console.error(`[notificaciones] pedido #${order.id}:`, err.message);
    }
  }

  async execute({ requester, items }) {
    const ids = [...new Set((items || []).map((i) => Number(i.productId)).filter(Number.isInteger))];
    const found = await this.productRepository.findByIds(ids);
    const products = new Map(found.map((p) => [p.id, p]));
    const order = Order.create({ userId: requester.id, lines: items, products });
    const created = await this.orderRepository.create(order);
    this.notify(created, requester.id); // sin await: no retrasa la respuesta
    return created;
  }
}

export class ListOrders {
  constructor({ orderRepository }) { this.orderRepository = orderRepository; }
  async execute({ requester }) {
    return isManager(requester)
      ? this.orderRepository.findAll()
      : this.orderRepository.findByUserId(requester.id);
  }
}

export class GetOrder {
  constructor({ orderRepository }) { this.orderRepository = orderRepository; }
  async execute({ id, requester }) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundError('Pedido no encontrado');
    assertOwnerOrManager(requester, order);
    return order;
  }
}

export class UpdateOrderStatus {
  constructor({ orderRepository }) { this.orderRepository = orderRepository; }
  async execute({ id, status }) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundError('Pedido no encontrado');
    if (status === 'cancelled') {
      order.cancel();
      await this.orderRepository.cancel(order);
    } else {
      order.changeStatus(status);
      await this.orderRepository.updateStatus(order.id, order.status);
    }
    return this.orderRepository.findById(id);
  }
}

export class CancelOrder {
  constructor({ orderRepository }) { this.orderRepository = orderRepository; }
  async execute({ id, requester }) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundError('Pedido no encontrado');
    assertOwnerOrManager(requester, order);
    order.cancel();
    await this.orderRepository.cancel(order);
    return this.orderRepository.findById(id);
  }
}
