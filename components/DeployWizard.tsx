//components/DeployWizard.tsx
// A simple multi-step wizard for deploying an AIM to a HyperBox
// NOTE: This is an initial UI-only skeleton. Integration with backend APIs
// (payment channel, node-manager deploy, etc.) will be wired up in subsequent
// iterations.
'use client';

import { useState, useEffect, ReactNode } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Progress,
  Select,
  Stack,
  Text,
  useToast,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Input,
  useDisclosure,
} from '@chakra-ui/react';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { usePaymentChannel } from '@/lib/hooks/usePaymentChannel';
import OnboardHyperBoxModal from '@/components/OnboardHyperBoxModal';

interface AIM {
  id: string;
  name: string;
  developer: {
    name: string;
  };
  requiredSpecs: {
    gpu?: string;
    ram?: string;
    cpu?: string;
  };
}

interface HyperBox {
  id: string;
  name: string;
  owner: {
    name: string;
  };
  specs: {
    gpu: string;
    ram: string;
    cpu: string;
    location: string;
  };
  available: boolean;
}

const StepContainer = ({ children }: { children: ReactNode }) => (
  <Box p={6} bg="whiteAlpha.50" borderRadius="md" w="full">
    {children}
  </Box>
);

const NODE_URL = process.env.NEXT_PUBLIC_NODE_URL || 'http://localhost:8000';
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x0000000000000000000000000000000000000000';

export default function DeployWizard({ initialAimId }: { initialAimId?: string } = {}) {
  const [step, setStep] = useState(0);
  const [aims, setAIMs] = useState<AIM[]>([]);
  const [hyperBoxes, setHyperBoxes] = useState<HyperBox[]>([]);
  const { isOpen: hbOpen, onOpen: openHb, onClose: closeHb } = useDisclosure();

  const [selectedAimId, setSelectedAimId] = useState<string>(initialAimId || '');
  const [selectedHyperBoxId, setSelectedHyperBoxId] = useState<string>('');
  const [nodeUrl, setNodeUrl] = useState<string>(process.env.NEXT_PUBLIC_DEMO_DEPLOY === 'true' ? 'mock' : '');
  const [dockerImage, setDockerImage] = useState<string>('ghcr.io/hypercycle-development/basic_example:0.1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  // payment channel
  const { channel, loading: paying, error: payError, open: openPay } = usePaymentChannel(NODE_URL, USDC_ADDRESS);

  // Fetch AIMs & HyperBoxes once
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [aimRes, boxRes] = await Promise.all([
          fetch('/api/aims'),
          fetch('/api/hyperboxes?available=true'),
        ]);
        if (!aimRes.ok || !boxRes.ok) throw new Error('Failed to load resources');
        const aimsJson = await aimRes.json();
        const boxesJson = await boxRes.json();
        setAIMs(aimsJson.aims);
        setHyperBoxes(boxesJson.hyperboxes);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const next = () => setStep((s) => Math.min(s + 1, 2));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const ensureChannel = async () => {
    if (channel) return true;
    try {
      await openPay(BigInt(1_000_000)); // deposit 1 USDC for demo
      toast({ title: 'Payment channel opened', status: 'success', duration: 3000 });
      return true;
    } catch (err: any) {
      toast({ title: 'Channel open failed', description: err.message, status: 'error' });
      return false;
    }
  };

  const handleDeploy = async () => {
    if (!(await ensureChannel())) return;
    if (!selectedAimId || !selectedHyperBoxId) return;
    try {
      setIsLoading(true);
      const res = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aimId: selectedAimId, hyperboxId: selectedHyperBoxId, nodeUrl, image: dockerImage }),
      });
      if (!res.ok) throw new Error('Deployment failed');
      const data = await res.json();
      toast({
        title: 'Deployment started',
        description: `Deployment ID: ${data.deployment.id}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setStep(2); // move to final step
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && aims.length === 0) {
    return (
      <Flex align="center" justify="center" h="200px">
        <Spinner />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <AlertTitle>Error:</AlertTitle>
        <AlertDescription ml={2}>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Progress bar */}
      <Progress value={(step / 2) * 100} borderRadius="md" />

      {step === 0 && (
        <StepContainer>
          <Heading size="md" mb={4}>Step 1 – Select AIM</Heading>
          <Select placeholder="Select an AIM" value={selectedAimId} onChange={(e) => setSelectedAimId(e.target.value)}>
            {aims.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>
          <HStack justify="flex-end" mt={6}>
            <Button colorScheme="blue" rightIcon={<ArrowRight size={16} />} isDisabled={!selectedAimId} onClick={next}>Next</Button>
          </HStack>
        </StepContainer>
      )}

      {step === 1 && (
        <StepContainer>
          <Heading size="md" mb={4}>Step 2 – Select HyperBox</Heading>
          <Select placeholder="Select a HyperBox" value={selectedHyperBoxId} onChange={(e) => setSelectedHyperBoxId(e.target.value)}>
            {hyperBoxes
              .filter((b) => b.available)
              .map((b) => (
                <option key={b.id} value={b.id}>{b.name} – {b.specs.cpu}/{b.specs.gpu}</option>
              ))}
          </Select>
          <Button mt={2} size="sm" variant="outline" onClick={openHb}>+ Connect my Box</Button>
          {process.env.NEXT_PUBLIC_DEMO_DEPLOY === 'true' && (
            <Input mt={4} placeholder="Node URL (http://...) or 'mock'" value={nodeUrl} onChange={(e) => setNodeUrl(e.target.value)} />
          )}
          <Input mt={2} placeholder="Docker image" value={dockerImage} onChange={(e) => setDockerImage(e.target.value)} />
          <HStack justify="space-between" mt={6}>
            <Button leftIcon={<ArrowLeft size={16} />} onClick={prev}>Back</Button>
            <Button colorScheme="blue" rightIcon={<ArrowRight size={16} />} isDisabled={!selectedHyperBoxId} onClick={next}>Next</Button>
          </HStack>
        </StepContainer>
      )}

      {step === 2 && (
        <StepContainer>
          <Heading size="md" mb={4}>Step 3 – Review & Deploy</Heading>
          <Text mb={2}><strong>AIM:</strong> {aims.find((a) => a.id === selectedAimId)?.name}</Text>
          <Text mb={2}><strong>HyperBox:</strong> {hyperBoxes.find((b) => b.id === selectedHyperBoxId)?.name}</Text>
          <Text mb={2}><strong>Node URL:</strong> {nodeUrl}</Text>
          <Text mb={2}><strong>Image:</strong> {dockerImage}</Text>
          {/* Only Ethereum for now */}
          <Text mb={6}><strong>Network:</strong> Ethereum</Text>
          <HStack justify="space-between" mt={4}>
            <Button leftIcon={<ArrowLeft size={16} />} onClick={prev}>Back</Button>
            <Button colorScheme="green" rightIcon={<CheckCircle size={16} />} onClick={handleDeploy} isLoading={paying || isLoading} isDisabled={payError !== null}>{channel ? 'Deploy' : 'Open Channel & Deploy'}</Button>
          </HStack>
        </StepContainer>
      )}

      {payError && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {payError}
        </Alert>
      )}

      <OnboardHyperBoxModal
        isOpen={hbOpen}
        onClose={closeHb}
        onSuccess={(b) => {
          setHyperBoxes(prev => [...prev, b]);
          setSelectedHyperBoxId(b.id);
        }}
      />
    </VStack>
  );
} 