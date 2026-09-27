import express from 'express';
import cors from 'cors';
import { config } from './infrastructure/config/env.js';
import { pool } from './infrastructure/adapters/out/persistence/pg.js';
import router from './infrastructure/adapters/in/http/routes/index.js';
import { errorHandler, notFound } from './infrastructure/adapters/in/http/middlewares/errorHandler.js';

const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'up' });
  } catch {
    res.status(503).json({ status: 'error', database: 'down' });
  }
});

app.use('/api', router);
app.use(notFound);
app.use(errorHandler);

app.listen(config.port, '0.0.0.0', () => {
  console.log(`API escuchando en http://localhost:${config.port}/api`);
});
