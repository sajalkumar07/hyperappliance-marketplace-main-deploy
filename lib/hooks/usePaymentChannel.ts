import { useCallback, useState } from 'react';
import { ethers } from 'ethers';
import { openChannel, closeChannel, getChannelBalance, PaymentChannel } from '@/lib/hypercycle/payment';

/**
 * React hook that wraps payment-channel helpers for the browser.
 * Assumes the dApp already has an ethers provider (e.g. injected by MetaMask).
 */
export function usePaymentChannel(nodeUrl: string, usdcContract: string) {
  const [channel, setChannel] = useState<PaymentChannel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback(async (amountUSDC: bigint) => {
    try {
      setLoading(true);
      setError(null);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore – window.ethereum injected by wallet
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      const ch = await openChannel({ nodeUrl, provider, signer, userAddress, amountUSDC, usdcContract });
      setChannel(ch);
      return ch;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [nodeUrl, usdcContract]);

  const close = useCallback(async () => {
    if (!channel) return false;
    try {
      setLoading(true);
      setError(null);
      const ok = await closeChannel(nodeUrl, channel.id);
      if (ok) setChannel(null);
      return ok;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [channel, nodeUrl]);

  const refreshBalance = useCallback(async () => {
    if (!channel) return;
    try {
      const bal = await getChannelBalance(nodeUrl, channel.id);
      setChannel({ ...channel, balance: bal });
    } catch (err) {
      // ignore
    }
  }, [channel, nodeUrl]);

  return { channel, loading, error, open, close, refreshBalance };
} 