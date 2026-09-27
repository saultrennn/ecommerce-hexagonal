import { Product } from '../../domain/entities/Product.js';
import { NotFoundError } from '../../domain/errors/DomainError.js';

export class CreateProduct {
  constructor({ productRepository }) { this.productRepository = productRepository; }
  async execute(data) {
    return this.productRepository.create(new Product(data));
  }
}

export class ListProducts {
  constructor({ productRepository }) { this.productRepository = productRepository; }
  async execute() { return this.productRepository.findAll(); }
}

export class GetProduct {
  constructor({ productRepository }) { this.productRepository = productRepository; }
  async execute({ id }) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundError('Producto no encontrado');
    return product;
  }
}

export class UpdateProduct {
  constructor({ productRepository }) { this.productRepository = productRepository; }
  async execute({ id, data }) {
    const current = await this.productRepository.findById(id);
    if (!current) throw new NotFoundError('Producto no encontrado');
    const updated = new Product({
      id: current.id,
      name: data.name ?? current.name,
      description: data.description ?? current.description,
      price: data.price ?? current.price,
      stock: data.stock ?? current.stock,
      createdAt: current.createdAt,
    });
    return this.productRepository.update(updated);
  }
}

export class DeleteProduct {
  constructor({ productRepository }) { this.productRepository = productRepository; }
  async execute({ id }) {
    const deleted = await this.productRepository.delete(id);
    if (!deleted) throw new NotFoundError('Producto no encontrado');
  }
}
