import { SetMetadata } from '@nestjs/common';

// Je route e @Public() thakbe, sekhane login (token) lagbe na.
// Member 1 er JwtAuthGuard IS_PUBLIC_KEY dekhe oi route skip korbe.
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);