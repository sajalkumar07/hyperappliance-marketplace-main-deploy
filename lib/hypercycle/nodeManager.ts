//lib/hypercycle/nodeManager.ts
export interface BoxSpecs {
  gpu: string;
  cpu: string;
  ram: string;
}

export async function getBoxSpecs(nodeUrl: string): Promise<BoxSpecs> {
  const candidates = ['/api/aims', '/info', '/aims'];
  const tryFetch = async (base: string, path: string) => {
    return fetch(`${base}${path}`, { headers: { Accept: 'application/json' }, next: { revalidate: 0 } }).catch(() => null);
  };

  const buildBase = (url: string, port?: string) => {
    const u = new URL(url);
    if (port) u.port = port;
    return u.toString().replace(/\/$/, '');
  };

  const bases = [nodeUrl.replace(/\/$/, ''), buildBase(nodeUrl, '8000'), buildBase(nodeUrl, '8006')];

  let res: Response | null = null;

  for (const base of bases) {
    for (const path of candidates) {
      res = await tryFetch(base, path);
      if (res && res.ok && res.headers.get('content-type')?.includes('application/json')) {
        break;
      }
      res = null;
    }
    if (res) break;
  }

  if (!res) {
    throw new Error(`Node unreachable or returned non-JSON at ${nodeUrl}`);
  }
  try {
    const json = await res.json();
    return {
      gpu: json.gpu || json.specs?.gpu || 'Unknown',
      cpu: json.cpu || json.specs?.cpu || 'Unknown',
      ram: json.ram || json.specs?.ram || 'Unknown',
    };
  } catch {
    throw new Error('Node responded with non-JSON payload');
  }
}

export async function findFreeSlot(nodeUrl: string): Promise<number> {
  const paths = ['/api/aims', '/aims'];
  let aims: any[] = [];
  for (const p of paths) {
    const res = await fetch(`${nodeUrl}${p}`, { headers: { Accept: 'application/json' } }).catch(() => null);
    if (res && res.ok && res.headers.get('content-type')?.includes('application/json')) {
      aims = await res.json();
      break;
    }
  }
  if (!Array.isArray(aims)) aims = [];

  const used: Set<number> = new Set(aims.map((a: any) => a.slot));
  for (let i = 0; i < 10; i++) {
    if (!used.has(i)) return i;
  }
  throw new Error('No free slot');
}

export async function deployAim(nodeUrl: string, slot: number, image: string, name: string) {
  const res = await fetch(`${nodeUrl}/api/aim/deploy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slot, image, name }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function stopAim(nodeUrl: string, slot: number) {
  return fetch(`${nodeUrl}/api/aim/${slot}/stop`, { method: 'POST' });
} 