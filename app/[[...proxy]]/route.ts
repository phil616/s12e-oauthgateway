import { NextRequest, NextResponse } from 'next/server';
import { getKV } from '@/lib/kv';
import { encryptConfig, decryptConfig } from '@/lib/auth';

type GatewayConfig = { origin: string; secret?: string; host_header?: string };

async function handler(req: NextRequest) {
  const host = req.headers.get('host') || '';
  
  // 1. Try to read config from Cookie Cache (Encrypted JWE)
  let config: GatewayConfig | null = null;
  const configCacheToken = req.cookies.get('gw_config_cache')?.value;
  let shouldSetCookie = false;

  if (configCacheToken) {
    // Decrypt token
    const decrypted = await decryptConfig(configCacheToken);
    if (decrypted && decrypted.host === host && decrypted.config) {
      config = decrypted.config as GatewayConfig;
    }
  }

  // 2. Fallback to KV if no valid cache found
  if (!config) {
    const configKey = `domain_config:${host}`;
    config = await getKV<GatewayConfig>(configKey);
    shouldSetCookie = true;
  }

  if (!config || !config.origin) {
    return new NextResponse(`Domain ${host} is not configured in Gateway.`, { status: 502 });
  }

  const targetUrl = new URL(req.url);
  // Replace origin with target origin
  const originUrl = new URL(config.origin);
  targetUrl.protocol = originUrl.protocol;
  targetUrl.host = originUrl.host;
  targetUrl.port = originUrl.port;
  
  // Prepare headers
  const headers = new Headers(req.headers);
  // Use configured host_header if present, otherwise default to origin's host
  headers.set('host', config.host_header || originUrl.host);
  headers.set('X-Forwarded-Host', host);
  if (config.secret) {
      headers.set('X-Edge-Key', config.secret);
  }

  try {
    // fetch accepts ReadableStream in Node 18+ (Next.js 14).
    const body = req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined;

    const backendResponse = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: headers,
      body: body as any,
      redirect: 'manual', // Let the client handle redirects
    });

    // Create a new response to modify headers (cookies)
    const response = new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: backendResponse.headers,
    });

    // 3. Write Config back to Cookie if fetched from KV (Encrypted JWE)
    if (shouldSetCookie && config) {
      const payload = { host, config };
      const token = await encryptConfig(payload);
      
      response.cookies.set('gw_config_cache', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours cache (cleared by user action or expiry)
      });
    }

    return response;
  } catch (error) {
    console.error('Proxy Error:', error);
    // Redirect to static offline page
    const offlineUrl = new URL('/cgi-authorize/offline', req.url);
    offlineUrl.searchParams.set('retry_url', req.url);
    return NextResponse.redirect(offlineUrl);
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const HEAD = handler;
export const OPTIONS = handler;
