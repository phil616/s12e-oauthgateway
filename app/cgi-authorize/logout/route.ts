import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const redirectUrl = searchParams.get('redirect_url') || '/';
  
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.delete('auth_token');
  
  return response;
}
