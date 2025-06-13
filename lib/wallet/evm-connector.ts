'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { EVMChainId, EVMWalletConnection } from './types';
import { getChainConfig } from './chains';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useEVMWallet = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<EVMChainId | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Initialize provider
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      setProvider(web3Provider);

      // Check if already connected
      web3Provider.listAccounts().then(accounts => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          
          // Get current chain ID
          web3Provider.getNetwork().then(network => {
            setChainId(network.chainId as EVMChainId);
          });
        }
      });

      // Setup event listeners
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setAddress(null);
          setIsConnected(false);
        } else {
          setAddress(accounts[0]);
          setIsConnected(true);
        }
      });

      window.ethereum.on('chainChanged', (_chainId: string) => {
        const numericChainId = parseInt(_chainId, 16);
        setChainId(numericChainId as EVMChainId);
        
        // Reload the page when chain changes
        window.location.reload();
      });

      window.ethereum.on('disconnect', () => {
        setAddress(null);
        setIsConnected(false);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
        window.ethereum.removeAllListeners('disconnect');
      }
    };
  }, []);

  // Connect wallet
  const connect = useCallback(async (): Promise<EVMWalletConnection | null> => {
    let activeProvider = provider;
    if (!activeProvider && typeof window !== 'undefined' && window.ethereum) {
      activeProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      setProvider(activeProvider);
    }
    if (!activeProvider) {
      console.error('Provider not available');
      return null;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const network = await activeProvider.getNetwork();
      const evmChainId = network.chainId as EVMChainId;
      
      setAddress(accounts[0]);
      setChainId(evmChainId);
      setIsConnected(true);
      
      return {
        address: accounts[0],
        chainId: evmChainId,
        isConnected: true,
        disconnect: disconnect,
        switchChain: switchChain,
        signMessage: signMessage,
      };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    }
  }, [provider]);

  // Disconnect wallet
  const disconnect = useCallback(async (): Promise<void> => {
    setAddress(null);
    setIsConnected(false);
  }, []);

  // Switch chain
  const switchChain = useCallback(async (targetChainId: EVMChainId): Promise<void> => {
    if (!provider || !window.ethereum) {
      console.error('Provider not initialized');
      return;
    }

    const chainConfig = getChainConfig(targetChainId);

    try {
      // Try to switch to the chain
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If the chain hasn't been added yet, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: chainConfig.chainName,
                nativeCurrency: chainConfig.nativeCurrency,
                rpcUrls: chainConfig.rpcUrls,
                blockExplorerUrls: chainConfig.blockExplorerUrls,
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding chain:', addError);
        }
      } else {
        console.error('Error switching chain:', switchError);
      }
    }
  }, [provider]);

  // Sign message
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!provider || !address) {
      throw new Error('Provider not initialized or not connected');
    }

    const signer = (provider ?? provider).getSigner();
    return await signer.signMessage(message);
  }, [provider, address]);

  return {
    connect,
    disconnect,
    switchChain,
    signMessage,
    address,
    chainId,
    isConnected,
  };
}; 