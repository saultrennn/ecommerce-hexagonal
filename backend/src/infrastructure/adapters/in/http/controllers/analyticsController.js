import { useCases } from '../../../../config/container.js';

export const dashboard = async (req, res) =>
  res.json(await useCases.analytics.getDashboard(req.query));
