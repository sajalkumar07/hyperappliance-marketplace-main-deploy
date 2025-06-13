import { NextResponse } from 'next/server';
import { getUnreadMessageCount, listUserConversations, getConversationMessages, getMessage } from '@/lib/redis-utils';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' }, 
        { status: 400 }
      );
    }
    
    // Fetch conversation IDs for user from Redis
    const convIds = await listUserConversations(userId);

    const conversations = await Promise.all(
      convIds.map(async (convId) => {
        const parts = convId.replace('conv_', '').split('_');
        const otherUserId = parts.find((p) => p !== userId)!;

        // Try to resolve user metadata from DB (username, avatar)
        const user = await prisma.user.findUnique({ where: { id: otherUserId } });

        const msgIds = await getConversationMessages(convId, -1, -1); // get last message id
        let lastMsg: any = null;
        if (msgIds.length) {
          lastMsg = await getMessage(msgIds[0]);
        }

        const unreadCount = await getUnreadMessageCount(userId);

        return {
          userId: otherUserId,
          userName: user?.username ?? otherUserId.slice(0, 6),
          userAvatar: user?.profileImageUrl ?? null,
          lastMessage: lastMsg && typeof lastMsg === 'object' ? lastMsg.content ?? '' : '',
          lastMessageTime: lastMsg && typeof lastMsg === 'object' ? lastMsg.timestamp ?? new Date(0).toISOString() : new Date(0).toISOString(),
          unreadCount,
        };
      })
    );
    
    conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' }, 
      { status: 500 }
    );
  }
} 