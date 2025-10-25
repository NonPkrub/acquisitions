import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '#routes/auth.routes.js';
import userRoute from '#routes/user.routes.js';
import securityMiddleware from '#middleware/security.middleware.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(securityMiddleware);

app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

app.get('/', (req, res) => {
  logger.info('Hello, Aquisitions!');
  res.status(200).send('Hello, Aquisitions!');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString,
    uptime: process.uptime(),
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Aquisitions API',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoute);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
  });
});

export default app;
