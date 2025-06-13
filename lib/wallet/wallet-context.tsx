'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  WalletState,
  EVMWalletConnection, 
  CardanoWalletConnection,
  EVMChainId
} from './types';
import { useEVMWallet } from './evm-connector';
import { useCardanoWallet } from './cardano-connector';

// Create context with default values
const WalletContext = createContext<WalletState>({
  evmWallet: null,
  cardanoWallet: null,
  isConnecting: false,
  connectEVM: async () => null,
  connectCardano: async () => null,
  disconnectAll: async () => {},
});

// Provider component
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [evmWallet, setEvmWallet] = useState<EVMWalletConnection | null>(null);
  const [cardanoWallet, setCardanoWallet] = useState<CardanoWalletConnection | null>(null);
  
  // Initialize wallet hooks
  const evmWalletHook = useEVMWallet();
  const cardanoWalletHook = useCardanoWallet();
  
  // Connect to EVM wallet (MetaMask, etc.)
  const connectEVM = async (): Promise<EVMWalletConnection | null> => {
    setIsConnecting(true);
    try {
      const wallet = await evmWalletHook.connect();
      setEvmWallet(wallet);
      return wallet;
    } catch (error) {
      console.error('Failed to connect EVM wallet:', error);
      return null;
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Connect to Cardano wallet
  const connectCardano = async (walletName?: string): Promise<CardanoWalletConnection | null> => {
    setIsConnecting(true);
    try {
      const wallet = await cardanoWalletHook.connect(walletName);
      setCardanoWallet(wallet);
      return wallet;
    } catch (error) {
      console.error('Failed to connect Cardano wallet:', error);
      return null;
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Disconnect all wallets
  const disconnectAll = async (): Promise<void> => {
    if (evmWallet) {
      await evmWallet.disconnect();
      setEvmWallet(null);
    }
    
    if (cardanoWallet) {
      await cardanoWallet.disconnect();
      setCardanoWallet(null);
    }
  };
  
  // Auto-reconnect on startup if previously connected
  useEffect(() => {
    // Check for active EVM wallet connection
    if (evmWalletHook.isConnected && evmWalletHook.address && !evmWallet) {
      connectEVM().catch(console.error);
    }
    
    // We don't automatically reconnect Cardano wallets in this demo
    // A real implementation would check local storage or similar
  }, [evmWalletHook.isConnected, evmWalletHook.address, evmWallet]);
  
  // Provide wallet state to consumers
  const value: WalletState = {
    evmWallet,
    cardanoWallet,
    isConnecting,
    connectEVM,
    connectCardano,
    disconnectAll,
  };
  
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook for using the wallet context
export const useWallet = () => useContext(WalletContext); 