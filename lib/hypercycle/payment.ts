import { ethers } from 'ethers';
import assert from 'assert';

/**
 * Very thin wrapper for opening / closing payment channels with a Hypercycle
 * node-manager. At the moment we assume the node exposes simple REST helpers
 * `/api/v1/payment/open`, `/close`, `/balance` that mirror the functions here.
 *
 * In production we may replace these with direct hypc-js calls once the SDK
 * exposes them.  Until then this acts as a shim so the rest of the codebase can
 * remain stable.
 */

export interface PaymentChannel {
  id: string; // channel id assigned by node
  user: string; // EVM address of caller
  node: string; // nodeUrl
  balance: bigint; // micro USDC (1e-6)
  openTxHash?: string; // optional on-chain tx hash
  createdAt: string;
}

export interface OpenChannelOpts {
  nodeUrl: string; // http://<ip>:8000
  provider: ethers.providers.Provider;
  signer: ethers.Signer; // wallet signer (must match userAddress)
  userAddress: string;
  amountUSDC: bigint; // micro USDC to deposit
  usdcContract: string; // ERC20 token address
}

export async function openChannel(opts: OpenChannelOpts): Promise<PaymentChannel> {
  const { nodeUrl, provider, signer, userAddress, amountUSDC, usdcContract } = opts;
  assert(amountUSDC > BigInt(0), 'amountUSDC must be positive');

  // 1. Approve USDC transfer to NodeManager escrow address (assumed to be provided by /info)
  const infoRes = await fetch(`${nodeUrl.replace(/\/$/, '')}/api/v1/info`);
  if (!infoRes.ok) throw new Error('Failed to fetch node info');
  const infoJson = await infoRes.json();
  const escrowAddress: string | undefined = infoJson.paymentEscrow;
  if (!escrowAddress) throw new Error('Node did not return escrow address');

  const erc20 = new ethers.Contract(usdcContract, [
    'function approve(address spender, uint256 amount) external returns (bool)',
  ], signer);
  const approveTx = await erc20.approve(escrowAddress, amountUSDC);
  await approveTx.wait();

  // 2. Call node REST API to open channel
  const openRes = await fetch(`${nodeUrl.replace(/\/$/, '')}/api/v1/payment/open`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: userAddress, amount: amountUSDC.toString() }),
  });
  if (!openRes.ok) throw new Error('Node failed to open payment channel');
  const channel = (await openRes.json()) as PaymentChannel;
  channel.openTxHash = approveTx.hash;
  return channel;
}

export async function closeChannel(nodeUrl: string, channelId: string): Promise<boolean> {
  const res = await fetch(`${nodeUrl.replace(/\/$/, '')}/api/v1/payment/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelId }),
  });
  if (!res.ok) return false;
  return true;
}

export async function getChannelBalance(nodeUrl: string, channelId: string): Promise<bigint> {
  const res = await fetch(`${nodeUrl.replace(/\/$/, '')}/api/v1/payment/balance?channelId=${encodeURIComponent(channelId)}`);
  if (!res.ok) throw new Error('Failed to fetch balance');
  const json = await res.json();
  return BigInt(json.balance);
} 