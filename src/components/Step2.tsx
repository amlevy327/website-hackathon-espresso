// src/components/Step2.tsx
import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useAccount, useBalance } from 'wagmi';
import StepPopup from './StepPopup';

interface StepProps {
  mode: 'game' | 'educational';
  isCompleted: boolean;
  onComplete: () => void;
}

const Step2 = ({ mode, isCompleted, onComplete }: StepProps) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [chainAdded, setChainAdded] = useState(false);

  const { address } = useAccount(); // Get connected wallet address from wagmi

  const title = mode === 'game' ? 'Step 2: Jump to Planet Arbitrum' : 'Step 2: Switch to Arbitrum Sepolia';
  const text =
    mode === 'game'
      ? 'Shift your ship’s coordinates to the bustling hub of Planet Arbitrum, your first stop in the galaxy.'
      : 'Flip your network to Arbitrum Sepolia, your launchpad for this adventure.';

  const popupTitle = mode === 'game' ? 'Jump to Planet Arbitrum' : 'Switch to Arbitrum Sepolia';
  const popupText =
    mode === 'game'
      ? 'Time to leave Earth’s orbit! Set your navigation to Planet Arbitrum, a thriving trade world. This jump is instant, but the real challenge lies ahead. Align your ship and prepare for the journey!'
      : 'Time to move! Switch your wallet to Arbitrum Sepolia. It’s a quick hop, think of it as setting your coordinates for the journey ahead. Let’s get aligned!';

  const popupButtonText = mode === 'game' ? 'Engage Jump Drive' : 'Switch Network';

  // Fetch Arbitrum Sepolia balance (chainId 421614)
  const { data: arbSepoliaBalance, isLoading: balanceLoading } = useBalance({
    address: address as `0x${string}`, // Use wagmi's connected address
    chainId: 421614, // Arbitrum Sepolia
  });

  // Debug logging
  console.log('Address:', address);
  console.log('Arbitrum Sepolia Balance Data:', arbSepoliaBalance);
  console.log('Balance Loading:', balanceLoading);

  const hasArbSepoliaBalance = arbSepoliaBalance && Number(arbSepoliaBalance.value) > 0;

  // Function to add and switch to Arbitrum Sepolia in MetaMask
  const addAndSwitchToArbitrumSepolia = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install it to proceed.');
      return;
    }

    try {
      // Add Arbitrum Sepolia network
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x' + (421614).toString(16), // Arbitrum Sepolia chainId in hex (0x66eee)
            chainName: 'Arbitrum Sepolia',
            rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'], // Public RPC
            nativeCurrency: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18,
            },
            blockExplorerUrls: ['https://sepolia.arbiscan.io/'],
          },
        ],
      });

      // Switch to Arbitrum Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + (421614).toString(16) }],
      });

      setChainAdded(true);
      onComplete(); // Mark step as complete
      setPopupOpen(false); // Close popup
    } catch (err) {
      console.error('Failed to add/switch chain:', err);
    }
  };

  const dynamicPopupText = () => {
    if (mode === 'educational') {
      if (!address) return 'Please connect your wallet first.';
      if (balanceLoading) return 'Checking your Arbitrum Sepolia balance...';
      if (!hasArbSepoliaBalance) {
        return 'You need ETH on Arbitrum Sepolia (chainId 421614) to proceed. Get some from a faucet or bridge ETH from Ethereum Sepolia.';
      }
    }
    return popupText;
  };

  const handlePopupButtonAction = () => {
    if (mode === 'game') {
      onComplete(); // Mark step as complete in game mode
      setPopupOpen(false); // Close popup
    } else if (hasArbSepoliaBalance) {
      addAndSwitchToArbitrumSepolia(); // Add and switch network in educational mode
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        border: '1px dashed grey',
        borderRadius: 1,
        backgroundColor: isCompleted ? 'rgba(144, 238, 144, 0.2)' : 'transparent', // Light green when completed
      }}
    >
      <Typography variant="h4" sx={{ fontSize: '1.25rem', mb: 1 }}>
        {title}
      </Typography>
      <Typography>{text}</Typography>
      <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => setPopupOpen(true)}
          disabled={isCompleted} // Disable if completed
        >
          {isCompleted ? 'Completed' : 'Complete Step'}
        </Button>
      </Box>
      <StepPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        title={popupTitle}
        text={dynamicPopupText()}
        buttonText={mode === 'game' ? popupButtonText : chainAdded ? 'Done' : popupButtonText}
        buttonAction={mode === 'game' ? handlePopupButtonAction : hasArbSepoliaBalance ? handlePopupButtonAction : undefined}
        buttonDisabled={mode === 'game' ? false : !address || balanceLoading || !hasArbSepoliaBalance || chainAdded}
      />
    </Box>
  );
};

export default Step2;