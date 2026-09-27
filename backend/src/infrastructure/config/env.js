import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 3000),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'ecommerce_db',
    user: process.env.DB_USER || 'ecommerce_user',
    password: process.env.DB_PASSWORD || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  },
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 10),
};

if (!config.jwt.secret || config.jwt.secret.length < 16) {
  throw new Error('Define JWT_SECRET en el archivo .env (mínimo 16 caracteres)');
}
