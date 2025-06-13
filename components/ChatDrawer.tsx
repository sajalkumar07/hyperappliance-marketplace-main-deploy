'use client';

import { ReactNode, useState } from 'react';

import {
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Flex,
} from '@chakra-ui/react';
import { MessageCircle, Maximize2, Minimize2 } from 'lucide-react';
import MessagingInterface from '@/components/MessagingInterface';
import { useWallet } from '@/lib/wallet/wallet-context';

interface ChatDrawerProviderProps {
  children: ReactNode;
}

export function ChatDrawerProvider({ children }: ChatDrawerProviderProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { evmWallet } = useWallet();
  const [isMax, setIsMax] = useState(false);

  // TODO: replace with proper authenticated user id once auth is implemented
  const currentUserId = evmWallet?.address || 'current_user_id';

  // Modal size (width) helper
  const contentStyle = isMax
    ? { maxW: '100vw', w: '100vw', h: '100vh', m: 0, borderRadius: 0 }
    : { maxW: '480px', w: '480px' };

  return (
    <>
      {children}
      {/* Floating Chat Button */}
      <IconButton
        aria-label="Open chat drawer"
        icon={<MessageCircle />}
        colorScheme="blue"
        borderRadius="full"
        size="lg"
        position="fixed"
        bottom="24px"
        right="24px"
        zIndex={1000}
        onClick={onOpen}
      />

      {/* Modal containing MessagingInterface */}
      <Modal isOpen={isOpen} onClose={onClose} size="full" motionPreset="slideInBottom">
        <ModalOverlay />
        <ModalContent {...contentStyle} position="fixed" bottom={isMax ? 0 : '32px'} right={isMax ? 0 : '32px'}>
          <ModalHeader display="flex" alignItems="center" justifyContent="space-between" pr={2}>
            Messages
            <Flex gap={2}>
              <IconButton
                aria-label={isMax ? 'Collapse' : 'Expand'}
                icon={isMax ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                size="sm"
                variant="ghost"
                onClick={() => setIsMax((v) => !v)}
              />
              <ModalCloseButton position="static" />
            </Flex>
          </ModalHeader>
          <ModalBody p={0} h={isMax ? 'calc(100vh - 56px)' : '600px'}>
            <MessagingInterface currentUserId={currentUserId} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
} 