import { create } from 'zustand';
import { PhotoBoothSession, Background, PhotoPrompt } from '@/types';

interface PhotoBoothState {
  // Session Info
  session: PhotoBoothSession | null;
  initializeSession: (userName: string, userEmail?: string) => void;
  clearSession: () => void;

  // GDPR consent (required before booth flow)
  consentTermsAccepted: boolean;
  consentGalleryShare: boolean;
  setConsent: (termsAccepted: boolean, galleryShare: boolean) => void;

  // Photo
  capturedPhoto: string | null;
  setCapturedPhoto: (photo: string | null) => void;

  // Selections
  selectedBackground: Background | null;
  setSelectedBackground: (background: Background) => void;

  selectedPrompt: PhotoPrompt | null;
  setSelectedPrompt: (prompt: PhotoPrompt) => void;

  // Processing
  isProcessing: boolean;
  processingStep: 'uploading' | 'compositing' | 'saving' | null;
  processingError: string | null;

  setIsProcessing: (isProcessing: boolean) => void;
  setProcessingStep: (step: PhotoBoothState['processingStep']) => void;
  setProcessingError: (error: string | null) => void;

  // Result
  compositedPhotoUrl: string | null;
  photoId: string | null;
  photoCode: string | null;

  setCompositedPhoto: (url: string, photoId?: string, photoCode?: string) => void;
  resetResult: () => void;

  // Overall reset
  resetSession: () => void;
}

const initialState = {
  session: null,
  consentTermsAccepted: false,
  consentGalleryShare: false,
  capturedPhoto: null,
  selectedBackground: null,
  selectedPrompt: null,
  isProcessing: false,
  processingStep: null,
  processingError: null,
  compositedPhotoUrl: null,
  photoId: null,
  photoCode: null,
};

export const usePhotoBoothStore = create<PhotoBoothState>((set) => ({
  ...initialState,

  initializeSession: (userName, userEmail) =>
    set({
      session: {
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userName,
        userEmail,
        createdAt: new Date(),
      },
    }),

  clearSession: () => set({ session: null }),

  setConsent: (termsAccepted, galleryShare) =>
    set({
      consentTermsAccepted: termsAccepted,
      consentGalleryShare: galleryShare,
    }),

  setCapturedPhoto: (photo) => set({ capturedPhoto: photo }),

  setSelectedBackground: (background) =>
    set({ selectedBackground: background }),

  setSelectedPrompt: (prompt) => set({ selectedPrompt: prompt }),

  setIsProcessing: (isProcessing) => set({ isProcessing }),

  setProcessingStep: (step) => set({ processingStep: step }),

  setProcessingError: (error) => set({ processingError: error }),

  setCompositedPhoto: (url, photoId?: string, photoCode?: string) =>
    set({
      compositedPhotoUrl: url,
      ...(photoId && { photoId }),
      ...(photoCode && { photoCode }),
      isProcessing: false,
      processingStep: null,
      processingError: null,
    }),

  resetResult: () =>
    set({
      compositedPhotoUrl: null,
      photoId: null,
      photoCode: null,
      capturedPhoto: null,
      selectedBackground: null,
      selectedPrompt: null,
    }),

  resetSession: () => set(initialState),
}));
