import { z } from 'zod';

// User Input Validation
export const userInputSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  userEmail: z.union([
    z.literal(''),
    z.string().trim().email('Invalid email address'),
  ]),
});

export type UserInputFormData = z.infer<typeof userInputSchema>;

// Photo Upload Validation
export const photoUploadSchema = z.object({
  photo: z
    .string()
    .refine(
      (val) => val.startsWith('data:image/'),
      'Invalid image format'
    ),
  backgroundId: z.string().min(1, 'Background is required'),
  promptId: z.string().min(1, 'Prompt is required'),
  customPrompt: z.string().optional(),
});

export type PhotoUploadData = z.infer<typeof photoUploadSchema>;

// Session Data Validation
export const sessionSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  userName: z.string().min(2),
  userEmail: z.string().email().optional(),
  selectedBackgroundId: z.string().min(1),
  selectedPromptId: z.string().min(1),
});

export type SessionData = z.infer<typeof sessionSchema>;

// API Request Validation
export const compositingRequestSchema = z.object({
  photo: z.string().startsWith('data:image/', 'Invalid image format'),
  background: z.string().min(1),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
});

export type CompositingRequest = z.infer<typeof compositingRequestSchema>;

// Gallery Filter Validation
export const galleryFilterSchema = z.object({
  searchQuery: z.string().optional(),
  category: z
    .enum(['heritage', 'celebration', 'innovation'])
    .optional(),
  sortBy: z.enum(['newest', 'oldest']).default('newest'),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export type GalleryFilters = z.infer<typeof galleryFilterSchema>;
