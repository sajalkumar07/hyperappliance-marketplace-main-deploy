//app/my-aims/page.tsx
'use client';

import {
  Container,
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  HStack,
  Badge,
  Select,
  useColorMode,
  VStack,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { useWallet } from '@/lib/wallet/wallet-context';
import AIMCard from '@/components/AIMCard';
import { Search, Filter, Play, Pause, Download, Trash, Settings } from 'lucide-react';
import { useState } from 'react';

// Mock data for owned AIMs
const mockOwnedAIMs = [
  {
    id: '1',
    title: 'Natural Language Processing Model',
    description: 'Advanced NLP model for text analysis and sentiment detection. Compatible with HyperAppliance.',
    price: 0.05,
    currency: 'ETH',
    chain: 'ethereum',
    seller: '0x1a2b3c...',
    image: '/placeholder-1.jpg',
  },
  {
    id: '2',
    title: 'Computer Vision Module',
    description: 'Object detection and image recognition for security applications.',
    price: 100,
    currency: 'ADA',
    chain: 'cardano',
    seller: 'addr1q9ja...',
    image: '/placeholder-2.jpg',
  },
  {
    id: '3',
    title: 'Time Series Prediction Engine',
    description: 'Forecasting module for financial data and market trends with high accuracy.',
    price: 0.01,
    currency: 'ETH',
    chain: 'polygon',
    seller: '0x4d5e6f...',
    image: '/placeholder-3.jpg',
  },
];

// Mock data for active deployments
const mockDeployments = [
  {
    id: '1',
    aimId: '1',
    aimName: 'Natural Language Processing Model',
    status: 'running',
    hyperBox: 'HyperAI Box Pro',
    startTime: '2023-06-15T12:00:00Z',
    endpoint: 'https://api.hyperbox.io/deployments/abc123',
    uptime: '14 days',
    cpu: '25%',
    memory: '320MB',
  },
  {
    id: '2',
    aimId: '2',
    aimName: 'Computer Vision Module',
    status: 'paused',
    hyperBox: 'HyperAI Box Pro',
    startTime: '2023-07-02T09:30:00Z',
    endpoint: 'https://api.hyperbox.io/deployments/def456',
    uptime: '3 days',
    cpu: '0%',
    memory: '120MB',
  },
];

export default function MyAIMsPage() {
  const { colorMode } = useColorMode();
  const { evmWallet, cardanoWallet } = useWallet();
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [chainFilter, setChainFilter] = useState('all');
  
  // Check if any wallet is connected
  const isWalletConnected = evmWallet?.isConnected || cardanoWallet?.isConnected;
  
  // Filter AIMs based on search and chain
  const filteredAIMs = mockOwnedAIMs.filter(aim => {
    const matchesSearch = aim.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       aim.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChain = chainFilter === 'all' || aim.chain === chainFilter;
    
    return matchesSearch && matchesChain;
  });
  
  // Deploy an AIM to a HyperBox
  const deployAIM = (aimId: string) => {
    console.log(`Deploying AIM ${aimId}`);
    // In a real app, this would trigger a deployment flow
  };
  
  // Manage a deployment
  const manageDeployment = (action: 'start' | 'pause' | 'stop' | 'settings', deploymentId: string) => {
    console.log(`${action} deployment ${deploymentId}`);
    // In a real app, this would call the appropriate API
  };
  
  if (!isWalletConnected) {
    return (
      <Container maxW="container.lg" py={10}>
        <Box 
          p={8} 
          borderRadius="md" 
          bg={colorMode === 'light' ? "white" : "gray.800"}
          borderWidth="1px"
          borderColor={colorMode === 'light' ? "gray.200" : "gray.700"}
          textAlign="center"
        >
          <Heading as="h2" mb={4}>Connect Your Wallet</Heading>
          <Text mb={6}>Please connect your wallet to view your AIMs</Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Heading as="h1" mb={6}>My AIMs</Heading>
      
      <Tabs colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab>All AIMs</Tab>
          <Tab>Active Deployments</Tab>
          <Tab>Deployment History</Tab>
        </TabList>
        
        <TabPanels>
          {/* All AIMs Tab */}
          <TabPanel>
            <Box mb={6}>
              <HStack spacing={4} mb={4}>
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <Search size={18} />
                  </InputLeftElement>
                  <Input 
                    placeholder="Search your AIMs..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
                
                <Select 
                  placeholder="Filter by chain" 
                  value={chainFilter}
                  onChange={(e) => setChainFilter(e.target.value)}
                  maxW="200px"
                >
                  <option value="all">All chains</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="cardano">Cardano</option>
                  <option value="polygon">Polygon</option>
                  <option value="base">Base</option>
                </Select>
              </HStack>
              
              {filteredAIMs.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredAIMs.map(aim => (
                    <Box 
                      key={aim.id} 
                      position="relative"
                    >
                      <AIMCard
                        id={aim.id}
                        name={aim.title}
                        description={aim.description}
                        image={aim.image}
                        developer={{ id: aim.chain, name: aim.seller }}
                        price={aim.price.toString()}
                        currency={aim.currency}
                      />
                      <HStack 
                        mt={2} 
                        justify="flex-end"
                      >
                        <Button 
                          leftIcon={<Play size={16} />} 
                          size="sm" 
                          colorScheme="green"
                          onClick={() => deployAIM(aim.id)}
                        >
                          Deploy
                        </Button>
                        <Button 
                          leftIcon={<Download size={16} />} 
                          size="sm"
                          variant="outline"
                        >
                          Download
                        </Button>
                      </HStack>
                    </Box>
                  ))}
                </SimpleGrid>
              ) : (
                <Box 
                  p={8} 
                  borderRadius="md" 
                  borderWidth="1px"
                  borderColor={colorMode === 'light' ? "gray.200" : "gray.700"}
                  textAlign="center"
                >
                  <Text mb={4}>No AIMs found matching your criteria</Text>
                  <Button colorScheme="blue">Browse Marketplace</Button>
                </Box>
              )}
            </Box>
          </TabPanel>
          
          {/* Active Deployments Tab */}
          <TabPanel>
            <Heading as="h3" size="md" mb={6}>Active Deployments</Heading>
            
            {mockDeployments.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {mockDeployments.map(deployment => (
                  <Box 
                    key={deployment.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={colorMode === 'light' ? "gray.200" : "gray.700"}
                  >
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Heading size="sm">{deployment.aimName}</Heading>
                        <HStack>
                          <Badge colorScheme={deployment.status === 'running' ? 'green' : 'yellow'}>
                            {deployment.status}
                          </Badge>
                          <Text fontSize="sm">on {deployment.hyperBox}</Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                          Uptime: {deployment.uptime} | CPU: {deployment.cpu} | Memory: {deployment.memory}
                        </Text>
                        <Text fontSize="xs">
                          Endpoint: {deployment.endpoint}
                        </Text>
                      </VStack>
                      
                      <HStack>
                        {deployment.status === 'running' ? (
                          <IconButton
                            aria-label="Pause deployment"
                            icon={<Pause size={16} />}
                            size="sm"
                            colorScheme="yellow"
                            onClick={() => manageDeployment('pause', deployment.id)}
                          />
                        ) : (
                          <IconButton
                            aria-label="Start deployment"
                            icon={<Play size={16} />}
                            size="sm"
                            colorScheme="green"
                            onClick={() => manageDeployment('start', deployment.id)}
                          />
                        )}
                        <IconButton
                          aria-label="Stop deployment"
                          icon={<Trash size={16} />}
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => manageDeployment('stop', deployment.id)}
                        />
                        <IconButton
                          aria-label="Deployment settings"
                          icon={<Settings size={16} />}
                          size="sm"
                          onClick={() => manageDeployment('settings', deployment.id)}
                        />
                      </HStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Box 
                p={8} 
                borderRadius="md" 
                borderWidth="1px"
                borderColor={colorMode === 'light' ? "gray.200" : "gray.700"}
                textAlign="center"
              >
                <Text mb={4}>You don't have any active deployments</Text>
                <Button colorScheme="green">Deploy an AIM</Button>
              </Box>
            )}
          </TabPanel>
          
          {/* Deployment History Tab */}
          <TabPanel>
            <Heading as="h3" size="md" mb={6}>Deployment History</Heading>
            <Box 
              p={8} 
              borderRadius="md" 
              borderWidth="1px"
              borderColor={colorMode === 'light' ? "gray.200" : "gray.700"}
              textAlign="center"
            >
              <Text>No recent deployment history</Text>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
} 