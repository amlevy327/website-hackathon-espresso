// src/components/Step1.tsx
import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useConnect } from 'wagmi';
import StepPopup from './StepPopup';

interface StepProps {
  mode: 'game' | 'educational';
  walletAddress?: string;
  isCompleted: boolean; // New prop to indicate completion
  onComplete: () => void; // New prop to trigger completion
}

const Step1 = ({ mode, walletAddress, isCompleted, onComplete }: StepProps) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const { connectors, connect } = useConnect();

  const title = mode === 'game' ? 'Step 1: Accept Your Galactic Mission' : 'Step 1: Accept Your Blockchain Quest';
  const text =
    mode === 'game'
      ? 'Review your interstellar task list and launch into the cosmos as a Space Pioneer!'
      : 'Connect your wallet and kick off your journey to explore Espresso’s power!';

  const popupTitle = mode === 'game' ? 'Accept Your Galactic Mission' : 'Accept Your Blockchain Quest';
  const popupText =
    mode === 'game'
      ? 'Greetings, Pioneer! Your mission begins on Earth. You’ll journey to Planet Arbitrum, then to the remote Planet 327, where you’ll access the Warp Tunnel. Your goal? Send a message through the tunnel and secure a Landing Permit on Planet Sepolia, no hyperspace travel required. Ready to chart the stars?'
      : 'Welcome, Explorer! Your mission: experience Espresso Confirmations firsthand. You’ll start on Arbitrum Sepolia, bridge to Arbitrum Nitro Sepolia Rollup 327327327, send a payment, and snag an NFT on Ethereum Sepolia, no Ethereum Sepolia gas needed. Connect your wallet and let’s hit the blockchain frontier!';

  const metaMaskConnector = connectors.find(
    (connector) => connector.name.toLowerCase() === 'metamask'
  );

  const popupButtonText = mode === 'game' ? 'Launch Mission' : 'Connect Wallet';
  const popupButtonAction = mode === 'game'
    ? () => {
        onComplete(); // Mark step as complete in game mode
        setPopupOpen(false); // Close popup
      }
    : metaMaskConnector
      ? () => {
          connect({ connector: metaMaskConnector });
          onComplete(); // Mark step as complete after connecting
          setPopupOpen(false); // Close popup
        }
      : () => window.open('https://metamask.io/download/', '_blank');

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

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
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Button
          variant="contained"
          onClick={() => setPopupOpen(true)}
          sx={{ mr: mode === 'educational' && walletAddress ? 2 : 0 }}
          disabled={isCompleted} // Disable button if step is completed
        >
          {isCompleted ? 'Completed' : 'Complete Step'}
        </Button>
        {mode === 'educational' && walletAddress && (
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            Connected wallet: {truncatedAddress}
          </Typography>
        )}
      </Box>
      <StepPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        title={popupTitle}
        text={popupText}
        buttonText={popupButtonText}
        buttonAction={popupButtonAction}
      />
    </Box>
  );
};

export default Step1;