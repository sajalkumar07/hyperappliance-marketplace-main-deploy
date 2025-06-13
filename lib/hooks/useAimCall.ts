import { useState } from 'react';
import { ethers } from 'ethers';
import { useCostApproval } from '@/components/CostApprovalModal';

interface AimCallOptions {
  nodeUrl: string;
  endpoint: string; // e.g. '/translate'
  method?: 'GET' | 'POST';
  body?: any;
}

export function useAimCall(signer: ethers.Signer | null = null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const approveCost = useCostApproval();

  const call = async <T = any>(opts: AimCallOptions): Promise<T | null> => {
    const { nodeUrl, endpoint, method = 'POST', body } = opts;
    try {
      setLoading(true);
      setError(null);
      // Cost preflight
      const costRes = await fetch(`/api/proxy?nodeUrl=${encodeURIComponent(nodeUrl)}&endpoint=${endpoint}`, {
        method: 'GET',
      });
      if (!costRes.ok) throw new Error('Failed cost estimation');
      const costJson = await costRes.json();
      const est = costJson?.costs?.[0]?.estimated || 0;
      const approve = await approveCost(est);
      if (!approve) throw new Error('User rejected cost');

      let sig = '';
      if (signer) {
        const msg = `Authorize spending up to ${est} microUSDC for ${endpoint}`;
        sig = await signer.signMessage(msg);
      }

      const res = await fetch(`/api/proxy?nodeUrl=${encodeURIComponent(nodeUrl)}&endpoint=${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(sig ? { signature: sig } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) throw new Error('AIM call failed');
      return (await res.json()) as T;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, call };
} 