// src/components/Step5.tsx
import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import StepPopup from './StepPopup';

interface StepProps {
  mode: 'game' | 'educational';
  isCompleted: boolean;
  onComplete: () => void;
}

const Step5 = ({ mode, isCompleted, onComplete }: StepProps) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [networkSwitched, setNetworkSwitched] = useState(false);

  const title = mode === 'game' ? 'Step 5: Land on Planet 327' : 'Step 5: Switch to Rollup 327327327';
  const text =
    mode === 'game'
      ? 'Touch down on the rugged frontier of Planet 327, a planet with access to the Warp Tunnel.'
      : 'Jump to Rollup 327327327, where Espresso’s magic awaits.';
  
  const popupTitle = mode === 'game' ? 'Land on Planet 327' : 'Switch to Rollup 327327327';
  const popupText =
    mode === 'game'
      ? 'You’ve crossed the void! Welcome to Planet 327, a wild outpost in the galaxy. The Warp Tunnel hums nearby, promising lightning-fast connections. Switch your ship’s signal to this planet’s frequency, adventure awaits!'
      : 'Your ETH has arrived! Switch your wallet to Rollup 327327327, an Arbitrum L3 chain ready for action. This is where you can use Espresso, fast confirmations are just a step away. Tune in and let’s go!';
  const popupButtonText = mode === 'game' ? 'Deploy Landing Gear' : networkSwitched ? 'Done' : 'Switch Network';

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
      onComplete();
      setPopupOpen(false);
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
                rpcUrls: ['http://165.227.185.13:8547'], // Adjust if RPC differs
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
          onComplete();
          setPopupOpen(false);
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

  const dynamicPopupText = () => {
    if (mode === 'educational') {
      if (networkSwitched) return 'Successfully switched to Rollup 327!';
    }
    return popupText;
  };

  const handlePopupButtonAction = () => {
    if (mode === 'game') {
      switchToRollup327();
    } else {
      switchToRollup327();
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
      </Box>
      <StepPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        title={popupTitle}
        text={dynamicPopupText()}
        buttonText={popupButtonText}
        buttonAction={handlePopupButtonAction}
        buttonDisabled={networkSwitched}
      />
    </Box>
  );
};

export default Step5;