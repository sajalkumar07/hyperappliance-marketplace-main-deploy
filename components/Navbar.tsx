'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Box, Flex, HStack, Button, Menu, MenuButton, MenuList, MenuItem, useDisclosure, IconButton, Text, useColorMode } from '@chakra-ui/react';
import { Menu as MenuIcon, User, ShoppingBag, Plus, LogIn, Moon, Sun } from 'lucide-react';
import WalletConnectButton from '@/components/wallet/WalletConnectButton';
import { useWallet } from '@/lib/wallet/wallet-context';

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { evmWallet, cardanoWallet } = useWallet();

  // Check if any wallet is connected
  const isWalletConnected = evmWallet?.isConnected || cardanoWallet?.isConnected;

  return (
    <Box as="nav" bg={colorMode === 'light' ? "white" : "gray.800"} boxShadow="sm" position="sticky" top={0} zIndex={10}>
      <Flex h={16} alignItems="center" justifyContent="space-between" mx="auto" px={4} maxW="container.xl">
        <IconButton
          size="md"
          icon={<MenuIcon />}
          aria-label="Open Menu"
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        
        <HStack spacing={8} alignItems="center">
          <Link href="/">
            <Text fontWeight="bold" fontSize="xl" color={colorMode === 'light' ? "blue.600" : "blue.200"}>
              AIMs Marketplace
            </Text>
          </Link>
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
            <Link href="/marketplace">
              <Button variant="ghost">Marketplace</Button>
            </Link>
            <Link href="/create-listing">
              <Button variant="ghost">Create Listing</Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost">About</Button>
            </Link>
          </HStack>
        </HStack>
        
        <HStack spacing={3}>
          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            variant="ghost"
            onClick={toggleColorMode}
          />
          
          {isWalletConnected ? (
            <>
              <Link href="/profile">
                <Button leftIcon={<User size={18} />} variant="ghost" size="sm">
                  Profile
                </Button>
              </Link>
              <Link href="/my-aims">
                <Button leftIcon={<ShoppingBag size={18} />} variant="ghost" size="sm">
                  My AIMs
                </Button>
              </Link>
            </>
          ) : null}
          
          <WalletConnectButton />
        </HStack>
      </Flex>

      {/* Mobile menu */}
      {isOpen && (
        <Box pb={4} display={{ md: 'none' }}>
          <Flex as="nav" direction="column" px={2} pt={2} pb={4} bg={colorMode === 'light' ? "white" : "gray.800"}>
            <Link href="/marketplace">
              <Button w="full" variant="ghost" justifyContent="flex-start" mb={2}>
                Marketplace
              </Button>
            </Link>
            <Link href="/create-listing">
              <Button w="full" variant="ghost" justifyContent="flex-start" mb={2}>
                Create Listing
              </Button>
            </Link>
            <Link href="/about">
              <Button w="full" variant="ghost" justifyContent="flex-start">
                About
              </Button>
            </Link>
          </Flex>
        </Box>
      )}
    </Box>
  );
} 