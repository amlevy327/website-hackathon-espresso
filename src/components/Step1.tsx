// src/components/Step1.tsx
import React, { useState } from 'react';
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

  const title = mode === 'game' ? 'Step 1: Accept Mission' : 'Step 1: Accept Mission';
  const text =
    mode === 'game'
      ? 'Review your task list and start your adventure.'
      : 'Connect your wallet to accept the mission!';

  const popupTitle = mode === 'game' ? 'Accept Mission' : 'Get Started';
  const popupText =
    mode === 'game'
      ? 'You will access the Warp Tunnel from Planet 327. You will start on Earth, travel to Planet Arbitrum, travel to Planet 327, send a message through the Warp Tunnel, and finally receive a Landing Permit on Planet Base'
      : 'Connect your Metamask wallet.';

  const metaMaskConnector = connectors.find(
    (connector) => connector.name.toLowerCase() === 'metamask'
  );

  const popupButtonText = mode === 'game' ? 'Accept Mission' : 'Connect with MetaMask';
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