
import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import path from 'path';
import logger from './utils/logger.js';
import { generalLimiter, adminLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Import routes
import redis from './config/redis.js';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import taskRoutes from './routes/tasks.js';
import planRoutes from './routes/plans.js';
import coursePlanRoutes from './routes/coursePlans.js';
import submissionRoutes from './routes/userPlanSubmissions.js';
import coursePlanSubmissionRoutes from './routes/userCoursePlanSubmissions.js';
import userTaskRoutes from './routes/userTasks.js';
import courseLinkRoutes from './routes/courseLinks.js';
import userCourseCompletionRoutes from './routes/userCourseCompletions.js';
import promotionRoutes from './routes/promotions.js';
import userPromotionRoutes from './routes/userPromotions.js';
import accountDetailsRoutes from './routes/accountDetails.js';
import userCourseDashboardRoutes from './routes/userCourseDashboard.js';
import teamVerificationRoutes from './routes/teamVerification.js';
import fraudReportRoutes from './routes/fraudReports.js';
import siteSettingsRoutes from './routes/siteSettings.js';

// Connect to MongoDB with optimized settings
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
      waitQueueTimeoutMS: 5000,
      compressors: 'zlib',
    });
    logger.info('✅ Connected to MongoDB');
  } catch (err) {
    logger.error('❌ MongoDB connection error:', err);
    logger.warn('⚠️ Continuing without database - API will not work properly');
  }
};

connectDB();
redis.connect().catch((err) => logger.error('Redis connection error:', err));

const app = express();

// Trust proxy (for accurate IP behind load balancer/nginx)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for now to avoid blocking resources
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Body parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));

// Health check
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Golden Skills API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redis.status || 'unknown',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Apply rate limiting to API routes - temporarily disabled
// app.use('/api/', generalLimiter);

// Routes with specific rate limits
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', taskRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/course-plans', coursePlanRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/course-plan-submissions', coursePlanSubmissionRoutes);
app.use('/api/user-tasks', userTaskRoutes);
app.use('/api/course-links', courseLinkRoutes);
app.use('/api/user-course-completions', userCourseCompletionRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/user-promotions', userPromotionRoutes);
app.use('/api/account-details', accountDetailsRoutes);
app.use('/api/user-course-dashboard', userCourseDashboardRoutes);
app.use('/api/team', teamVerificationRoutes); // No rate limit - tracked in DB
app.use('/api/fraud', fraudReportRoutes); // Has its own strict rate limit
app.use('/api/settings', siteSettingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});