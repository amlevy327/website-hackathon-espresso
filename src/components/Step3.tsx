// src/components/Step3.tsx
import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useAccount, useBalance } from 'wagmi';
import StepPopup from './StepPopup';

interface StepProps {
  mode: 'game' | 'educational';
  isCompleted: boolean;
  onComplete: () => void;
}

const Step3 = ({ mode, isCompleted, onComplete }: StepProps) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [chainAdded, setChainAdded] = useState(false);

  const { address } = useAccount();
  const { data: arbSepoliaBalance, isLoading: balanceLoading } = useBalance({
    address: address as `0x${string}`,
    chainId: 421614, // Arbitrum Sepolia
  });

  const title = mode === 'game' ? 'Step 3: Travel to Planet 327' : 'Step 3: Get Arbitrum Sepolia ETH';
  const text =
    mode === 'game'
      ? 'Head to Planet 327 to access the Warp Tunnel.'
      : 'You need gas.';
  
  const popupTitle = mode === 'game' ? 'Travel to Planet 327' : 'Check Balance';
  const popupText =
    mode === 'game'
      ? 'Planet 327 has access to the Warp Tunnel and will allow you to communicate with Planet Base without traveling there. Safe travels!'
      : chainAdded
      ? 'Rollup 327 has been added to MetaMask!'
      : 'Verify you have sufficient balance on Arbitrum Sepolia (minimum 0.00001 ETH).';

  const popupButtonText = mode === 'game' ? 'Travel' : chainAdded ? 'Done' : 'Check Balance';

  const checkNetwork = async () => {
    if (!window.ethereum) return null;
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16);
  };

  const handleCheckBalance = async () => {
    const currentChainId = await checkNetwork();
    
    if (currentChainId !== 421614) {
      alert('Please switch to Arbitrum Sepolia (chainId 421614) in MetaMask before proceeding.');
      return;
    }

    if (balanceLoading) return;

    if (!arbSepoliaBalance || Number(arbSepoliaBalance.value) < 10000000000000) {
      alert('Insufficient ETH on Arbitrum Sepolia. You need at least 0.00001 ETH.');
      return;
    }

    setChainAdded(true);
    onComplete();
    setPopupOpen(false);
  };

  const dynamicPopupText = () => {
    const faucetText = 'Use the faucet to obtain Arbitrum Sepolia ETH: https://www.alchemy.com/faucets/arbitrum-sepolia';

    if (mode === 'educational') {
      if (!address) return `Please connect your wallet first. ${faucetText}`;
      if (balanceLoading) return 'Checking your Arbitrum Sepolia balance...';
      if (arbSepoliaBalance) {
        return `Current balance: ${arbSepoliaBalance.formatted} ETH. ${
          chainAdded ? 'Ready to proceed!' : 'Minimum 0.00001 ETH required.'
        } ${faucetText}`;
      }
      return `${popupText} ${faucetText}`;
    }
    return popupText;
  };

  const handlePopupButtonAction = () => {
    if (mode === 'game') {
      onComplete();
      setPopupOpen(false);
    } else {
      handleCheckBalance();
    }
  };

  const isButtonDisabled = () => {
    if (mode === 'game') return false;
    if (!address || balanceLoading) return true;
    if (arbSepoliaBalance && Number(arbSepoliaBalance.value) < 10000000000000) return true;
    return chainAdded;
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
      </Box>
      <StepPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        title={popupTitle}
        text={dynamicPopupText()}
        buttonText={popupButtonText}
        buttonAction={handlePopupButtonAction}
        buttonDisabled={isButtonDisabled()}
      />
    </Box>
  );
};

export default Step3;