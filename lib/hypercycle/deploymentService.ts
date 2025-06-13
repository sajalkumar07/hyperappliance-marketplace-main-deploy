import { NodeManagerClient, NodeAim } from './nodeManagerClient';

export interface DeployOptions {
  nodeUrl: string; // http://<ip>:8000
  image: string;   // ghcr.io/org/aim:tag
  envVars?: Record<string, string>;
  slot?: number;
  apiKey?: string; // optional if node requires api-key header
}

export interface DeployResult {
  success: boolean;
  nodeAim?: NodeAim;
  message?: string;
}

/**
 * deployAimToNode – High-level helper that pulls an image onto a Hypercycle
 * node and waits until the AIM is running.
 */
export async function deployAimToNode(opts: DeployOptions): Promise<DeployResult> {
  const { nodeUrl, image, envVars, slot, apiKey } = opts;
  const DEMO_MODE = process.env.DEMO_DEPLOY === 'true';
  try {
    if (DEMO_MODE || nodeUrl === 'mock') {
      // Simulate network / pull latency with staged delay (8-12 s)
      const delay = 8_000 + Math.floor(Math.random() * 4_000);
      return await new Promise<DeployResult>((resolve) => {
        setTimeout(() => {
          const fakeAim: NodeAim = {
            id: `mock-${Date.now().toString(36)}`,
            name: image.split(':')[0].split('/').pop() || 'aim',
            image,
            status: 'running',
            port: 9000,
            manifestUrl: `${nodeUrl === 'mock' ? 'https://demo.hypercycle.ai' : nodeUrl}/manifest.json`,
          } as NodeAim;
          resolve({ success: true, nodeAim: fakeAim });
        }, delay);
      });
    }

    const client = new NodeManagerClient(nodeUrl, apiKey);
    // Step 1: install
    const installRes = await client.installAim({ image, env: envVars, slot });
    if (!installRes.success || !installRes.aim) {
      return { success: false, message: installRes.message || 'Install failed' };
    }

    const aimId = installRes.aim.id;

    // Step 2: poll status until running (timeout 120s)
    const deadline = Date.now() + 120_000;
    let currentAim: NodeAim | undefined;
    while (Date.now() < deadline) {
      const list = await client.listAims();
      currentAim = list.find((a) => a.id === aimId);
      if (currentAim && currentAim.status === 'running') {
        return { success: true, nodeAim: currentAim };
      }
      await new Promise((r) => setTimeout(r, 3000));
    }

    return { success: false, message: 'Timeout waiting for AIM to start', nodeAim: currentAim };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
} 