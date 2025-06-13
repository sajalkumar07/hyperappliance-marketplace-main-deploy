export type ChainType = 'evm' | 'cardano';

export type EVMChainId = 
  | 1     // Ethereum Mainnet
  | 137   // Polygon
  | 8453  // Base
  | 5     // Goerli Testnet
  | 80001 // Mumbai Testnet
  | 84531 // Base Goerli Testnet

export interface ChainConfig {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  iconUrl?: string;
}

export interface EVMWalletConnection {
  address: string;
  chainId: EVMChainId;
  isConnected: boolean;
  disconnect: () => Promise<void>;
  switchChain: (chainId: EVMChainId) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
}

export interface CardanoWalletConnection {
  address: string;
  isConnected: boolean;
  networkId: number; // 0 = testnet, 1 = mainnet
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
}

export type WalletState = {
  evmWallet: EVMWalletConnection | null;
  cardanoWallet: CardanoWalletConnection | null;
  isConnecting: boolean;
  connectEVM: () => Promise<EVMWalletConnection | null>;
  connectCardano: () => Promise<CardanoWalletConnection | null>;
  disconnectAll: () => Promise<void>;
}; 