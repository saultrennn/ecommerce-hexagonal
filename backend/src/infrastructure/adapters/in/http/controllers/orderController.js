import { useCases } from '../../../../config/container.js';

export const create = async (req, res) =>
  res.status(201).json(await useCases.createOrder.execute({
    requester: req.user, items: (req.body || {}).items,
  }));

export const list = async (req, res) =>
  res.json(await useCases.listOrders.execute({ requester: req.user }));

export const getById = async (req, res) =>
  res.json(await useCases.getOrder.execute({ id: Number(req.params.id), requester: req.user }));

export const updateStatus = async (req, res) =>
  res.json(await useCases.updateOrderStatus.execute({
    id: Number(req.params.id), status: (req.body || {}).status,
  }));

export const cancel = async (req, res) =>
  res.json(await useCases.cancelOrder.execute({ id: Number(req.params.id), requester: req.user }));
