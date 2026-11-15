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

const ALLOWED_MEDIA_HOST_SUFFIXES = [
  '.supabase.co',
  '.supabase.in',
  '.r2.dev',
  '.cloudflarestream.com',
  'seccion.ai',
  'images.unsplash.com',
];

export function isAllowedMediaHost(input: string | URL): boolean {
  let hostname = typeof input === 'string' ? input : input.hostname;
  hostname = hostname.toLowerCase().replace(/^\[|\]$/g, '').trim();
  if (!hostname || isPrivateOrBlockedHost(hostname)) return false;

  return ALLOWED_MEDIA_HOST_SUFFIXES.some((suffix) =>
    suffix.startsWith('.') ? hostname.endsWith(suffix) || hostname === suffix.slice(1) : hostname === suffix || hostname.endsWith(`.${suffix}`)
  );
}
