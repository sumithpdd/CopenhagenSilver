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

export interface PhotoBoothPhoto {
  id: string;
  sessionId: string;
  userName: string;
  userEmail?: string;
  originalPhotoUrl: string;
  compositedPhotoUrl: string;
  backgroundId: string;
  promptId: string;
  customPrompt?: string;
  photoCode: string;
  createdAt: Date;
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
