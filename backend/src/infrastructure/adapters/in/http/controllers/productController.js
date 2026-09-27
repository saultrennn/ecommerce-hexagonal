import { useCases } from '../../../../config/container.js';

export const list = async (_req, res) => res.json(await useCases.listProducts.execute());

export const getById = async (req, res) =>
  res.json(await useCases.getProduct.execute({ id: Number(req.params.id) }));

export const create = async (req, res) =>
  res.status(201).json(await useCases.createProduct.execute(req.body || {}));

export const update = async (req, res) =>
  res.json(await useCases.updateProduct.execute({ id: Number(req.params.id), data: req.body || {} }));

export const remove = async (req, res) => {
  await useCases.deleteProduct.execute({ id: Number(req.params.id) });
  res.status(204).send();
};
