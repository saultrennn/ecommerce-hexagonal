import { useCases } from '../../../../config/container.js';

export const list = async (_req, res) => res.json(await useCases.listUsers.execute());

export const getById = async (req, res) =>
  res.json(await useCases.getUser.execute({ id: Number(req.params.id), requester: req.user }));

export const update = async (req, res) =>
  res.json(await useCases.updateUser.execute({
    id: Number(req.params.id), requester: req.user, data: req.body || {},
  }));

export const remove = async (req, res) => {
  await useCases.deleteUser.execute({ id: Number(req.params.id) });
  res.status(204).send();
};
