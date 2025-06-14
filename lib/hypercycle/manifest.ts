// Type definitions and minimal validation helpers for AIM `manifest.json`
// pulled from the Hypercycle tutorial. These types can be shared across
// backend (API ingestion) and frontend (form helpers, wizard previews).

export interface SuggestedCost {
  currency: string; // e.g. "USDC"
  amount: number; // integer micro-units (1 USDC = 1_000_000)
  description?: string;
}

// export interface ManifestMeta {
//   name: string;
//   short_name: string;
//   version: string;
//   documentation_url?: string;
//   license?: string;
//   terms_of_service?: string;
//   author?: string;
//   suggested_costs?: Record<string, SuggestedCost>;
// }

export interface ManifestMeta {
  name: string;
  short_name: string;
  version: string;
  description?: string; // ✅ Add this
  documentation_url?: string;
  license?: string;
  terms_of_service?: string;
  author?: string;
  suggested_costs?: Record<string, SuggestedCost>;
}

export interface EndpointExampleCall {
  body?: unknown;
  method: string; // "GET" | "POST" | etc.
  query?: string;
  headers?: unknown;
  output?: unknown;
}

export interface EndpointManifest {
  input_query?: string;
  input_headers?: Record<string, unknown> | string;
  input_body?: unknown;
  output?: unknown;
  documentation?: string;
  is_public?: boolean;
  is_private?: boolean;
  example_calls?: EndpointExampleCall[];
}

export interface AIMEndpoint {
  uri: string; // e.g. "/translate" or "re:/data/(.*)"
  methods: string[]; // ["POST"]
  endpoint_manifest: EndpointManifest;
}

// export interface AIMManifest extends ManifestMeta {
//   endpoints?: AIMEndpoint[]; // not strictly required but helpful
//   // any extra arbitrary metadata keys are allowed
//   [key: string]: unknown;
// }

export interface AIMManifest extends ManifestMeta {
  imageUrl?: string; // ✅ Add this
  endpoints?: AIMEndpoint[];
  [key: string]: unknown;
}

/* ------------------------------------------------------------------
 *  Runtime type-guard helpers
 * ------------------------------------------------------------------*/

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isAIMManifest(payload: unknown): payload is AIMManifest {
  if (!isObject(payload)) return false;
  const required = ["name", "short_name", "version"];
  return required.every((k) => typeof payload[k] === "string");
}

/**
 * parseManifest – safe helper that returns `null` if the input is not a valid
 * manifest according to our minimal checks. Use this when ingesting dev-supplied
 * manifests server-side.
 */
export function parseManifest(raw: unknown): AIMManifest | null {
  if (isAIMManifest(raw)) {
    return raw;
  }
  return null;
}
