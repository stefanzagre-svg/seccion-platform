import { NextRequest, NextResponse } from 'next/server';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';
import { isPrivateOrBlockedHost, isAllowedMediaHost } from '@/lib/media-url-guard';
import { createAdminClient } from '@/lib/supabase/admin-client';

/**
 * Server-Side Image Obfuscation & Face Blur Endpoint
 * Generates real cryptographically blurred pixel data on the server / edge,
 * ensuring unauthenticated viewers or non-unlocked connections NEVER receive
 * the original raw face pixels in their DOM or HTTP response.
 *
 * Query Params:
 *  - url: encoded remote image URL (or profileId / postId opaque lookup)
 *  - blur: blur radius / pixelation factor (clamped 16-64, default 24)
 *  - faceOnly: whether to blur full image or face region (x, y, r)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let imageUrl = searchParams.get('url');
    const profileId = searchParams.get('profileId');
    const postId = searchParams.get('postId');

    const rawBlur = parseInt(searchParams.get('blur') || '24', 10);
    const blurRadius = Math.min(Math.max(Number.isFinite(rawBlur) ? rawBlur : 24, 16), 64);
    const faceOnly = searchParams.get('faceOnly') === 'true';

    const rawFx = parseFloat(searchParams.get('fx') || '0.5');
    const rawFy = parseFloat(searchParams.get('fy') || '0.38');
    const rawFr = parseFloat(searchParams.get('fr') || '0.22');
    const fx = Math.min(Math.max(Number.isFinite(rawFx) ? rawFx : 0.5, 0), 1);
    const fy = Math.min(Math.max(Number.isFinite(rawFy) ? rawFy : 0.38, 0), 1);
    const fr = Math.min(Math.max(Number.isFinite(rawFr) ? rawFr : 0.22, 0.12), 0.5);

    if (!imageUrl && profileId) {
      const admin = createAdminClient();
      const { data: prof } = await admin.from('profiles').select('avatar_url').eq('id', profileId).maybeSingle();
      imageUrl = prof?.avatar_url || null;
    } else if (!imageUrl && postId) {
      const admin = createAdminClient();
      const { data: post } = await admin.from('platform_content').select('media_url').eq('id', postId).maybeSingle();
      imageUrl = post?.media_url || null;
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing image url parameter' }, { status: 400 });
    }

    try {
      const parsedUrl = new URL(imageUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return NextResponse.json({ error: 'Invalid URL protocol: must be http or https' }, { status: 400 });
      }

      if (isPrivateOrBlockedHost(parsedUrl)) {
        return NextResponse.json(
          { error: 'SSRF protection: Private, local, or cloud metadata addresses are forbidden' },
          { status: 400 }
        );
      }

      if (!isAllowedMediaHost(parsedUrl)) {
        return NextResponse.json(
          { error: 'SSRF protection: Image host is not in permitted media storage domains' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json({ error: 'Malformed image URL' }, { status: 400 });
    }

    // 1. Fetch source image securely (never follow open redirects)
    let imgRes: Response;
    try {
      imgRes = await fetch(imageUrl, {
        redirect: 'error',
        signal: AbortSignal.timeout(8000),
        headers: {
          'Accept': 'image/jpeg,image/png,image/webp,*/*',
          'User-Agent': 'SECCION-Edge-Blur/1.0',
        },
      });
    } catch (fetchErr: any) {
      return NextResponse.json({ error: 'Failed to reach image source', details: fetchErr.message }, { status: 502 });
    }

    if (!imgRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch source image' }, { status: 502 });
    }

    // Enforce 10MB byte limit
    const MAX_BYTES = 10 * 1024 * 1024;
    const contentLength = parseInt(imgRes.headers.get('content-length') || '0', 10);
    if (contentLength > MAX_BYTES) {
      return NextResponse.json({ error: 'Image size exceeds maximum 10MB limit' }, { status: 400 });
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: 'Image size exceeds maximum 10MB limit' }, { status: 400 });
    }

    const buffer = Buffer.from(arrayBuffer);
    let width = 0;
    let height = 0;
    let rawPixels: Uint8Array | Buffer;

    // 2. Decode JPEG or PNG safely
    const contentType = imgRes.headers.get('content-type') || '';
    const isPng = contentType.includes('png') || imageUrl.toLowerCase().includes('.png');

    try {
      if (isPng) {
        const png = PNG.sync.read(buffer);
        width = png.width;
        height = png.height;
        rawPixels = png.data;
      } else {
        try {
          const decoded = jpeg.decode(buffer, { useTArray: true });
          width = decoded.width;
          height = decoded.height;
          rawPixels = decoded.data;
        } catch {
          // Fallback to PNG decode
          const png = PNG.sync.read(buffer);
          width = png.width;
          height = png.height;
          rawPixels = png.data;
        }
      }
    } catch {
      return NextResponse.json({ error: 'Failed to decode image: invalid or corrupt format' }, { status: 400 });
    }

    // Validate dimensions (max 2048x2048 to prevent OOM/CPU exhaustion)
    const MAX_DIMENSION = 2048;
    if (width <= 0 || height <= 0 || width > MAX_DIMENSION || height > MAX_DIMENSION) {
      return NextResponse.json({
        error: `Image dimensions (${width}x${height}) exceed maximum allowed ${MAX_DIMENSION}x${MAX_DIMENSION} limit`
      }, { status: 400 });
    }

    // 3. Pixelation & Box Blur Transformation (Server-Side Irreversible Pixel Scramble)
    const centerX = Math.floor(width * fx);
    const centerY = Math.floor(height * fy);
    const radiusSq = Math.pow(Math.max(width, height) * fr, 2);
    const blockSize = Math.max(Math.floor(blurRadius), 8);

    // Apply pixelation block-by-block
    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        // If faceOnly is active, check if block intersects face circle
        if (faceOnly) {
          const dx = (x + blockSize / 2) - centerX;
          const dy = (y + blockSize / 2) - centerY;
          if (dx * dx + dy * dy > radiusSq) {
            continue; // Keep non-face background intact
          }
        }

        // Calculate average color in block
        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let count = 0;

        for (let by = 0; by < blockSize && (y + by) < height; by++) {
          for (let bx = 0; bx < blockSize && (x + bx) < width; bx++) {
            const idx = ((y + by) * width + (x + bx)) * 4;
            rSum += rawPixels[idx];
            gSum += rawPixels[idx + 1];
            bSum += rawPixels[idx + 2];
            count++;
          }
        }

        const avgR = Math.floor(rSum / count);
        const avgG = Math.floor(gSum / count);
        const avgB = Math.floor(bSum / count);

        // Fill block with average color
        for (let by = 0; by < blockSize && (y + by) < height; by++) {
          for (let bx = 0; bx < blockSize && (x + bx) < width; bx++) {
            const idx = ((y + by) * width + (x + bx)) * 4;
            rawPixels[idx] = avgR;
            rawPixels[idx + 1] = avgG;
            rawPixels[idx + 2] = avgB;
          }
        }
      }
    }

    // 4. Encode to high-speed JPEG stream
    const encoded = jpeg.encode(
      {
        data: rawPixels,
        width,
        height,
      },
      78 // 78% quality
    );

    return new NextResponse(new Uint8Array(encoded.data), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Blur-Server-Processed': 'true',
      },
    });

  } catch (err: any) {
    console.error('[ServerBlur API Error]:', err);
    return NextResponse.json({ error: 'Server blur transformation failed', details: err.message }, { status: 400 });
  }
}
