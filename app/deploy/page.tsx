'use client';

import { Box, Container, Heading, Text } from '@chakra-ui/react';
import DeployWizard from '@/components/DeployWizard';
import { useSearchParams } from 'next/navigation';

export default function DeployPage() {
  const searchParams = useSearchParams();
  const aimId = searchParams?.get?.('aimId') || null;
  
  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="2xl" mb={2}>
          Deploy AI Module
        </Heading>
        <Text color="gray.500" mb={6}>
          Walk through the wizard to deploy your AIM on a HyperBox.
        </Text>
        
        <DeployWizard initialAimId={aimId || undefined} />
      </Box>
    </Container>
  );
} 