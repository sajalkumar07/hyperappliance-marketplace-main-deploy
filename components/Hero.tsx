'use client';

import { Box, Container, Heading, Text, Button, Stack, VStack, Image, useColorMode } from '@chakra-ui/react';
import Link from 'next/link';

interface HeroProps {
  title: string;
  subtitle: string;
}

export default function Hero({ title, subtitle }: HeroProps) {
  const { colorMode } = useColorMode();
  
  return (
    <Box 
      position="relative" 
      bg={colorMode === 'light' ? "blue.600" : "blue.900"}
      color="white" 
      overflow="hidden"
    >
      {/* Background pattern */}
      <Box position="absolute" top={0} left={0} right={0} bottom={0} opacity={colorMode === 'light' ? 0.1 : 0.15}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </Box>
      
      <Container maxW="container.xl" py={{ base: 16, md: 24 }} position="relative">
        <Stack 
          direction={{ base: 'column', md: 'row' }} 
          spacing={10} 
          align="center"
          justify="space-between"
        >
          <VStack spacing={6} align="flex-start" maxW="container.md">
            <Heading 
              as="h1" 
              size="3xl" 
              fontWeight="bold"
              lineHeight="shorter"
            >
              {title}
            </Heading>
            
            <Text fontSize="xl">
              {subtitle}
            </Text>
            
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} mt={4}>
              <Link href="/marketplace">
                <Button colorScheme="whiteAlpha" variant="outline" size="lg">
                  Explore AIMs
                </Button>
              </Link>
              <Link href="/create-listing">
                <Button colorScheme="whiteAlpha" variant="solid" bg="white" color={colorMode === 'light' ? "blue.600" : "blue.700"} size="lg">
                  List Your AI Module
                </Button>
              </Link>
            </Stack>
          </VStack>
          
          <Box 
            display={{ base: 'none', md: 'block' }}
            position="relative" 
            width="450px" 
            height="300px"
          >
            {/* Placeholder for a hero image */}
            <Box 
              width="100%"
              height="100%"
              borderRadius="md"
              bg="whiteAlpha.300"
              backdropFilter="blur(8px)"
              boxShadow="xl"
              overflow="hidden"
              position="relative"
            >
              <Box 
                position="absolute" 
                top="50%" 
                left="50%" 
                transform="translate(-50%, -50%)"
                textAlign="center"
              >
                <Text fontSize="lg" fontWeight="bold">AI Module Marketplace</Text>
                <Text fontSize="sm">Connect, Trade, Deploy</Text>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
} 