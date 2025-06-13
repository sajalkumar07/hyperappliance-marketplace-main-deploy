'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Select,
  FormHelperText,
  Stack,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  Flex,
  useColorMode,
  Progress,
  HStack
} from '@chakra-ui/react';
import { Upload, AlertTriangle, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useWallet } from '@/lib/wallet/wallet-context';
import WalletConnectButton from '@/components/wallet/WalletConnectButton';

// Stable Step container component defined at module scope to preserve focus in form inputs
const StepContainer = ({ children }: { children: React.ReactNode }) => (
  <Box p={6} bg="whiteAlpha.50" borderRadius="md" w="full">
    {children}
  </Box>
);

export default function CreateListingWizard() {
  const toast = useToast();
  const { evmWallet } = useWallet();
  const { colorMode } = useColorMode();
  
  const isWalletConnected = !!evmWallet?.isConnected;
  
  // wizard state
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [chain, setChain] = useState('ethereum');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('eth');
  const [aimUri, setAimUri] = useState('');

  const next = () => setStep((s) => Math.min(s + 1, 2));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleCreate = async () => {
    // placeholder submission
    toast({ title: 'Listing created (stub)', status: 'success' });
  };
  
  if (!isWalletConnected) {
    return (
      <Container maxW="container.md" py={12}>
        <Box 
          textAlign="center" 
          p={8} 
          bg={colorMode === 'light' ? "white" : "gray.800"} 
          boxShadow="sm" 
          borderRadius="md"
          borderWidth="1px"
          borderColor={colorMode === 'light' ? "gray.200" : "gray.700"}
        >
          <Heading as="h1" size="xl" mb={6}>
            Connect Your Wallet
          </Heading>
          <Text color={colorMode === 'light' ? "gray.600" : "gray.300"} mb={8}>
            You need to connect your wallet before you can create a listing
          </Text>
          <WalletConnectButton />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={6}>List Your AI Module</Heading>
      <Progress value={(step / 2) * 100} mb={6} borderRadius="md" />

      {step === 0 && (
        <StepContainer>
          <Heading size="md" mb={4}>Step 1 – Details</Heading>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>AIM Title</FormLabel>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Descriptive title" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Describe capabilities and use cases" />
            </FormControl>
            <HStack justify="flex-end">
              <Button colorScheme="blue" rightIcon={<ArrowRight size={16} />} isDisabled={!title || !description} onClick={next}>Next</Button>
            </HStack>
          </Stack>
        </StepContainer>
      )}

      {step === 1 && (
        <StepContainer>
          <Heading size="md" mb={4}>Step 2 – Pricing & Chain</Heading>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Select Chain</FormLabel>
              <Select value={chain} onChange={(e) => setChain(e.target.value)}>
                <option value="ethereum">Ethereum</option>
                <option value="base" disabled>Base (coming soon)</option>
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Price</FormLabel>
              <HStack>
                <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Amount" type="number" min={0} />
                <Select w="120px" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="eth">ETH</option>
                  <option value="usdc">USDC</option>
                </Select>
              </HStack>
              <FormHelperText>Only ETH and USDC are supported at this time.</FormHelperText>
            </FormControl>
            {chain === 'base' && (
              <Alert status="info" borderRadius="md">
                <AlertIcon /> Listings on Base chain are coming soon.
              </Alert>
            )}
            <HStack justify="space-between">
              <Button leftIcon={<ArrowLeft size={16} />} onClick={prev}>Back</Button>
              <Button colorScheme="blue" rightIcon={<ArrowRight size={16} />} isDisabled={parseFloat(price) <= 0 || chain === 'base'} onClick={next}>Next</Button>
            </HStack>
          </Stack>
        </StepContainer>
      )}

      {step === 2 && (
        <StepContainer>
          <Heading size="md" mb={4}>Step 3 – Content & Publish</Heading>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>AIM Module URI</FormLabel>
              <Input value={aimUri} onChange={(e) => setAimUri(e.target.value)} placeholder="ipfs://... or https://github.com/..." />
            </FormControl>
            <Alert status="warning" borderRadius="md">
              <AlertIcon /> You will sign a transaction when submitting the listing.
            </Alert>
            <HStack justify="space-between">
              <Button leftIcon={<ArrowLeft size={16} />} onClick={prev}>Back</Button>
              <Button colorScheme="green" rightIcon={<CheckCircle size={16} />} isDisabled={!aimUri} onClick={handleCreate}>Create Listing</Button>
            </HStack>
          </Stack>
        </StepContainer>
      )}
    </Container>
  );
} 