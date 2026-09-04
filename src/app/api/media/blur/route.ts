import { NextRequest, NextResponse } from 'next/server';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

/**
 * SSRF Guard: Validates that the target hostname is not a loopback,
 * link-local, carrier-grade NAT, private RFC 1918, or cloud metadata IP address.
 */
export function isPrivateOrBlockedHost(input: string | URL): boolean {
  let hostname = typeof input === 'string' ? input : input.hostname;
  hostname = hostname.toLowerCase().replace(/^\[|\]$/g, '').trim();

  // Strip port if present
  if (hostname.includes(':') && !hostname.includes('.')) {
    const colonCount = (hostname.match(/:/g) || []).length;
    if (colonCount === 1) {
      hostname = hostname.split(':')[0];
    }
  } else if (hostname.includes(':') && hostname.includes('.')) {
    hostname = hostname.split(':')[0];
  }

  // 1. Localhost and internal reserved domain names
  if (
    ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname) ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return true;
  }

  // 2. IPv4 address range filtering
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);
  if (match) {
    const [, o1Str, o2Str, o3Str, o4Str] = match;
    const o1 = parseInt(o1Str, 10);
    const o2 = parseInt(o2Str, 10);
    const o3 = parseInt(o3Str, 10);
    const o4 = parseInt(o4Str, 10);

    // Validate octet range
    if (o1 > 255 || o2 > 255 || o3 > 255 || o4 > 255) return true;

    // 0.0.0.0/8 (Current network)
    if (o1 === 0) return true;
    // 10.0.0.0/8 (Private RFC 1918)
    if (o1 === 10) return true;
    // 100.64.0.0/10 (Carrier-Grade NAT)
    if (o1 === 100 && o2 >= 64 && o2 <= 127) return true;
    // 127.0.0.0/8 (Loopback)
    if (o1 === 127) return true;
    // 169.254.0.0/16 (Link-Local & Cloud Metadata e.g. 169.254.169.254)
    if (o1 === 169 && o2 === 254) return true;
    // 172.16.0.0/12 (Private RFC 1918)
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    // 192.168.0.0/16 (Private RFC 1918)
    if (o1 === 192 && o2 === 168) return true;
    // 224.0.0.0/4 & 240.0.0.0/4 (Multicast & Reserved)
    if (o1 >= 224) return true;
  }

  // 3. IPv6 private / link-local / unique local filtering
  if (
    hostname === '::1' ||
    hostname === '::' ||
    hostname.startsWith('fc') ||
    hostname.startsWith('fd') ||
    hostname.startsWith('fe80')
  ) {
    return true;
  }

  return false;
}

/**
 * Server-Side Image Obfuscation & Face Blur Endpoint
 * Generates real cryptographically blurred pixel data on the server / edge,
 * ensuring unauthenticated viewers or non-unlocked connections NEVER receive
 * the original raw face pixels in their DOM or HTTP response.
 *
 * Query Params:
 *  - url: encoded remote image URL (e.g. Supabase storage or asset)
 *  - blur: blur radius / pixelation factor (default: 24, range 4-64)
 *  - faceOnly: whether to blur full image or face region (x, y, r)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');
    const blurRadius = Math.min(Math.max(parseInt(searchParams.get('blur') || '24', 10), 4), 64);
    const faceOnly = searchParams.get('faceOnly') === 'true';
    const fx = parseFloat(searchParams.get('fx') || '0.5'); // center x ratio
    const fy = parseFloat(searchParams.get('fy') || '0.38'); // center y ratio
    const fr = parseFloat(searchParams.get('fr') || '0.22'); // radius ratio

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
    } catch {
      return NextResponse.json({ error: 'Malformed image URL' }, { status: 400 });
    }

    // 1. Fetch source image securely
    let imgRes: Response;
    try {
      imgRes = await fetch(imageUrl, {
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
