import { NextResponse } from 'next/server';
import { 
  storeMessage, 
  addMessageToConversation, 
  getConversationMessages, 
  getMessage, 
  incrementUnreadCount 
} from '@/lib/redis-utils';
import { getIO } from '@/lib/socket';

// Send a new message
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { senderId, receiverId, content } = data;
    
    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: senderId, receiverId, and content are required' }, 
        { status: 400 }
      );
    }
    
    // Generate a message ID
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create message record
    const message = {
      id: messageId,
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Store the message in Redis
    await storeMessage(messageId, message);
    
    // Generate a conversation ID (sorted to ensure same ID regardless of who initiates)
    const participants = [senderId, receiverId].sort();
    const conversationId = `conv_${participants.join('_')}`;
    
    // Add the message to the conversation
    await addMessageToConversation(conversationId, messageId);
    
    // Increment unread count for receiver
    await incrementUnreadCount(receiverId);

    try {
      const io = getIO();
      io.to(receiverId).emit('message:new', message);
      io.to(senderId).emit('message:new', message);
    } catch (e) {/* socket not ready */}

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get conversation messages
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user1 = searchParams.get('user1');
    const user2 = searchParams.get('user2');
    
    if (!user1 || !user2) {
      return NextResponse.json(
        { error: 'Missing required parameters: user1 and user2 are required' }, 
        { status: 400 }
      );
    }
    
    // Generate the conversation ID
    const participants = [user1, user2].sort();
    const conversationId = `conv_${participants.join('_')}`;
    
    // Get message IDs from the conversation
    const messageIds = await getConversationMessages(conversationId);
    
    // Fetch each message
    const messages = await Promise.all(
      messageIds.map(async (messageId) => {
        return getMessage(messageId);
      })
    );
    
    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 