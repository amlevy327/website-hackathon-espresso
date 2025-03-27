// src/components/Step4.tsx
import { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import StepPopup from './StepPopup';
import { parseEther } from 'viem';

interface StepProps {
  mode: 'game' | 'educational';
  isCompleted: boolean;
  onComplete: () => void;
}

const Step4 = ({ mode, isCompleted, onComplete }: StepProps) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [chainAdded, setChainAdded] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null); // Countdown in seconds

  const { address } = useAccount();
  const { data: arbSepoliaBalance, isLoading: balanceLoading } = useBalance({
    address: address as `0x${string}`,
    chainId: 421614, // Arbitrum Sepolia
  });

  const title = mode === 'game' ? 'Step 4: Brave the Void Bridge' : 'Step 4: Bridge ETH to Arbitrum Nitro Sepolia Rollup 327327327';
  const text =
    mode === 'game'
      ? 'Send your credits across the slow, treacherous void to Planet 327. Warning: this takes a grueling 15 minutes!'
      : 'Send your ETH to Rollup 327327327. Warning: this old-school bridge takes 15 minutes!';
  
  const popupTitle = mode === 'game' ? 'Brave the Void Bridge' : 'Bridge ETH to Rollup 327327327';
  const popupText =
    mode === 'game'
      ? 'Planet 327 has access to the Warp Tunnel and will allow you to communicate with Planet Base without traveling there. Safe travels!'
      : chainAdded
      ? 'From Planet Arbitrum, you’re bridging your Cosmic Credits to Planet 327, but there’s a catch. Without the Warp Tunnel, this trip through the void takes 15 long minutes. It’s the old way: slow, unreliable, and a galactic bottleneck. Hang tight, relief is coming soon!'
      : 'From Arbitrum Sepolia, bridge your ETH to Rollup 327327327. Here’s the catch: without Espresso, this transfer crawls at 15 minutes. It’s the classic blockchain bottleneck, slow and painful. Start the bridge and feel the drag!';
  const popupButtonText = mode === 'game' ? 'Start Bridge Crossing' : chainAdded ? 'Done' : 'Bridge ETH';

  // Wagmi hooks for transaction
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Check current network
  const checkNetwork = async () => {
    if (!window.ethereum) return null;
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16);
  };

  const handleBridgeEth = async () => {
    const currentChainId = await checkNetwork();
    console.log('Current Chain ID:', currentChainId);
    console.log('Arbitrum Sepolia Balance:', arbSepoliaBalance?.formatted, 'ETH');

    if (currentChainId !== 421614) {
      alert('Please switch to Arbitrum Sepolia (chainId 421614) in MetaMask before proceeding.');
      return;
    }

    if (!arbSepoliaBalance || Number(arbSepoliaBalance.value) <= parseEther('0.001')) {
      alert('Insufficient ETH on Arbitrum Sepolia for gas and transaction. You need at least 0.001 ETH plus gas.');
      return;
    }

    writeContract({
      address: '0xf8787780Aca612E4999a3fF7B371D2aD6219CE7f', // Inbox contract on Arbitrum Sepolia
      abi: [
        {
          name: 'depositEth',
          type: 'function',
          stateMutability: 'payable',
          inputs: [],
          outputs: [{ name: '', type: 'uint256' }],
        },
      ],
      functionName: 'depositEth',
      value: parseEther('0.001'), // 0.001 ETH
      chainId: 421614, // Arbitrum Sepolia
    });
  };

  const dynamicPopupText = () => {
    if (mode === 'educational') {
      if (!address) return 'Please connect your wallet first.';
      if (balanceLoading) return 'Checking your Arbitrum Sepolia balance...';
      if (isPending) return 'Transaction is pending...';
      if (isConfirming) return 'Waiting for transaction confirmation...';
      if (isConfirmed) return 'ETH successfully bridged to Rollup 327!';
      if (error) return `Error: ${error.message}`;
    }
    return popupText;
  };

  const handlePopupButtonAction = () => {
    if (mode === 'game') {
      onComplete();
      setPopupOpen(false);
    } else {
      handleBridgeEth();
    }
  };

  // Start countdown when transaction is confirmed
  useEffect(() => {
    if (mode === 'educational' && isConfirmed && countdown === null) {
      setCountdown(900); // 15 minutes = 900 seconds
    }
  }, [isConfirmed, mode, countdown]);

  // Countdown timer logic
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount or when countdown changes
  }, [countdown]);

  // Format countdown to MM:SS
  const formatCountdown = () => {
    if (countdown === null || countdown <= 0) return '00:00';
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Complete step when transaction is confirmed in educational mode
  useEffect(() => {
    if (mode === 'educational' && isConfirmed) {
      setChainAdded(true);
      onComplete();
      setPopupOpen(false);
    }
  }, [isConfirmed, mode, onComplete]);

  const handleViewExplorer = () => {
    if (hash) {
      const explorerUrl = `https://sepolia.arbiscan.io/tx/${hash}`;
      window.open(explorerUrl, '_blank');
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
        {mode === 'educational' && (
          <>
            <Button
              variant="outlined"
              onClick={handleViewExplorer}
              disabled={!hash}
            >
              View on Arbiscan
            </Button>
            {isConfirmed && (
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                Bridge Time Remaining: {formatCountdown()}
              </Typography>
            )}
          </>
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