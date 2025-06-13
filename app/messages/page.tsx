'use client';

import { Box, Container, Heading, Text } from '@chakra-ui/react';
import MessagingInterface from '@/components/MessagingInterface';

export default function MessagesPage() {
  // In a real app, you would get the current user ID from authentication
  const currentUserId = 'current_user_id';
  
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="2xl" mb={2}>
          Messages
        </Heading>
        <Text color="gray.500" mb={6}>
          Communicate with AIM developers and HyperBox owners
        </Text>
        
        <MessagingInterface currentUserId={currentUserId} />
      </Box>
    </Container>
  );
} 