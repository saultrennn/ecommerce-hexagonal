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
  mail: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    from: process.env.MAIL_FROM || process.env.SMTP_USER || '',
    adminEmail: process.env.ADMIN_EMAIL || '',
    payment: {
      bank: process.env.PAYMENT_BANK || '',
      accountHolder: process.env.PAYMENT_ACCOUNT_HOLDER || '',
      clabe: process.env.PAYMENT_CLABE || '',
      instructions: process.env.PAYMENT_INSTRUCTIONS || '',
    },
  },
};

if (!config.jwt.secret || config.jwt.secret.length < 16) {
  throw new Error('Define JWT_SECRET en el archivo .env (mínimo 16 caracteres)');
}
