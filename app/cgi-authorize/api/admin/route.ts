import { NextRequest, NextResponse } from 'next/server';
import { getKV, putKV } from '@/lib/kv';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin-secret-123';

function checkAuth(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${ADMIN_SECRET}`) {
    return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 });
  }

  // Fetch ACL
  const aclKey = `domain_acl:${domain}`;
  const acl = (await getKV<string[]>(aclKey)) || [];

  // Fetch Config
  const configKey = `domain_config:${domain}`;
  const config = (await getKV<{ origin: string; secret?: string }>(configKey)) || { origin: '', secret: '' };

  return NextResponse.json({ domain, acl, config });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { domain, type } = body;

    if (!domain || !type) {
      return NextResponse.json({ error: 'Missing domain or type' }, { status: 400 });
    }

    if (type === 'acl') {
        const { email, action } = body;
        if (!email || !['add', 'remove'].includes(action)) {
            return NextResponse.json({ error: 'Invalid ACL parameters' }, { status: 400 });
        }

        const aclKey = `domain_acl:${domain}`;
        let acl = (await getKV<string[]>(aclKey)) || [];

        if (action === 'add') {
            if (!acl.includes(email)) {
                acl.push(email);
            }
        } else if (action === 'remove') {
            acl = acl.filter((e) => e !== email);
        }

        await putKV(aclKey, acl);
        return NextResponse.json({ success: true, domain, acl });

    } else if (type === 'config') {
        const { origin, secret, host_header } = body;
        if (!origin) {
            return NextResponse.json({ error: 'Missing origin' }, { status: 400 });
        }

        const configKey = `domain_config:${domain}`;
        const config = { origin, secret: secret || '', host_header: host_header || '' };
        await putKV(configKey, config);
        
        return NextResponse.json({ success: true, domain, config });
    } else {
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
