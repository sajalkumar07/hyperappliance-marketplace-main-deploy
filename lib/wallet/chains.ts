import { ChainConfig, EVMChainId } from './types';

// Mapping of chainId to chain configuration
export const chainConfigs: Record<EVMChainId, ChainConfig> = {
  // Ethereum Mainnet
  1: {
    chainId: 1,
    chainName: 'Ethereum',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://ethereum.publicnode.com'],
    blockExplorerUrls: ['https://etherscan.io'],
    iconUrl: '/icons/ethereum.svg',
  },
  
  // Polygon Mainnet
  137: {
    chainId: 137,
    chainName: 'Polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
    iconUrl: '/icons/polygon.svg',
  },
  
  // Base Mainnet
  8453: {
    chainId: 8453,
    chainName: 'Base',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
    iconUrl: '/icons/base.svg',
  },
  
  // Goerli Testnet
  5: {
    chainId: 5,
    chainName: 'Goerli Testnet',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'GoerliETH',
      decimals: 18,
    },
    rpcUrls: ['https://goerli.infura.io/v3/'],
    blockExplorerUrls: ['https://goerli.etherscan.io'],
    iconUrl: '/icons/ethereum.svg',
  },
  
  // Mumbai Testnet (Polygon)
  80001: {
    chainId: 80001,
    chainName: 'Mumbai Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
    iconUrl: '/icons/polygon.svg',
  },
  
  // Base Goerli Testnet
  84531: {
    chainId: 84531,
    chainName: 'Base Goerli Testnet',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'GoerliETH',
      decimals: 18,
    },
    rpcUrls: ['https://goerli.base.org'],
    blockExplorerUrls: ['https://goerli.basescan.org'],
    iconUrl: '/icons/base.svg',
  },
};

// Helper to get chain configuration by ID
export function getChainConfig(chainId: EVMChainId): ChainConfig {
  return chainConfigs[chainId];
}

// Chain name to chainId mapping for lookup by name
export const chainNameToId: Record<string, EVMChainId> = {
  ethereum: 1,
  polygon: 137,
  base: 8453,
  goerli: 5,
  mumbai: 80001,
  'base-goerli': 84531,
};

// For Cardano, these are the network IDs
export const cardanoNetworks = {
  mainnet: 1,
  testnet: 0,
}; 