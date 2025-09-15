import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, desktop apps, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Define allowed origins based on environment
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001', // Alternative dev port
    ];

    // In production, be more restrictive
    if (process.env.NODE_ENV === 'production') {
      const productionOrigins = [
        process.env.FRONTEND_URL,
        process.env.FRONTEND_DOMAIN,
      ].filter(Boolean);
      
      if (productionOrigins.length === 0) {
        return callback(new Error('No production origins configured'), false);
      }
      
      if (productionOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'), false);
      }
    }

    // Development environment - allow localhost variations
    if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-CSRF-Token',
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
  ],
  maxAge: 86400, // 24 hours
};