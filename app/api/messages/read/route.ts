import { NextResponse } from 'next/server';
import { getConversationMessages, getMessage, storeMessage, clearUnreadCount } from '@/lib/redis-utils';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sender = searchParams.get('sender');
    const receiver = searchParams.get('receiver');

    if (!sender || !receiver) {
      return NextResponse.json({ error: 'sender and receiver required' }, { status: 400 });
    }

    const parts = [sender, receiver].sort();
    const convId = `conv_${parts.join('_')}`;

    const msgIds = await getConversationMessages(convId);
    for (const id of msgIds) {
      const msg: any = await getMessage(id);
      if (msg && msg.receiverId === receiver && !msg.read) {
        msg.read = true;
        await storeMessage(id, msg);
      }
    }

    await clearUnreadCount(receiver);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 