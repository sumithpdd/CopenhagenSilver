import { z } from 'zod';

const optionalUrl = z.union([
  z.literal(''),
  z.string().trim().url('Enter a valid URL'),
]);

const optionalText = (max: number) =>
  z.union([z.literal(''), z.string().trim().max(max)]);

// User Input Validation
export const userInputSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  userEmail: z.union([
    z.literal(''),
    z.string().trim().email('Invalid email address'),
  ]),
  company: optionalText(120).optional(),
  companyDescription: optionalText(500).optional(),
  role: optionalText(120).optional(),
  linkedInUrl: optionalUrl.optional(),
  headline: optionalText(200).optional(),
});

export type UserInputFormData = z.infer<typeof userInputSchema>;

export const attendeeProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  company: z.string().trim().max(120).optional(),
  companyDescription: z.string().trim().max(500).optional(),
  role: z.string().trim().max(120).optional(),
  linkedInUrl: z.string().trim().url().optional().or(z.literal('')),
  headline: z.string().trim().max(200).optional(),
});

export type AttendeeProfileInput = z.infer<typeof attendeeProfileSchema>;

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
