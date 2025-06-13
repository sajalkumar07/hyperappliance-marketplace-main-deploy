'use client';
import { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Input, FormControl, FormLabel, HStack, useToast,
} from '@chakra-ui/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (box: any) => void;
}

export default function OnboardHyperBoxModal({ isOpen, onClose, onSuccess }: Props) {
  const [nodeUrl, setNodeUrl] = useState('');
  const [boxName, setBoxName] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!nodeUrl || !boxName) return;
    setLoading(true);
    try {
      const res = await fetch('/api/hyperboxes/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeUrl, boxName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Onboarding failed');
      toast({ title: 'HyperBox connected', status: 'success' });
      onSuccess(json.hyperbox);
      setNodeUrl('');
      setBoxName('');
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Connect HyperBox</ModalHeader>
        <ModalBody>
          <FormControl mb={4} isRequired>
            <FormLabel>Node URL</FormLabel>
            <Input placeholder="http://192.168.1.100:8006" value={nodeUrl} onChange={(e) => setNodeUrl(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Friendly name</FormLabel>
            <Input placeholder="My Living Room Box" value={boxName} onChange={(e) => setBoxName(e.target.value)} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue" isLoading={loading} onClick={handleSubmit}>Connect</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 