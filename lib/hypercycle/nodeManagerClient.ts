// Node Manager client for interacting with a Hypercycle node REST API
// NOTE: This is an early thin wrapper – endpoints are based on the current Hypercycle
//       Node-Manager alpha spec and may need tweaking once the official spec lands.
//       All methods return plain JavaScript objects so callers can decide how to
//       map / persist them in Prisma or elsewhere.

import assert from 'assert';

/**
 * Generic shape of an AIM returned by the node-manager.
 * Only fields we currently care about are typed; extra fields are accepted via
 * an index signature so we don't inadvertently discard future additions from
 * the server response.
 */
export interface NodeAim {
  id: string;               // unique id used by node-manager (usually the container name)
  name: string;             // human-readable AIM name (from manifest)
  image: string;            // Docker image tag
  slot?: number;            // integer 0..n (which port slot the AIM is bound to)
  port?: number;            // exposed port on the node
  status: 'installing' | 'running' | 'stopped' | 'error';
  manifestUrl?: string;     // URL to /manifest.json as seen by the node
  [key: string]: unknown;   // any additional fields we're not explicitly tracking
}

export interface InstallAimOptions {
  image: string;                    // e.g. ghcr.io/org/translation:latest
  env?: Record<string, string>;     // parsed from LABEL ENV_VARS
  slot?: number;                    // optional – let node choose if undefined
  extra?: Record<string, unknown>;  // future-proofing (labels, caps, etc.)
}

export interface InstallResponse {
  success: boolean;
  aim?: NodeAim;
  message?: string;
}

/**
 * Very small wrapper around fetch with timeout + JSON handling.
 */
async function http<T>(
  baseUrl: string,
  path: string,
  init: RequestInit & { timeout?: number } = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = init.timeout ?? 20_000; // default 20s
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`NodeManager error ${res.status}: ${text}`);
    }

    // Some endpoints might return empty body (204 etc.)
    if (res.status === 204) return undefined as unknown as T;

    const data = (await res.json()) as T;
    return data;
  } finally {
    clearTimeout(id);
  }
}

export class NodeManagerClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    assert(baseUrl, 'baseUrl is required');
    this.baseUrl = baseUrl.replace(/\/$/, ''); // drop trailing slash
    this.apiKey = apiKey;
  }

  // INTERNAL helper to inject API key header if provided
  private headers(): Record<string, string> {
    return this.apiKey ? { 'x-api-key': this.apiKey } : {};
  }

  /**
   * Return basic node info (version, free slots, etc.).
   * Not all nodes implement this; catches 404 and returns null.
   */
  async getInfo(): Promise<Record<string, unknown> | null> {
    try {
      return await http<Record<string, unknown>>(this.baseUrl, '/api/v1/info', {
        method: 'GET',
        headers: this.headers(),
      });
    } catch (err: any) {
      if (err.message?.includes('404')) return null;
      throw err;
    }
  }

  /**
   * List installed AIMs.
   */
  listAims(): Promise<NodeAim[]> {
    return http<NodeAim[]>(this.baseUrl, '/api/v1/aims', {
      method: 'GET',
      headers: this.headers(),
    });
  }

  /**
   * Install or update an AIM given a Docker image.
   * The node will pull the image, allocate a slot, and start the container.
   */
  installAim(opts: InstallAimOptions): Promise<InstallResponse> {
    return http<InstallResponse>(this.baseUrl, '/api/v1/install', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(opts),
      timeout: 60_000, // pulls can take a while
    });
  }

  /**
   * Stop and remove an AIM from the node by `id` (container name).
   */
  async removeAim(id: string): Promise<boolean> {
    const res = await http<{ success: boolean }>(this.baseUrl, `/api/v1/aims/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    return res.success;
  }

  /**
   * Fetch manifest.json for a given AIM (convenience wrapper).
   */
  async getManifest(aim: NodeAim | string): Promise<Record<string, unknown>> {
    const aimObj: NodeAim = typeof aim === 'string' ? { id: aim } as NodeAim : aim;
    const path = aimObj.manifestUrl || `/api/v1/aims/${encodeURIComponent(aimObj.id)}/manifest`;
    return http<Record<string, unknown>>(this.baseUrl, path, {
      method: 'GET',
      headers: this.headers(),
    });
  }

  /**
   * Health-check a specific AIM by calling /health endpoint (many tutorial AIMs expose it).
   * Returns true if status==200.
   */
  async pingAim(aimId: string): Promise<boolean> {
    try {
      await http<unknown>(this.baseUrl, `/api/v1/aims/${encodeURIComponent(aimId)}/health`, {
        method: 'GET',
        headers: this.headers(),
        timeout: 5_000,
      });
      return true;
    } catch {
      return false;
    }
  }
} 