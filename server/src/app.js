import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

const clientOriginEnv = process.env.CLIENT_ORIGIN || process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173';
const configuredOrigins = clientOriginEnv.split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);

    // Wildcard authorization
    if (configuredOrigins.includes('*')) {
      return callback(null, true);
    }

    // Match against configured origins
    if (configuredOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow any Vercel production or preview deployment (*.vercel.app)
    if (/^https:\/\/[a-zA-Z0-9_\-.]+\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Also allow localhost/127.0.0.1 variants for local dev convenience
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS policy does not allow access from origin ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root route providing API discovery information
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'TrustView ERP Management Backend API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: [
      '/api/health',
      '/api/auth/login',
      '/api/auth/me',
      '/api/auth/logout',
      '/api/campuses',
      '/api/campuses/:id',
      '/api/dashboard/summary',
      '/api/dashboard/trends',
      '/api/fees/summary',
      '/api/hostels/summary',
      '/api/attendance/risks',
      '/api/exceptions',
      '/api/exceptions/:id/status'
    ]
  });
});

// Mount modular API routes under /api
app.use('/api', apiRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

