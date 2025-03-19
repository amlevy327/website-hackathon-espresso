// src/components/Step6.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import StepPopup from './StepPopup';

interface StepProps {
  mode: 'game' | 'educational';
  isCompleted: boolean;
  onComplete: () => void;
}

const Step6 = ({ mode, isCompleted, onComplete }: StepProps) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [wrongNetworkPopupOpen, setWrongNetworkPopupOpen] = useState(false);

  const title = mode === 'game' ? 'Step 6: Send Payment' : 'Step 6: Send Payment';
  const text =
    mode === 'game'
      ? 'Send payment to Planet Base using the Warp Tunnel '
      : 'Send a payment to a designated wallet that is tracked for Espresso confirmations.';
  
  const popupTitle = mode === 'game' ? 'Send Payment' : 'Send Payment';
  const popupText =
    mode === 'game'
      ? 'By sending a payment to Planet Base using the Warp Tunnel, Planet Base can accept the payment and issue you a Landing Permit in seconds.'
      : 'Send 1 Wei to a designated wallet. An Espresso enabled relay will look for transactions to that wallet and mint an NFT on Base Sepolia.';
  const popupButtonText = mode === 'game' ? 'Send Payment' : 'Send 1 Wei';

  // Wagmi hooks for sending ETH
  const { sendTransaction, data: hash, error, isPending, isError } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Check current network
  const checkNetwork = async () => {
    if (!window.ethereum) {
      console.log('MetaMask not detected');
      return null;
    }
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const parsedChainId = parseInt(chainId, 16);
    console.log('Current Chain ID:', parsedChainId);
    return parsedChainId;
  };

  // Handle sending 1 wei to the designated address
  const handleSendPayment = async () => {
    const currentChainId = await checkNetwork();
    
    if (currentChainId !== 327327327) {
      console.log('Wrong network detected, opening popup');
      setWrongNetworkPopupOpen(true);
      return;
    }

    console.log('Network is correct, attempting to send 1 wei...');
    try {
      sendTransaction({
        to: '0x63f8b5a8A3A865c688f59d3C4235c7f51108E22c',
        value: BigInt(1), // 1 wei
        chainId: 327327327, // Rollup 327
      });
      console.log('Transaction sent to MetaMask');
    } catch (err) {
      console.error('Failed to initiate transaction:', err);
    }
  };

  // Update txHash and complete step when confirmed
  useEffect(() => {
    if (hash) {
      console.log('Transaction Hash:', hash);
      setTxHash(hash);
    }
    if (mode === 'educational' && isConfirmed) {
      console.log('Transaction confirmed, completing step');
      onComplete();
      setPopupOpen(false);
    }
    if (isError && error) {
      console.error('Transaction error:', error.message);
    }
  }, [hash, isConfirmed, isError, error, mode, onComplete]);

  const dynamicPopupText = () => {
    if (mode === 'educational') {
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

  // Wrong network popup close handler
  const handleWrongNetworkPopupClose = () => {
    setWrongNetworkPopupOpen(false);
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
      <StepPopup
        open={wrongNetworkPopupOpen}
        onClose={handleWrongNetworkPopupClose}
        title="Wrong Network"
        text="Please switch to Rollup 327 (chainId 327327327) in MetaMask to proceed. You can add it manually if needed using RPC http://127.0.0.1:8547."
        buttonText="Close"
        buttonAction={handleWrongNetworkPopupClose}
      />
    </Box>
  );
};

export default Step6;