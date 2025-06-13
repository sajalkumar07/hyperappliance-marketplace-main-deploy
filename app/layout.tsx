import './globals.css';
import { ChakraProvider } from '@chakra-ui/react';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ChatDrawerProvider } from '@/components/ChatDrawer';

export const metadata = {
  title: 'HyperAppliance AIMs Marketplace',
  description: 'Cross-Chain marketplace for Artificial Intelligence Modules',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <ChatDrawerProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </ChatDrawerProvider>
        </Providers>
      </body>
    </html>
  );
} 