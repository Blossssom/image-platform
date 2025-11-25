import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsConfig: CorsOptions = {
  origin: true, // Allow all origins for development. In production, specify your frontend origin.
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};