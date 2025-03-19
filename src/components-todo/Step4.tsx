// src/components/Step4.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import StepPopup from './StepPopup';

interface StepProps {
  mode: 'game' | 'educational';
  isCompleted: boolean;
  onComplete: () => void;
}

const Step4 = ({ mode, isCompleted, onComplete }: StepProps) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [networkSwitched, setNetworkSwitched] = useState(false);

  const title = mode === 'game' ? 'Step 4: Send Payment' : 'Step 4: Send Payment';
  const text =
    mode === 'game'
      ? 'Send payment to Planet Base using the Warp Tunnel '
      : 'Send a payment to a designated wallet that is tracked for Espresso confirmations.';
  
  const popupTitle = mode === 'game' ? 'Launch Your Mission' : 'Mint NFT';
  const popupText =
    mode === 'game'
      ? 'By sending a payment to Planet Base using the Warp Tunnel, Planet Base can accept the payment and issue you a Landing Permit in seconds.'
      : 'Send 1 Wei to a designated wallet. An Espresso enabled relay will look for transactions to that wallet and mint an NFT on Base Sepolia.';
  const popupButtonText = mode === 'game' ? 'Send Payment' : networkSwitched ? 'Send 1 Wei' : 'Switch to Rollup 327';

  // Wagmi hooks for sending ETH
  const { sendTransaction, data: hash, error, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Function to switch to Rollup 327 network
  const switchToRollup327 = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install it to proceed.');
      return false;
    }

    try {
      console.log('Attempting to switch to Rollup 327...');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + (327327327).toString(16) }], // Rollup 327 chainId (0x137d007f)
      });
      console.log('Switched to Rollup 327 successfully');
      setNetworkSwitched(true);
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        console.log('Rollup 327 not found, adding it...');
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x' + (327327327).toString(16),
                chainName: 'Rollup 327',
                rpcUrls: ['http://127.0.0.1:8547'], // Adjust if RPC differs
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: [], // Add explorer URL if available
              },
            ],
          });
          console.log('Rollup 327 added, switching...');
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x' + (327327327).toString(16) }],
          });
          console.log('Switched to Rollup 327 successfully after adding');
          setNetworkSwitched(true);
          return true;
        } catch (addError) {
          console.error('Failed to add Rollup 327:', addError);
          return false;
        }
      } else {
        console.error('Failed to switch network:', switchError);
        return false;
      }
    }
  };

  // Handle sending 1 wei to the designated address
  const handleSendPayment = async () => {
    if (!networkSwitched) {
      await switchToRollup327();
    } else {
      console.log('Initiating transfer of 1 wei...');
      sendTransaction({
        to: '0x63f8b5a8A3A865c688f59d3C4235c7f51108E22c',
        value: BigInt(1), // 1 wei
        chainId: 327327327, // Rollup 327
      });
    }
  };

  // Update txHash and complete step when confirmed
  useEffect(() => {
    if (hash) {
      console.log('Transaction Hash:', hash);
      setTxHash(hash);
    }
    if (mode === 'educational' && isConfirmed) {
      onComplete();
      setPopupOpen(false);
    }
  }, [hash, isConfirmed, mode, onComplete]);

  const dynamicPopupText = () => {
    if (mode === 'educational') {
      if (!networkSwitched) return 'First, switch your network to Rollup 327.';
      if (isPending) return 'Transaction is pending...';
      if (isConfirming) return 'Waiting for transaction confirmation...';
      if (isConfirmed) return 'Payment of 1 wei successfully sent!';
      if (error) return `Error: ${error.message}`;
    }
    return popupText;
  };

  const handlePopupButtonAction = () => {
    if (mode === 'game') {
      onComplete();
      setPopupOpen(false);
    } else {
      handleSendPayment();
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        border: '1px dashed grey',
        borderRadius: 1,
        backgroundColor: isCompleted ? 'rgba(144, 238, 144, 0.2)' : 'transparent',
      }}
    >
      <Typography variant="h4" sx={{ fontSize: '1.25rem', mb: 1 }}>
        {title}
      </Typography>
      <Typography>{text}</Typography>
      <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          onClick={() => setPopupOpen(true)}
          disabled={isCompleted}
        >
          {isCompleted ? 'Completed' : 'Complete Step'}
        </Button>
        {mode === 'educational' && txHash && (
          <TextField
            label="Transaction Hash"
            value={txHash}
            InputProps={{ readOnly: true }}
            size="small"
            sx={{ width: '300px' }}
          />
        )}
      </Box>
      <StepPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        title={popupTitle}
        text={dynamicPopupText()}
        buttonText={
          mode === 'game'
            ? popupButtonText
            : isPending || isConfirming
              ? 'Processing...'
              : isConfirmed
                ? 'Done'
                : popupButtonText
        }
        buttonAction={handlePopupButtonAction}
        buttonDisabled={mode === 'game' ? false : isPending || isConfirming || isConfirmed}
      />
    </Box>
  );
};

export default Step4;