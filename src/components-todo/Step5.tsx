// src/components/Step1.tsx
import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import StepPopup from './StepPopup';

interface StepProps {
  mode: 'game' | 'educational';
}

const Step5 = ({ mode }: StepProps) => {
  const [popupOpen, setPopupOpen] = useState(false);

  const title = mode === 'game' ? 'Step 5: Confirm Landing Permit' : 'Step 5: Confirm NFT Received';
  const text =
    mode === 'game'
      ? 'Verify that you received your Landing Permit on Planet Base.'
      : 'Verify that you received your NFT on Base Sepolia';

  const popupTitle = mode === 'game' ? 'Confirm Landing Permit' : 'Confirm NFT Received';
  const popupText =
    mode === 'game'
      ? 'Wow, you received the Landing Permit in 2 seconds and never had to travel there! This Warp Tunnel is amazing!'
      : 'Wow, you received the NFT in 2 seconds and never had to have ETH on Base Sepolia! Espresso confirmations are amazing!';
  const popupButtonText = mode === 'game' ? 'Complete Mission' : 'Complete Mission';
  const popupButtonAction =
    mode === 'game'
      ? undefined // Placeholder, no action yet
      : () => window.open('https://www.alchemy.com/faucets/arbitrum-sepolia', '_blank');

  return (
    <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 1 }}>
      <Typography variant="h4" sx={{ fontSize: '1.25rem', mb: 1 }}>
        {title}
      </Typography>
      <Typography>{text}</Typography>
      <Button
        variant="contained"
        onClick={() => setPopupOpen(true)}
        sx={{ mt: 1 }}
      >
        Complete Step
      </Button>
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

export default Step5;