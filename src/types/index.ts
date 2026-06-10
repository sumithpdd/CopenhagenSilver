/**
 * Core type definitions for Sitecore Silver Photo Booth
 */

// User & Session
export interface PhotoBoothSession {
  sessionId: string;
  userName: string;
  userEmail?: string;
  createdAt: Date;
}

/** Maps to SitecoreSilverAttendeeProfile template fields in XM Cloud. */
export interface AttendeeProfile {
  fullName: string;
  company?: string;
  companyDescription?: string;
  role?: string;
  linkedInUrl?: string;
  headline?: string;
}

export interface SitecoreAttendeePageResult {
  itemId: string;
  path: string;
  name: string;
  aiQuote: string;
  created: boolean;
  contentEditorUrl?: string | null;
}

// Photo Models
export interface Background {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: 'heritage' | 'celebration' | 'innovation';
}

export interface PhotoPrompt {
  id: string;
  title: string;
  description: string;
  fullPrompt: string;
  category: 'vip' | 'heritage' | 'celebration' | 'innovation' | 'fun' | 'custom';
  emoji?: string;
}

export type PhotoVisibility = 'public' | 'hidden';
export type ModerationStatus = 'approved' | 'pending' | 'rejected';

export interface PhotoBoothPhoto {
  id: string;
  sessionId: string;
  userName: string;
  userEmail?: string;
  /** Full attendee profile from input form (also on photobooth_sessions). */
  attendeeProfile?: AttendeeProfile;
  originalPhotoUrl: string;
  compositedPhotoUrl: string;
  backgroundId: string;
  promptId: string;
  customPrompt?: string;
  photoCode: string;
  createdAt: Date;
  /** Public gallery visibility (admin can hide without deleting). */
  visibility?: PhotoVisibility;
  moderationStatus?: ModerationStatus;
  /** User opted in to community gallery at capture time. */
  consentGalleryShare?: boolean;
  consentTermsAcceptedAt?: Date | string;
  moderationNote?: string;
  updatedAt?: Date | string;
  metadata?: {
    processingTime?: number;
    dimensions?: { width: number; height: number };
  };
}

// Processing State
export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  error?: string;
  currentStep?: 'uploading' | 'compositing' | 'saving';
}

// Gallery
export interface GalleryFilters {
  searchQuery?: string;
  category?: Background['category'];
  sortBy?: 'newest' | 'oldest';
  limit?: number;
  offset?: number;
}

export interface GalleryResponse {
  photos: PhotoBoothPhoto[];
  total: number;
  hasMore: boolean;
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CompositingRequest {
  photo: string; // base64 encoded
  background: string;
  prompt: string;
}

export interface CompositingResponse {
  compositedPhoto: string; // base64 encoded
  photoId: string;
}

export interface UploadPhotoRequest {
  sessionId: string;
  userName: string;
  userEmail?: string;
  originalPhoto: string; // base64
  backgroundId: string;
  promptId: string;
  customPrompt?: string;
}

export interface UploadPhotoResponse {
  photoId: string;
  photoCode: string;
  originalPhotoUrl: string;
}
