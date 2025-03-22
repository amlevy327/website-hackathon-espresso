// src/components/Step7.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useAccount, useReadContract } from 'wagmi';
import StepPopup from './StepPopup';

interface StepProps {
  mode: 'game' | 'educational';
  isCompleted: boolean;
  onComplete: () => void;
}

const Step7 = ({ mode, isCompleted, onComplete }: StepProps) => {
  const [popupOpen, setPopupOpen] = useState(false);

  const title = mode === 'game' ? 'Step 7: Confirm Landing Permit' : 'Step 7: Confirm NFT Received';
  const text =
    mode === 'game'
      ? 'Verify that you received your Landing Permit on Planet Base.'
      : 'Verify that you received your NFT on Rollup 327';

  const popupTitle = mode === 'game' ? 'Confirm Landing Permit' : 'Confirm NFT Received';
  const popupButtonText = mode === 'game' ? 'Complete Mission' : 'View on Magic Eden';

  const { address } = useAccount();

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

  // Check NFT balance on Rollup 327 (ERC-721 Enumerable)
  const { data: nftBalance, isLoading: balanceLoading, error: balanceError } = useReadContract({
    address: '0xcE5c4E995CE88c0889f0D2ED4981bCBcF2f68063', // NFT contract on Rollup 327
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'owner', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ],
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    chainId: 327327327, // Rollup 327
    query: { enabled: !!address }, // Only run if address is available
  });

  // Debug network on mount
  useEffect(() => {
    checkNetwork();
  }, []);

  console.log('Connected Address:', address);
  console.log('NFT Balance:', nftBalance?.toString());
  console.log('Balance Loading:', balanceLoading);
  console.log('Balance Error:', balanceError);

  const hasNFT = nftBalance && BigInt(nftBalance.toString()) > 0;

  const dynamicPopupText = () => {
    if (mode === 'educational') {
      if (!address) return 'Please connect your wallet first.';
      if (balanceLoading) return 'Checking your NFT balance on Rollup 327...';
      if (balanceError) {
        return `Error checking NFT balance: ${balanceError.message}. Ensure you're on Rollup 327 (chainId 327327327) and the contract is deployed at 0xcE5c4E995CE88c0889f0D2ED4981bCBcF2f68063.`;
      }
      if (hasNFT) return 'You have an NFT!';
      return 'No NFT found on Rollup 327 for your address. Did the payment from Step 6 process correctly?';
    }
    return mode === 'game'
      ? 'Wow, you received the Landing Permit in 2 seconds and never had to travel there! This Warp Tunnel is amazing!'
      : 'Wow, you received the NFT in 2 seconds and never had to have ETH on Base Sepolia! Espresso confirmations are amazing!';
  };

  const handlePopupButtonAction = () => {
    if (mode === 'game') {
      onComplete();
      setPopupOpen(false);
    } else if (hasNFT) {
      window.open('https://magiceden.us/', '_blank');
      onComplete();
      setPopupOpen(false);
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
      <Button
        variant="contained"
        onClick={() => setPopupOpen(true)}
        disabled={isCompleted}
        sx={{ mt: 1 }}
      >
        {isCompleted ? 'Completed' : 'Complete Step'}
      </Button>
      <StepPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        title={popupTitle}
        text={dynamicPopupText()}
        buttonText={popupButtonText}
        buttonAction={handlePopupButtonAction}
        buttonDisabled={mode === 'educational' && (!address || balanceLoading || !hasNFT)}
      />
    </Box>
  );
};

export default Step7;