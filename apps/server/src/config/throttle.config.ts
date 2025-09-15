import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttleConfig: ThrottlerModuleOptions = [
  {
    name: 'short',
    ttl: 1000, // 1 second
    limit: 3, // 3 requests per second
  },
  {
    name: 'medium',
    ttl: 10000, // 10 seconds
    limit: 20, // 20 requests per 10 seconds
  },
  {
    name: 'long',
    ttl: 60000, // 1 minute
    limit: 100, // 100 requests per minute
  },
];

// Custom rate limits for specific endpoints
export const authThrottleConfig = {
  ttl: 60000, // 1 minute
  limit: 5, // 5 OAuth attempts per minute
};

export const uploadThrottleConfig = {
  ttl: 60000, // 1 minute
  limit: 10, // 10 uploads per minute
};

export const apiThrottleConfig = {
  ttl: 60000, // 1 minute
  limit: 300, // 300 general API requests per minute
};