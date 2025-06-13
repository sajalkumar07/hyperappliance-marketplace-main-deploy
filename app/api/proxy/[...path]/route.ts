import { NextRequest, NextResponse } from 'next/server';

// Usage: client issues fetch(`/api/proxy?nodeUrl=<encoded>&endpoint=/translate`, {method:'POST', body:...})
// The dynamic [...path] allows arbitrary methods, but we rely on query params to forward.

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nodeUrl = searchParams.get('nodeUrl');
    const endpoint = searchParams.get('endpoint') || '';
    if (!nodeUrl) {
      return NextResponse.json({ error: 'nodeUrl is required' }, { status: 400 });
    }

    const forwardUrl = `${nodeUrl.replace(/\/$/, '')}${endpoint}`;
    const init: RequestInit = {
      method: 'POST',
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text(),
    };

    // Remove cookies & host headers for security
    delete (init.headers as any)['cookie'];
    delete (init.headers as any)['host'];

    const res = await fetch(forwardUrl, init);
    const body = await res.text();
    return new NextResponse(body, { status: res.status, headers: res.headers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nodeUrl = searchParams.get('nodeUrl');
    const endpoint = searchParams.get('endpoint') || '';
    if (!nodeUrl) return NextResponse.json({ error: 'nodeUrl required' }, { status: 400 });
    const forwardUrl = `${nodeUrl.replace(/\/$/, '')}${endpoint}${request.nextUrl.search}`;
    const res = await fetch(forwardUrl, { headers: { cost_only: '1' } });
    const body = await res.text();
    return new NextResponse(body, { status: res.status, headers: res.headers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 