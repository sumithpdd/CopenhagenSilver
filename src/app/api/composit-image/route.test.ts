import { POST } from './route';
import { sanitizePrompt } from '@/lib/prompt-sanitizer';

jest.mock('@/lib/prompt-sanitizer', () => ({
  sanitizePrompt: jest.fn(() => ({
    isValid: true,
    sanitizedPrompt: 'Sitecore Silver celebration',
  })),
}));

const mockGenerateContent = jest.fn(async () => ({
  candidates: [
    {
      content: {
        parts: [
          {
            inlineData: {
              data: 'generatedBase64',
            },
          },
        ],
      },
    },
  ],
}));

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
  Modality: { TEXT: 'TEXT', IMAGE: 'IMAGE' },
}));

const mockToBuffer = jest.fn(async () => Buffer.from('fake-jpeg-image'));
const mockJpeg = jest.fn().mockReturnValue({
  toBuffer: mockToBuffer,
});
const mockComposite = jest.fn().mockReturnValue({
  jpeg: mockJpeg,
});

jest.mock('sharp', () =>
  jest.fn().mockImplementation(() => ({
    metadata: jest.fn(async () => ({ width: 800, height: 600 })),
    composite: mockComposite,
    jpeg: mockJpeg,
  }))
);

describe('/api/composit-image route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_GEMINI_API_KEY = 'test-key';
  });

  it('returns success with a composited image when valid body is provided', async () => {
    const request = {
      json: jest.fn().mockResolvedValue({
        photo: 'data:image/jpeg;base64,dGVzdA==',
        prompt: 'Celebrate Sitecore heritage',
        backgroundDescription: 'Silver festival',
      }),
    } as any;

    const response = await POST(request);
    const body = await response.json();

    expect(request.json).toHaveBeenCalled();
    expect(sanitizePrompt).toHaveBeenCalledWith('Celebrate Sitecore heritage', 'Silver festival');
    expect(body.success).toBe(true);
    expect(body.data.compositedPhoto).toContain('data:image/jpeg;base64,');
  });

  it('returns 400 when the photo field is missing', async () => {
    const request = {
      json: jest.fn().mockResolvedValue({
        prompt: 'Celebrate Sitecore heritage',
        backgroundDescription: 'Silver festival',
      }),
    } as any;

    const response = await POST(request);
    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error).toContain('Missing required fields');
  });

  it('returns 400 when the prompt field is missing', async () => {
    const request = {
      json: jest.fn().mockResolvedValue({
        photo: 'data:image/jpeg;base64,dGVzdA==',
        backgroundDescription: 'Silver festival',
      }),
    } as any;

    const response = await POST(request);
    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error).toContain('Missing required fields');
  });
});
