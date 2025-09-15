import { SetMetadata } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

// Custom throttle decorator for OAuth endpoints
export const OAuthThrottle = () => Throttle({ default: { limit: 5, ttl: 60000 } }); // 5 requests per minute

// Custom throttle decorator for general auth endpoints  
export const AuthThrottle = () => Throttle({ default: { limit: 10, ttl: 60000 } }); // 10 requests per minute

// Custom throttle decorator for upload endpoints (future use)
export const UploadThrottle = () => Throttle({ default: { limit: 10, ttl: 60000 } }); // 10 uploads per minute