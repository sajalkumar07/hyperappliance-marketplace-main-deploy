"use client";
import { useDisclosure, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Button } from '@chakra-ui/react';
import { useRef, useState, ReactNode, createContext, useContext } from 'react';

interface ContextType {
  requestApproval: (usdcMicro: number) => Promise<boolean>;
}

const CostContext = createContext<ContextType | null>(null);

export const CostApprovalProvider = ({ children }: { children: ReactNode }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [cost, setCost] = useState(0);
  const resolverRef = useRef<(v: boolean) => void>();

  const requestApproval = (usdcMicro: number) => {
    setCost(usdcMicro);
    onOpen();
    return new Promise<boolean>((res) => {
      resolverRef.current = res;
    });
  };

  const handleConfirm = (ok: boolean) => {
    if (resolverRef.current) resolverRef.current(ok);
    resolverRef.current = undefined;
    onClose();
  };

  return (
    <CostContext.Provider value={{ requestApproval }}>
      {children}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={() => handleConfirm(false)}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Confirm Cost</AlertDialogHeader>
          <AlertDialogBody>
            This call will cost approximately {cost / 1_000_000} USDC. Do you wish to continue?
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={() => handleConfirm(false)}>
              Cancel
            </Button>
            <Button colorScheme="blue" ml={3} onClick={() => handleConfirm(true)}>
              Continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CostContext.Provider>
  );
};

export const useCostApproval = () => {
  const ctx = useContext(CostContext);
  if (!ctx) throw new Error('useCostApproval must be used within CostApprovalProvider');
  return ctx.requestApproval;
}; 