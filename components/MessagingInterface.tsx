'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Avatar,
  Flex,
  Divider,
  Heading,
  useColorModeValue,
  Spinner,
  Badge,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { Send, RefreshCw, Plus } from 'lucide-react';
import io from 'socket.io-client';

// Define types
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

interface MessagingInterfaceProps {
  currentUserId: string;
  hideInput?: boolean;
}

export default function MessagingInterface({ currentUserId, hideInput = false }: MessagingInterfaceProps) {
  // State for conversations and messages
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Colors for UI elements
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const selectedBgColor = useColorModeValue('blue.50', 'blue.900');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  
  // compose new chat modal
  const { isOpen: isComposeOpen, onOpen: openCompose, onClose: closeCompose } = useDisclosure();
  const [newReceiverId, setNewReceiverId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  
  const ASSISTANT_ID = 'hyper_t_ai';
  
  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const res = await fetch(`/api/messages/conversations?userId=${currentUserId}`);
      const json = await res.json();
      setConversations(json.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingConversations(false);
      // Ensure Hyper-T AI pseudo-conversation exists
      setConversations((prev) => {
        const exists = prev.some((c) => c.userId === ASSISTANT_ID);
        if (exists) return prev;
        return [
          {
            userId: ASSISTANT_ID,
            userName: 'Hyper-T AI',
            userAvatar: '/hyper-t.png',
            lastMessage: 'Ask me anything about the marketplace!',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
          },
          ...prev,
        ];
      });
    }
  }, [currentUserId]);

  useEffect(() => {
    loadConversations();
    const id = setInterval(loadConversations, 5000);
    return () => clearInterval(id);
  }, [loadConversations]);

  // Fetch messages for the selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;
      
      try {
        setIsLoadingMessages(true);
        // In a real app, this would fetch from your API
        const response = await fetch(`/api/messages?user1=${currentUserId}&user2=${selectedConversation}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const data = await response.json();
        setMessages(data.messages || []);
        
        // Mark messages as read
        markMessagesAsRead(selectedConversation);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedConversation, currentUserId, toast]);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read when conversation is selected
  const markMessagesAsRead = async (userId: string) => {
    try {
      // Update the conversation in the list to clear unread count
      setConversations(prev => prev.map(conv => 
        conv.userId === userId ? { ...conv, unreadCount: 0 } : conv
      ));
      
      // In a real app, you would call your API to mark messages as read
      await fetch(`/api/messages/read?sender=${userId}&receiver=${currentUserId}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (hideInput) return;
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      setIsSending(true);
      
      if (selectedConversation === ASSISTANT_ID) {
        // call assistant API directly
        const res = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: messageInput.trim() }),
        });
        const data = await res.json();

        const userMsg: Message = {
          id: `u-${Date.now()}`,
          senderId: currentUserId,
          receiverId: ASSISTANT_ID,
          content: messageInput.trim(),
          timestamp: new Date().toISOString(),
          read: true,
        };

        setMessages((prev) => [...prev, userMsg]);

        if (data.reply) {
          const aiMsg: Message = {
            id: `a-${Date.now()}`,
            senderId: ASSISTANT_ID,
            receiverId: currentUserId,
            content: data.reply,
            timestamp: new Date().toISOString(),
            read: true,
          };
          setMessages((prev) => [...prev, aiMsg]);
        } else {
          toast({ title: 'Assistant Error', description: data.error || 'Unknown error', status: 'error' });
        }
        setMessageInput('');
        return;
      }
      
      // Call your API to send the message
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: selectedConversation,
          content: messageInput.trim(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      // Optimistically add the message to the UI
      const newMessage: Message = {
        id: data.message.id,
        senderId: currentUserId,
        receiverId: selectedConversation,
        content: messageInput.trim(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Update the conversation in the list
      setConversations(prev => prev.map(conv => 
        conv.userId === selectedConversation ? { 
          ...conv, 
          lastMessage: messageInput.trim(),
          lastMessageTime: new Date().toISOString(),
        } : conv
      ));
      
      // Clear the input
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handle pressing Enter to send a message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Refresh the messages list
  const refreshMessages = () => {
    if (!selectedConversation) return;
    
    const fetchMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const response = await fetch(`/api/messages?user1=${currentUserId}&user2=${selectedConversation}`);
        
        if (!response.ok) {
          throw new Error('Failed to refresh messages');
        }
        
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Error refreshing messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to refresh messages',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  };

  // Format timestamp for display
  const formatMessageTime = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} mins ago`;
    } else if (diffHours < 24) {
      return `${diffHours} h ago`;
    } else if (diffDays < 7) {
      return `${diffDays} d ago`;
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  // socket setup
  useEffect(() => {
    const socket = io('/', {
      path: '/api/socketio',
      query: { userId: currentUserId },
    });

    socket.on('message:new', (msg: Message) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.userId === (msg.senderId === currentUserId ? msg.receiverId : msg.senderId));
        if (idx >= 0) {
          const conv = { ...prev[idx] };
          conv.lastMessage = msg.content;
          conv.lastMessageTime = msg.timestamp;
          if (msg.receiverId === currentUserId) {
            conv.unreadCount += 1;
          }
          const newArr = [...prev];
          newArr[idx] = conv;
          return newArr;
        }
        return prev;
      });

      if (selectedConversation === msg.senderId || selectedConversation === msg.receiverId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId, selectedConversation]);

  // start a brand-new conversation
  const startNewConversation = async () => {
    if (!newReceiverId.trim() || !newMessage.trim()) return;
    try {
      setIsSending(true);
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: newReceiverId.trim(),
          content: newMessage.trim(),
        }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      // ensure conversation list reloads
      await loadConversations();
      setSelectedConversation(newReceiverId.trim());
      setMessageInput('');
      setNewReceiverId('');
      setNewMessage('');
      closeCompose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error', duration: 3000 });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Flex h="700px" borderWidth="1px" borderRadius="lg" overflow="hidden" borderColor={borderColor}>
      {/* Conversations sidebar */}
      <Box w="300px" borderRightWidth="1px" borderColor={borderColor} bg={bgColor}>
        <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
          <HStack justify="space-between">
            <Heading size="md">Messages</Heading>
            {!hideInput && (
              <IconButton
                aria-label="New chat"
                icon={<Plus size={18} />}
                size="sm"
                variant="ghost"
                onClick={openCompose}
              />
            )}
          </HStack>
        </Box>
        
        {isLoadingConversations ? (
          <Flex justify="center" align="center" p={10}>
            <Spinner />
          </Flex>
        ) : (
          <VStack spacing={0} align="stretch" overflowY="auto" maxH="calc(700px - 64px)">
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <Box 
                  key={conversation.userId}
                  p={3} 
                  cursor="pointer"
                  bg={selectedConversation === conversation.userId ? selectedBgColor : 'transparent'}
                  _hover={{ bg: selectedConversation === conversation.userId ? selectedBgColor : hoverBgColor }}
                  onClick={() => setSelectedConversation(conversation.userId)}
                >
                  <HStack spacing={3} position="relative">
                    <Avatar 
                      size="md" 
                      name={conversation.userName} 
                      src={conversation.userAvatar} 
                    />
                    <Box flex="1" isTruncated>
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="bold">{conversation.userName}</Text>
                        {conversation.lastMessageTime && (
                          <Text fontSize="xs" color="gray.500">
                            {formatMessageTime(conversation.lastMessageTime)}
                          </Text>
                        )}
                      </Flex>
                      <Text fontSize="sm" isTruncated color="gray.500">
                        {conversation.lastMessage || 'No messages yet'}
                      </Text>
                    </Box>
                    {conversation.unreadCount > 0 && (
                      <Badge 
                        colorScheme="blue" 
                        borderRadius="full" 
                        px={2} 
                        position="absolute"
                        right={0}
                        top={0}
                      >
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              ))
            ) : (
              <Box textAlign="center" p={6} color="gray.500">
                <VStack spacing={4}>
                  <Text>No conversations yet</Text>
                  {!hideInput && (
                    <Button size="sm" leftIcon={<Plus size={16} />} onClick={openCompose}>
                      Start a chat
                    </Button>
                  )}
                </VStack>
              </Box>
            )}
          </VStack>
        )}
      </Box>
      
      {/* Messages area */}
      <Box flex="1" display="flex" flexDirection="column" bg={bgColor}>
        {selectedConversation ? (
          <>
            {/* Conversation header */}
            <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
              <HStack justify="space-between">
                <HStack>
                  <Avatar 
                    size="sm" 
                    name={conversations.find(c => c.userId === selectedConversation)?.userName} 
                    src={conversations.find(c => c.userId === selectedConversation)?.userAvatar} 
                  />
                  <Heading size="md">
                    {conversations.find(c => c.userId === selectedConversation)?.userName}
                  </Heading>
                </HStack>
                <IconButton
                  aria-label="Refresh messages"
                  icon={<RefreshCw size={18} />}
                  size="sm"
                  onClick={refreshMessages}
                  isLoading={isLoadingMessages}
                />
              </HStack>
            </Box>
            
            {/* Messages */}
            <VStack 
              flex="1" 
              p={4} 
              spacing={4} 
              align="stretch" 
              overflowY="auto"
              sx={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'gray.300',
                  borderRadius: '24px',
                },
              }}
            >
              {isLoadingMessages ? (
                <Flex justify="center" align="center" h="100%">
                  <Spinner />
                </Flex>
              ) : messages.length > 0 ? (
                <>
                  {messages.map((message) => {
                    const isCurrentUser = message.senderId === currentUserId;
                    return (
                      <Flex key={message.id} justify={isCurrentUser ? 'flex-end' : 'flex-start'}>
                        <Box 
                          maxW="70%" 
                          bg={isCurrentUser ? 'blue.500' : useColorModeValue('gray.100', 'gray.700')}
                          color={isCurrentUser ? 'white' : 'inherit'}
                          borderRadius="lg"
                          px={4}
                          py={2}
                        >
                          <Text>{message.content}</Text>
                          <Text fontSize="xs" textAlign="right" mt={1} opacity={0.8}>
                            {formatMessageTime(message.timestamp)}
                          </Text>
                        </Box>
                      </Flex>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <Flex justify="center" align="center" h="100%" color="gray.500">
                  No messages yet. Start the conversation!
                </Flex>
              )}
            </VStack>
            
            {/* Message input */}
            {!hideInput && (
              <Box p={4} borderTopWidth="1px" borderColor={borderColor}>
                <HStack>
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    variant="filled"
                  />
                  <Button
                    colorScheme="blue"
                    onClick={sendMessage}
                    isLoading={isSending}
                    leftIcon={<Send size={18} />}
                  >
                    Send
                  </Button>
                </HStack>
              </Box>
            )}
          </>
        ) : (
          <Flex justify="center" align="center" h="100%" color="gray.500">
            Select a conversation to start messaging
          </Flex>
        )}
      </Box>
      {/* Compose Modal */}
      <Modal isOpen={isComposeOpen} onClose={closeCompose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Message</ModalHeader>
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Recipient user ID / address</FormLabel>
              <Input value={newReceiverId} onChange={(e) => setNewReceiverId(e.target.value)} placeholder="0x... or userId" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Message</FormLabel>
              <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Hi there!" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button variant="ghost" onClick={closeCompose}>Cancel</Button>
              <Button colorScheme="blue" isLoading={isSending} onClick={startNewConversation}>Send</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
} 