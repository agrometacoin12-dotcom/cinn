/**
 * Domain types for CINNETemple application
 */

export interface Movie {
  id: string;
  title: string;
  director: string;
  synopsis: string;
  genre: string;
  releaseYear: number;
  duration: string; // e.g. "1h 45m"
  priceNGN: number; // ticket price in Naira (₦)
  posterUrl: string; // url to poster or generated image
  trailerUrl: string; // sample trailer video url (nature/stock or short teaser)
  published: boolean;
  rating: string;
  videoUrl?: string; // full uploaded video file url/path
}

export type UserRole = 'admin' | 'tester' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  joinedAt: string;
}

export interface Ticket {
  id: string;
  movieId: string;
  userId: string;
  purchaseDate: string;
  pricePaidNGN: number;
  status: 'active' | 'used'; // used tickets can simulate single-view consumption
  viewCount: number;
  expiresAt?: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  movieId: string;
  movieTitle: string;
  amountNGN: number;
  creatorShareNGN: number; // 90% of amount
  platformFeeNGN: number; // 10% of amount
  status: 'success' | 'failed' | 'processing';
  reference: string;
  timestamp: string;
}

export interface LicenseGrant {
  id: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  movieId: string;
  movieTitle: string;
  grantedBy: string; // e.g. "System Admin"
  grantedAt: string;
  status: 'active' | 'revoked';
}

export interface PlaybackSession {
  id: string;
  userId: string;
  userEmail: string;
  movieTitle: string;
  ipAddress: string;
  device: string;
  startedAt: string;
  durationSeconds: number;
  status: 'live' | 'completed' | 'aborted';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  role: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface UGCVideoTask {
  id: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
  scriptText: string;
  stylePreset: string;
  operationName?: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  videoUrl?: string; // final downloaded movie url from our proxy
  error?: string;
  createdAt: string;
}
