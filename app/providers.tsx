'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { WalletProvider } from '@/lib/wallet/wallet-context';
import { CostApprovalProvider } from '@/components/CostApprovalModal';

// Define the color mode config
const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

// Extend the theme with color mode config
const theme = extendTheme({ config });

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <CacheProvider>
        <ChakraProvider theme={theme}>
          <WalletProvider>
            <CostApprovalProvider>
              {children}
            </CostApprovalProvider>
          </WalletProvider>
        </ChakraProvider>
      </CacheProvider>
    </>
  );
} 