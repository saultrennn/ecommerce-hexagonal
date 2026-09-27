import { useCases } from '../../../../config/container.js';

export const register = async (req, res) => {
  const user = await useCases.registerUser.execute(req.body || {});
  res.status(201).json(user);
};

export const login = async (req, res) => {
  res.json(await useCases.login.execute(req.body || {}));
};
