import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import argon2 from 'argon2';
import sequelize from './config/database';
import './models/index';
import User from './models/User';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

const ensureAdminExists = async (): Promise<void> => {
  const admin = await User.findOne({ where: { role: 'admin' } });
  if (!admin) {
    const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@admin.com';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin1234!';
    await User.create({
      email,
      password: await argon2.hash(password),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    });
    console.log(`Default admin created: ${email}`);
  }
};

const app = express();
const PORT = process.env.PORT || 3001;

const corsOrigins = process.env.CORS_ORIGIN;
app.use(cors({
  origin: corsOrigins
    ? corsOrigins.split(',').map((o) => o.trim()).filter(Boolean)
    : true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running.', timestamp: new Date().toISOString() });
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const start = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    await ensureAdminExists();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
};

start();

export default app;
