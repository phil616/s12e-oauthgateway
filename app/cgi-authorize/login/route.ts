import { NextRequest, NextResponse } from 'next/server';
import { Issuer } from 'openid-client';

export const runtime = 'nodejs';

const OAUTH_DISCOVERY_URL = process.env.OAUTH_DISCOVERY_URL || 'https://accounts.google.com/.well-known/openid-configuration';
const CLIENT_ID = process.env.CLIENT_ID || 'client-id';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'client-secret';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/cgi-authorize/callback';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const redirectUrl = searchParams.get('redirect_url') || '/';

    const issuer = await Issuer.discover(OAUTH_DISCOVERY_URL);
    const client = new issuer.Client({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uris: [REDIRECT_URI],
      response_types: ['code'],
    });

    const url = client.authorizationUrl({
      scope: 'openid email profile',
      state: redirectUrl, // Passing redirect_url as state for simplicity (in prod, use proper state + cache)
    });

    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'OAuth Config Error' }, { status: 500 });
  }
}
