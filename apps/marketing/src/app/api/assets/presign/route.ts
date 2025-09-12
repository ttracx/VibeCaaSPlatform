import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Rate limiting (simple in-memory store for demo)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Validation schema
const presignSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*\/[a-zA-Z0-9][a-zA-Z0-9-]*$/),
  fileSize: z.number().min(1).max(100 * 1024 * 1024), // 100MB max
  purpose: z.enum(['upload', 'download', 'preview']),
});

// Rate limiting function
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10; // 10 requests per minute

  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Mock CDN service (replace with actual implementation)
async function generatePresignedUrl(
  fileName: string,
  fileType: string,
  fileSize: number,
  purpose: string
): Promise<{ url: string; expiresIn: number }> {
  // In a real implementation, this would:
  // 1. Validate the request with your CDN provider (AWS S3, Cloudflare, etc.)
  // 2. Generate a presigned URL with appropriate permissions
  // 3. Set appropriate expiration time based on purpose
  
  const baseUrl = process.env.CDN_BASE_URL || 'https://cdn.vibecaas.com';
  const bucket = process.env.CDN_BUCKET || 'vibecaas-assets';
  const key = `${purpose}/${Date.now()}-${fileName}`;
  
  // Mock presigned URL generation
  const mockUrl = `${baseUrl}/${bucket}/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=mock&X-Amz-Date=${new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')}&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=mock`;
  
  return {
    url: mockUrl,
    expiresIn: 3600, // 1 hour
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = presignSchema.parse(body);

    // Additional security checks
    const allowedFileTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'video/mp4',
      'video/webm',
      'application/pdf',
      'text/plain',
      'application/json',
    ];

    if (!allowedFileTypes.includes(validatedData.fileType)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Check file size limits based on purpose
    const sizeLimits = {
      upload: 50 * 1024 * 1024, // 50MB
      download: 100 * 1024 * 1024, // 100MB
      preview: 10 * 1024 * 1024, // 10MB
    };

    if (validatedData.fileSize > sizeLimits[validatedData.purpose]) {
      return NextResponse.json(
        { error: `File size exceeds limit for ${validatedData.purpose}` },
        { status: 400 }
      );
    }

    // Generate presigned URL
    const { url, expiresIn } = await generatePresignedUrl(
      validatedData.fileName,
      validatedData.fileType,
      validatedData.fileSize,
      validatedData.purpose
    );

    // Log the request (in production, use proper logging service)
    console.log(`Presigned URL generated for ${validatedData.fileName} (${validatedData.purpose})`);

    return NextResponse.json({
      url,
      expiresIn,
      fileName: validatedData.fileName,
      fileType: validatedData.fileType,
      purpose: validatedData.purpose,
    });

  } catch (error) {
    console.error('Presign API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}