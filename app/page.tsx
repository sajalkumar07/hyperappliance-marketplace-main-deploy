'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Box, Container, Heading, Text, SimpleGrid, Button, useColorMode } from '@chakra-ui/react';
import FeaturedListings from '@/components/FeaturedListings';
import Hero from '@/components/Hero';

export default function Home() {
  const { colorMode } = useColorMode();
  
  return (
    <div>
      <Hero 
        title="HyperAppliance AIMs Marketplace"
        subtitle="Discover, buy, and deploy AI Modules across multiple chains"
      />
      
      <Container maxW="container.xl" py={16}>
        <Box textAlign="center" mb={12}>
          <Heading as="h2" size="xl" mb={4}>
            Find AI Modules for Your Needs
          </Heading>
          <Text fontSize="lg" color={colorMode === 'light' ? "gray.600" : "gray.300"} maxW="3xl" mx="auto">
            Browse a wide selection of Artificial Intelligence Modules created by developers around the world. 
            Deploy them on your HyperAppliance or integrate them with your existing systems.
          </Text>
        </Box>

        <FeaturedListings />

        <Box mt={16} textAlign="center">
          <Heading as="h3" size="lg" mb={6}>
            Participate in the HyperCycle Ecosystem
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mx="auto" maxW="5xl">
            <Box p={6} boxShadow="md" borderRadius="lg" bg={colorMode === 'light' ? "white" : "gray.800"} borderWidth="1px" borderColor={colorMode === 'light' ? "gray.200" : "gray.700"}>
              <Heading as="h4" size="md" mb={4}>Buy AI Modules</Heading>
              <Text mb={4} color={colorMode === 'light' ? "gray.600" : "gray.300"}>Purchase cutting-edge AI solutions from developers around the world.</Text>
              <Link href="/marketplace">
                <Button colorScheme="blue">Browse Marketplace</Button>
              </Link>
            </Box>
            
            <Box p={6} boxShadow="md" borderRadius="lg" bg={colorMode === 'light' ? "white" : "gray.800"} borderWidth="1px" borderColor={colorMode === 'light' ? "gray.200" : "gray.700"}>
              <Heading as="h4" size="md" mb={4}>Sell Your AI</Heading>
              <Text mb={4} color={colorMode === 'light' ? "gray.600" : "gray.300"}>List your AI Modules on our marketplace and reach eager customers.</Text>
              <Link href="/create-listing">
                <Button colorScheme="blue">Create Listing</Button>
              </Link>
            </Box>
            
            <Box p={6} boxShadow="md" borderRadius="lg" bg={colorMode === 'light' ? "white" : "gray.800"} borderWidth="1px" borderColor={colorMode === 'light' ? "gray.200" : "gray.700"}>
              <Heading as="h4" size="md" mb={4}>Run on HyperAppliance</Heading>
              <Text mb={4} color={colorMode === 'light' ? "gray.600" : "gray.300"}>Deploy purchased modules directly on your HyperAI Box.</Text>
              <Link href="/deploy">
                <Button colorScheme="blue">Learn More</Button>
              </Link>
            </Box>
          </SimpleGrid>
        </Box>
      </Container>
    </div>
  );
} 