'use client';

import { Box, Container, SimpleGrid, Stack, Text, Flex, Heading, Link, Icon, useColorMode } from '@chakra-ui/react';
import { Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const { colorMode } = useColorMode();
  
  return (
    <Box bg={colorMode === 'light' ? "gray.50" : "gray.900"} color={colorMode === 'light' ? "gray.700" : "gray.200"} mt={12}>
      <Container as={Stack} maxW={'container.xl'} py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack spacing={6}>
            <Box>
              <Heading size="md" mb={2}>AIMs Marketplace</Heading>
              <Text fontSize="sm">
                Powered by HyperCycle ecosystem
              </Text>
            </Box>
            <Stack direction={'row'} spacing={6}>
              <Link href="#">
                <Icon as={Twitter} w={5} h={5} />
              </Link>
              <Link href="#">
                <Icon as={Github} w={5} h={5} />
              </Link>
              <Link href="#">
                <Icon as={Linkedin} w={5} h={5} />
              </Link>
            </Stack>
          </Stack>
          
          <Stack align={'flex-start'}>
            <Heading as="h4" size="sm" mb={2}>Marketplace</Heading>
            <Link href="/marketplace">All AIMs</Link>
            <Link href="/marketplace?chain=ethereum">Ethereum</Link>
            <Link href="/marketplace?chain=cardano">Cardano</Link>
            <Link href="/marketplace?chain=polygon">Polygon</Link>
          </Stack>
          
          <Stack align={'flex-start'}>
            <Heading as="h4" size="sm" mb={2}>Resources</Heading>
            <Link href="/docs">Documentation</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/about">About HyperCycle</Link>
            <Link href="/hyperappliance">HyperAppliance</Link>
          </Stack>
          
          <Stack align={'flex-start'}>
            <Heading as="h4" size="sm" mb={2}>Legal</Heading>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/contact">Contact Us</Link>
          </Stack>
        </SimpleGrid>
      </Container>
      
      <Box borderTopWidth={1} borderStyle={'solid'} borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}>
        <Container
          as={Stack}
          maxW={'container.xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ md: 'space-between' }}
          align={{ md: 'center' }}>
          <Text>© 2023 HyperAppliance AIMs Marketplace. All rights reserved</Text>
        </Container>
      </Box>
    </Box>
  );
} 