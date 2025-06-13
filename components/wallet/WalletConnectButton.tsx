'use client';

import { useState } from 'react';
import { 
  Button, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalCloseButton, 
  ModalBody, 
  Text, 
  VStack, 
  HStack,
  Divider,
  useDisclosure,
  Box,
  useColorMode
} from '@chakra-ui/react';
import { Wallet, ExternalLink, ChevronDown, LogOut } from 'lucide-react';
import { useWallet } from '@/lib/wallet/wallet-context';
import { chainConfigs } from '@/lib/wallet/chains';

export default function WalletConnectButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const { 
    evmWallet, 
    cardanoWallet, 
    isConnecting,
    connectEVM, 
    connectCardano, 
    disconnectAll 
  } = useWallet();
  const [walletType, setWalletType] = useState<'evm' | 'cardano' | null>(null);

  // Handle wallet connection
  const handleConnect = async () => {
    onOpen();
  };

  // Connect to selected wallet type
  const connectWallet = async (type: 'evm' | 'cardano') => {
    setWalletType(type);
    
    if (type === 'evm') {
      await connectEVM();
    } else if (type === 'cardano') {
      await connectCardano();
    }
    
    onClose();
  };

  // Format address for display
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get chain name from ID
  const getChainName = (chainId: number): string => {
    const config = chainConfigs[chainId as keyof typeof chainConfigs];
    return config ? config.chainName : 'Unknown Chain';
  };

  // If a wallet is connected, show account info
  if (evmWallet?.isConnected || cardanoWallet?.isConnected) {
    return (
      <Menu>
        <MenuButton 
          as={Button} 
          rightIcon={<ChevronDown size={16} />}
          leftIcon={<Wallet size={16} />}
          colorScheme={evmWallet?.isConnected ? "blue" : "red"}
          variant="outline"
        >
          {evmWallet?.isConnected 
            ? `${formatAddress(evmWallet.address)} (${getChainName(evmWallet.chainId)})`
            : `${formatAddress(cardanoWallet?.address || '')} (Cardano)`
          }
        </MenuButton>
        <MenuList>
          <MenuItem icon={<ExternalLink size={16} />} onClick={() => {
            const address = evmWallet?.address || cardanoWallet?.address;
            const explorerUrl = evmWallet?.isConnected 
              ? `${chainConfigs[evmWallet.chainId].blockExplorerUrls[0]}/address/${address}`
              : `https://explorer.cardano.org/en/address?address=${address}`;
            
            window.open(explorerUrl, '_blank');
          }}>
            View on Explorer
          </MenuItem>
          <MenuItem icon={<LogOut size={16} />} onClick={disconnectAll}>
            Disconnect
          </MenuItem>
        </MenuList>
      </Menu>
    );
  }

  // Show connect button if no wallet is connected
  return (
    <>
      <Button
        leftIcon={<Wallet size={18} />}
        colorScheme="blue"
        onClick={handleConnect}
        isLoading={isConnecting}
        loadingText="Connecting..."
      >
        Connect Wallet
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4}>
              Connect your wallet to access the marketplace features.
            </Text>
            
            <VStack spacing={4} align="stretch">
              <Box
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor={colorMode === 'light' ? "gray.200" : "gray.700"}
                _hover={{ 
                  borderColor: "blue.500",
                  boxShadow: "sm"
                }}
                cursor="pointer"
                onClick={() => connectWallet('evm')}
              >
                <HStack justify="space-between">
                  <Text fontWeight="bold">EVM Wallets</Text>
                  <Box>
                    <Button size="sm" colorScheme="blue" onClick={() => connectWallet('evm')}>
                      Connect
                    </Button>
                  </Box>
                </HStack>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  MetaMask, WalletConnect, etc. for Ethereum, Polygon, and Base
                </Text>
              </Box>
              
              <Divider />
              
              <Box
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor={colorMode === 'light' ? "gray.200" : "gray.700"}
                _hover={{ 
                  borderColor: "red.500",
                  boxShadow: "sm"
                }}
                cursor="pointer"
                onClick={() => connectWallet('cardano')}
              >
                <HStack justify="space-between">
                  <Text fontWeight="bold">Cardano Wallets</Text>
                  <Box>
                    <Button size="sm" colorScheme="red" onClick={() => connectWallet('cardano')}>
                      Connect
                    </Button>
                  </Box>
                </HStack>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Nami, Eternl, Flint, and other Cardano wallets
                </Text>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
} 