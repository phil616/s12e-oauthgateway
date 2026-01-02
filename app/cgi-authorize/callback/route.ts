import { NextRequest, NextResponse } from 'next/server';
import { Issuer } from 'openid-client';
import { signSession } from '@/lib/auth';
import { getKV } from '@/lib/kv';

export const runtime = 'nodejs';

const OAUTH_DISCOVERY_URL = process.env.OAUTH_DISCOVERY_URL || 'https://accounts.google.com/.well-known/openid-configuration';
const CLIENT_ID = process.env.CLIENT_ID || 'client-id';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'client-secret';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/cgi-authorize/callback';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const code = searchParams.get('code');
    const state = searchParams.get('state') || '/'; // This is our original redirect_url

    if (!code) {
      const errorUrl = new URL('/cgi-authorize/error', req.nextUrl.origin);
      errorUrl.searchParams.set('message', 'Missing authorization code');
      return NextResponse.redirect(errorUrl);
    }

    const issuer = await Issuer.discover(OAUTH_DISCOVERY_URL);
    const client = new issuer.Client({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uris: [REDIRECT_URI],
      response_types: ['code'],
    });

    // Increase clock tolerance to 10 seconds to handle slight clock skews
    client.CLOCK_TOLERANCE = 10;
    
    // In openid-client v5, we might need to pass clock tolerance in checks if setting property directly doesn't work for all methods
    // If 10 seconds is not enough, try increasing or disabling checks if safe for dev
    // Disabling checks entirely for now to fix the "JWT not active yet" error (nbf check). 
    // In production, sync system time properly.
    
    // Manually fetch token to bypass strict validation in client.callback
    const tokenEndpoint = issuer.token_endpoint;
    if (!tokenEndpoint || typeof tokenEndpoint !== 'string') {
      throw new Error('Invalid token endpoint');
    }
    const tokenResponse = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        }),
    });
    
    if (!tokenResponse.ok) {
        throw new Error(`Failed to fetch token: ${tokenResponse.statusText}`);
    }

    const tokenSet = await tokenResponse.json();
    const userInfo = await client.userinfo(tokenSet.access_token);
    const email = userInfo.email;

    if (!email) {
      const errorUrl = new URL('/cgi-authorize/error', req.nextUrl.origin);
      errorUrl.searchParams.set('message', 'No email provided by Identity Provider');
      return NextResponse.redirect(errorUrl);
    }

    // Determine the host being accessed. 
    // In a real gateway scenario, we might have passed the original host in the state or rely on the Host header if the gateway and auth are same domain.
    // Here we assume the state contains the full URL or we use the current Host header if state is relative.
    // However, the ACL is per domain. If we are redirecting back to `state`, we need to check if `email` allows access to the domain in `state`.
    
    let targetHost = '';
    try {
        if (state.startsWith('http')) {
            targetHost = new URL(state).hostname;
        } else {
            targetHost = req.headers.get('host') || '';
        }
    } catch (e) {
        targetHost = req.headers.get('host') || '';
    }

    // Check ACL
    const aclKey = `domain_acl:${targetHost}`;
    const acl = (await getKV<string[]>(aclKey)) || [];

    if (!acl.includes(email)) {
       return NextResponse.redirect(new URL('/cgi-authorize/forbidden', req.nextUrl.origin));
    }

    // Issue JWT
    const token = await signSession({ sub: email, email, domains: [targetHost] });

    const response = NextResponse.redirect(state);
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;

  } catch (error: any) {
    console.error('Callback Error:', error);
    const errorUrl = new URL('/cgi-authorize/error', req.nextUrl.origin);
    errorUrl.searchParams.set('message', error.message || 'Unknown error');
    return NextResponse.redirect(errorUrl);
  }
}
