import { create } from 'zustand';
import {
  AttendeeProfile,
  Background,
  PhotoBoothSession,
  PhotoPrompt,
  SitecoreAttendeePageResult,
} from '@/types';

interface PhotoBoothState {
  // Session Info
  session: PhotoBoothSession | null;
  attendeeProfile: AttendeeProfile | null;
  initializeSession: (
    userName: string,
    userEmail?: string,
    profile?: Omit<AttendeeProfile, 'fullName'>
  ) => void;
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
  sitecoreAttendeePage: SitecoreAttendeePageResult | null;
  sitecoreSyncError: string | null;

  setCompositedPhoto: (url: string, photoId?: string, photoCode?: string) => void;
  /** Update preview only (regenerate AI) without changing gallery photo code. */
  setCompositedPreview: (url: string) => void;
  setSitecoreAttendeePage: (page: SitecoreAttendeePageResult | null) => void;
  setSitecoreSyncError: (error: string | null) => void;
  resetResult: () => void;

  // Overall reset
  resetSession: () => void;
}

const initialState = {
  session: null,
  attendeeProfile: null,
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
  sitecoreAttendeePage: null,
  sitecoreSyncError: null,
};

export const usePhotoBoothStore = create<PhotoBoothState>((set) => ({
  ...initialState,

  initializeSession: (userName, userEmail, profile) => {
    const clean = (v?: string) => v?.trim() || undefined;
    const attendeeProfile: AttendeeProfile = {
      fullName: userName.trim(),
      company: clean(profile?.company),
      companyDescription: clean(profile?.companyDescription),
      role: clean(profile?.role),
      linkedInUrl: clean(profile?.linkedInUrl),
      headline: clean(profile?.headline),
    };
    set({
      session: {
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userName: userName.trim(),
        userEmail: clean(userEmail),
        createdAt: new Date(),
      },
      attendeeProfile,
    });
  },

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

  setCompositedPreview: (url) =>
    set({
      compositedPhotoUrl: url,
      isProcessing: false,
      processingStep: null,
      processingError: null,
    }),

  setSitecoreAttendeePage: (page) => set({ sitecoreAttendeePage: page }),

  setSitecoreSyncError: (error) => set({ sitecoreSyncError: error }),

  resetResult: () =>
    set({
      compositedPhotoUrl: null,
      photoId: null,
      photoCode: null,
      sitecoreAttendeePage: null,
      sitecoreSyncError: null,
      capturedPhoto: null,
      selectedBackground: null,
      selectedPrompt: null,
    }),

  resetSession: () => set(initialState),
}));
