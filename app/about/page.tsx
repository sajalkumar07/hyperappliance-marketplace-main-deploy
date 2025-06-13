'use client';

import { Container, Box, Heading, Text, SimpleGrid, Image, Icon, VStack, Divider, useColorMode } from '@chakra-ui/react';
import { Server, Cpu, Globe, Zap, Users, Lock } from 'lucide-react';

export default function AboutPage() {
  const { colorMode } = useColorMode();
  
  return (
    <Container maxW="container.xl" py={12}>
      <VStack spacing={12} align="stretch">
        {/* Hero section */}
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={4}>
            About the HyperCycle Ecosystem
          </Heading>
          <Text fontSize="xl" maxW="3xl" mx="auto" color={colorMode === 'light' ? "gray.600" : "gray.300"}>
            Powering the decentralized Internet of AI with next-generation blockchain technology
          </Text>
        </Box>
        
        {/* HyperCycle section */}
        <Box>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <Box>
              <Heading as="h2" size="xl" mb={4}>
                HyperCycle
              </Heading>
              <Text fontSize="lg" mb={4} color={colorMode === 'light' ? "gray.700" : "gray.300"}>
                HyperCycle is a next-generation Layer-1 blockchain designed to power a decentralized "Internet of AI" by enabling massively scalable, low-cost infrastructure for AI agents.
              </Text>
              <Text mb={4} color={colorMode === 'light' ? "gray.700" : "gray.300"}>
                Its architecture allows independent AI micro-services (agents) to communicate with sub-second finality in a secure, peer-to-peer fashion. This vision of cooperative AI means any machine or node can partake in a global AI network, monetizing its computing power while contributing to a collective intelligence.
              </Text>
              <Text color={colorMode === 'light' ? "gray.700" : "gray.300"}>
                HyperCycle's focus is on building the network protocols and ledgerless blockchain tech (leveraging innovations from SingularityNET and TODA/IP) to support this AI agent ecosystem.
              </Text>
            </Box>
            <Box bg={colorMode === 'light' ? "blue.50" : "blue.900"} p={8} borderRadius="lg">
              <SimpleGrid columns={2} spacing={8}>
                <VStack>
                  <Icon as={Server} boxSize={10} color={colorMode === 'light' ? "blue.500" : "blue.300"} mb={2} />
                  <Heading as="h3" size="md">
                    Scalable
                  </Heading>
                  <Text textAlign="center">
                    Supports millions of AI agents with sub-second communication
                  </Text>
                </VStack>
                <VStack>
                  <Icon as={Cpu} boxSize={10} color={colorMode === 'light' ? "blue.500" : "blue.300"} mb={2} />
                  <Heading as="h3" size="md">
                    Decentralized
                  </Heading>
                  <Text textAlign="center">
                    No central authority controls the network of AI agents
                  </Text>
                </VStack>
                <VStack>
                  <Icon as={Zap} boxSize={10} color={colorMode === 'light' ? "blue.500" : "blue.300"} mb={2} />
                  <Heading as="h3" size="md">
                    Efficient
                  </Heading>
                  <Text textAlign="center">
                    Low energy consumption compared to traditional blockchains
                  </Text>
                </VStack>
                <VStack>
                  <Icon as={Lock} boxSize={10} color={colorMode === 'light' ? "blue.500" : "blue.300"} mb={2} />
                  <Heading as="h3" size="md">
                    Secure
                  </Heading>
                  <Text textAlign="center">
                    Advanced cryptography protects AI agent communications
                  </Text>
                </VStack>
              </SimpleGrid>
            </Box>
          </SimpleGrid>
        </Box>
        
        <Divider />
        
        {/* HyperAppliance section */}
        <Box>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <Box order={{ base: 1, md: 2 }}>
              <Heading as="h2" size="xl" mb={4}>
                HyperAppliance
              </Heading>
              <Text fontSize="lg" mb={4} color={colorMode === 'light' ? "gray.700" : "gray.300"}>
                HyperAppliance is a company complementing HyperCycle's network by providing plug-and-play hardware (e.g. the HyperAI Box) for users to easily run AI nodes at the edge.
              </Text>
              <Text mb={4} color={colorMode === 'light' ? "gray.700" : "gray.300"}>
                Their goal is to democratize AI computing—empowering anyone to host AI modules at home and earn from the AI economy. The HyperAI Box ("Neuron") devices are optimized to run HyperCycle nodes and AI agents on low power, making participation in the network accessible to everyday users.
              </Text>
              <Text color={colorMode === 'light' ? "gray.700" : "gray.300"}>
                This partnership between HyperCycle (network infrastructure) and HyperAppliance (edge hardware) accelerates the shared vision of a decentralized AI ecosystem.
              </Text>
            </Box>
            <Box bg={colorMode === 'light' ? "green.50" : "green.900"} p={8} borderRadius="lg" order={{ base: 2, md: 1 }}>
              <SimpleGrid columns={2} spacing={8}>
                <VStack>
                  <Icon as={Globe} boxSize={10} color={colorMode === 'light' ? "green.500" : "green.300"} mb={2} />
                  <Heading as="h3" size="md">
                    Accessible
                  </Heading>
                  <Text textAlign="center">
                    Plug-and-play devices for everyone to join the AI economy
                  </Text>
                </VStack>
                <VStack>
                  <Icon as={Users} boxSize={10} color={colorMode === 'light' ? "green.500" : "green.300"} mb={2} />
                  <Heading as="h3" size="md">
                    Community Driven
                  </Heading>
                  <Text textAlign="center">
                    Collaborative network of decentralized AI module providers
                  </Text>
                </VStack>
                <VStack>
                  <Icon as={Cpu} boxSize={10} color={colorMode === 'light' ? "green.500" : "green.300"} mb={2} />
                  <Heading as="h3" size="md">
                    Energy Efficient
                  </Heading>
                  <Text textAlign="center">
                    Low-power devices designed for 24/7 operation at the edge
                  </Text>
                </VStack>
                <VStack>
                  <Icon as={Zap} boxSize={10} color={colorMode === 'light' ? "green.500" : "green.300"} mb={2} />
                  <Heading as="h3" size="md">
                    Powerful
                  </Heading>
                  <Text textAlign="center">
                    Optimized hardware to run sophisticated AI modules locally
                  </Text>
                </VStack>
              </SimpleGrid>
            </Box>
          </SimpleGrid>
        </Box>
        
        <Divider />
        
        {/* AIMs Marketplace section */}
        <Box textAlign="center" mb={6}>
          <Heading as="h2" size="xl" mb={4}>
            AIMs Marketplace
          </Heading>
          <Text fontSize="lg" maxW="3xl" mx="auto" mb={6} color={colorMode === 'light' ? "gray.700" : "gray.300"}>
            The AIMs Marketplace is where HyperCycle's vision comes to life - a decentralized platform where AI Modules (AIMs) can be traded across multiple blockchains.
          </Text>
          <Text maxW="3xl" mx="auto" color={colorMode === 'light' ? "gray.700" : "gray.300"}>
            AIMs represent unique AI algorithms or services that can be deployed and traded on-chain as digital assets. The marketplace enables creators to list their AI modules for sale, while buyers can purchase, own, and deploy these modules - creating a vibrant ecosystem of specialized AI solutions.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
} 