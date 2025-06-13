//app/profile/page.tsx
'use client';

import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Avatar,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorMode,
  Input,
  FormControl,
  FormLabel,
  Divider,
  SimpleGrid,
  Badge,
  useToast,
  useDisclosure
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/wallet/wallet-context';
import { Edit, Save, Link, Unlink } from 'lucide-react';
import AIMCard from '@/components/AIMCard';
import MessagingInterface from '@/components/MessagingInterface';
import OnboardHyperBoxModal from '@/components/OnboardHyperBoxModal';

// Mock data for AIMs
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
];

// Mock data for created AIMs
const mockCreatedAIMs = [
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

type HyperBox = {
  id: string;
  name: string;
  status?: 'active' | 'idle';
  available?: boolean;
  location?: string;
  specs: {
    gpu?: string;
    ram?: string;
    cpu?: string;
    location?: string;
  };
  activeDeployments?: number;
  nodeUrl?: string;
};

export default function ProfilePage() {
  const { colorMode } = useColorMode();
  const { evmWallet, cardanoWallet } = useWallet();
  const toast = useToast();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [username, setUsername] = useState('AnonymousUser');
  const [bio, setBio] = useState('AI developer and enthusiast');

  // Check if any wallet is connected
  const isWalletConnected = evmWallet?.isConnected || cardanoWallet?.isConnected;
  
  // Save profile changes
  const saveProfile = () => {
    // In a real app, this would send data to the backend
    setIsEditingProfile(false);
    toast({
      title: 'Profile updated',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Wallet display and linking section
  const WalletSection = () => (
    <Box mt={6}>
      <Heading as="h3" size="md" mb={4}>
        Linked Wallets
      </Heading>
      <VStack spacing={4} align="stretch">
        <HStack 
          p={4} 
          borderWidth="1px" 
          borderRadius="md" 
          borderColor={colorMode === 'light' ? "gray.200" : "gray.700"}
          justify="space-between"
        >
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">EVM Wallet</Text>
            <Text fontSize="sm" color="gray.500">
              {evmWallet?.isConnected 
                ? `${evmWallet.address.slice(0, 8)}...${evmWallet.address.slice(-6)}`
                : 'Not connected'
              }
            </Text>
          </VStack>
          <Button 
            size="sm" 
            colorScheme={evmWallet?.isConnected ? "red" : "blue"}
            leftIcon={evmWallet?.isConnected ? <Unlink size={16} /> : <Link size={16} />}
          >
            {evmWallet?.isConnected ? 'Unlink' : 'Link'}
          </Button>
        </HStack>
        
        <HStack 
          p={4} 
          borderWidth="1px" 
          borderRadius="md" 
          borderColor={colorMode === 'light' ? "gray.200" : "gray.700"}
          justify="space-between"
        >
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">Cardano Wallet</Text>
            <Text fontSize="sm" color="gray.500">
              {cardanoWallet?.isConnected 
                ? `${cardanoWallet.address.slice(0, 8)}...${cardanoWallet.address.slice(-6)}`
                : 'Not connected'
              }
            </Text>
          </VStack>
          <Button 
            size="sm" 
            colorScheme={cardanoWallet?.isConnected ? "red" : "blue"}
            leftIcon={cardanoWallet?.isConnected ? <Unlink size={16} /> : <Link size={16} />}
          >
            {cardanoWallet?.isConnected ? 'Unlink' : 'Link'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );

  // HyperBox state + modal
  const [hyperBoxes, setHyperBoxes] = useState<HyperBox[]>([]);
  const { isOpen: hbOpen, onOpen: openHb, onClose: closeHb } = useDisclosure();

  // Fetch owned hyperboxes
  useEffect(() => {
    fetch('/api/hyperboxes?owner=me')
      .then(r => r.json())
      .then(json => setHyperBoxes(json.hyperboxes || []))
      .catch(console.error);
  }, []);

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
          <Text mb={6}>Please connect your wallet to view your profile</Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Box 
        p={8} 
        borderRadius="md" 
        bg={colorMode === 'light' ? "white" : "gray.800"}
        borderWidth="1px"
        borderColor={colorMode === 'light' ? "gray.200" : "gray.700"}
      >
        <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'center', md: 'start' }} gap={8}>
          <Avatar 
            size="2xl" 
            name={username} 
            src="/avatar-placeholder.jpg"
            bg="blue.500" 
          />
          
          <VStack align="start" flex={1} spacing={4}>
            {isEditingProfile ? (
              <VStack spacing={4} align="stretch" w="full">
                <FormControl>
                  <FormLabel>Username</FormLabel>
                  <Input 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username" 
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Bio</FormLabel>
                  <Input 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself" 
                  />
                </FormControl>
                
                <HStack>
                  <Button 
                    leftIcon={<Save size={16} />} 
                    colorScheme="blue" 
                    onClick={saveProfile}
                  >
                    Save Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <>
                <Flex 
                  w="full" 
                  justify="space-between" 
                  align="center"
                >
                  <Heading as="h1" size="xl">{username}</Heading>
                  <Button 
                    leftIcon={<Edit size={16} />} 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    Edit Profile
                  </Button>
                </Flex>
                <Text color={colorMode === 'light' ? "gray.600" : "gray.300"}>
                  {bio}
                </Text>
                
                <WalletSection />
              </>
            )}
          </VStack>
        </Flex>
      </Box>
      
      <Box mt={10}>
        <Tabs colorScheme="blue" variant="enclosed">
          <TabList>
            <Tab>My AIMs</Tab>
            <Tab>Created AIMs</Tab>
            <Tab>HyperBoxes</Tab>
            <Tab>Messages</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <Heading as="h3" size="md" mb={6}>AIMs I Own</Heading>
              {mockOwnedAIMs.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {mockOwnedAIMs.map(aim => (
                    <AIMCard
                      key={aim.id}
                      id={aim.id}
                      name={aim.title}
                      description={aim.description}
                      image={aim.image}
                      developer={{ id: aim.chain, name: aim.seller }}
                      price={aim.price.toString()}
                      currency={aim.currency}
                    />
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
                  <Text mb={4}>You don't own any AIMs yet</Text>
                  <Button colorScheme="blue">Browse Marketplace</Button>
                </Box>
              )}
            </TabPanel>
            
            <TabPanel>
              <Heading as="h3" size="md" mb={6}>AIMs I've Created</Heading>
              {mockCreatedAIMs.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {mockCreatedAIMs.map(aim => (
                    <AIMCard
                      key={aim.id}
                      id={aim.id}
                      name={aim.title}
                      description={aim.description}
                      image={aim.image}
                      developer={{ id: aim.chain, name: aim.seller }}
                      price={aim.price.toString()}
                      currency={aim.currency}
                    />
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
                  <Text mb={4}>You haven't created any AIMs yet</Text>
                  <Button colorScheme="blue">Create AIM</Button>
                </Box>
              )}
            </TabPanel>
            
            <TabPanel>
              <Heading as="h3" size="md" mb={6}>My HyperBoxes</Heading>
              {hyperBoxes.length > 0 ? (
                <VStack spacing={4} align="stretch">
                  {hyperBoxes.map(box => (
                    <HStack 
                      key={box.id}
                      p={4} 
                      borderWidth="1px" 
                      borderRadius="md" 
                      borderColor={colorMode === 'light' ? "gray.200" : "gray.700"}
                      justify="space-between"
                    >
                      <VStack align="start" spacing={1}>
                        <Heading size="sm">{box.name}</Heading>
                        <Text fontSize="sm">
                          {[box.specs.cpu, box.specs.gpu, box.specs.ram]
                            .filter(Boolean)
                            .join(' / ')}
                        </Text>
                        <Text fontSize="xs" color="gray.500">Location: {box.location}</Text>
                        <HStack>
                          <Badge colorScheme={(box.status ?? (box.available ? 'active' : 'idle')) === 'active' ? 'green' : 'gray'}>
                            {box.status ?? (box.available ? 'active' : 'idle')}
                          </Badge>
                          <Badge colorScheme="blue">
                            {box.activeDeployments} active deployment{box.activeDeployments !== 1 ? 's' : ''}
                          </Badge>
                        </HStack>
                      </VStack>
                      <Button size="sm" colorScheme="blue">Manage</Button>
                    </HStack>
                  ))}
                  <Box textAlign="center" mt={4}>
                    <Button colorScheme="blue" onClick={openHb}>Register New HyperBox</Button>
                  </Box>
                </VStack>
              ) : (
                <Box 
                  p={8} 
                  borderRadius="md" 
                  borderWidth="1px"
                  borderColor={colorMode === 'light' ? "gray.200" : "gray.700"}
                  textAlign="center"
                >
                  <Text mb={4}>You don't have any HyperBoxes registered</Text>
                  <Button colorScheme="blue" onClick={openHb}>Register HyperBox</Button>
                </Box>
              )}
            </TabPanel>
            
            <TabPanel>
              <Heading as="h3" size="md" mb={6}>Message History</Heading>
              <MessagingInterface currentUserId={evmWallet?.address || 'current_user_id'} hideInput />
              <OnboardHyperBoxModal
                isOpen={hbOpen}
                onClose={closeHb}
                onSuccess={(b) => setHyperBoxes(prev => [...prev, b])}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
} 