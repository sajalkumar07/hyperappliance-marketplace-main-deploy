import type { NextApiRequest, NextApiResponse } from 'next';
import { setupSocket } from '@/lib/socket';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (res.socket) {
    setupSocket(res as any);
  }
  res.end();
} 