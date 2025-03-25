import { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useAccount, useReadContract } from 'wagmi';
import StepPopup from './StepPopup';

interface StepProps {
  mode: 'game' | 'educational';
  isCompleted: boolean;
  onComplete: () => void;
}

const CONTRACT_ADDRESS = '0xf1a8a6A06AB68418F738CabA5a60Fd8B2508d68F';
const SEPOLIA_CHAIN_ID = 11155111;

const Step7 = ({ mode, isCompleted, onComplete }: StepProps) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [tokenId, setTokenId] = useState<string | null>(null);

  const title = mode === 'game' ? 'Step 7: Confirm Landing Permit' : 'Step 7: Confirm NFT Received';
  const text =
    mode === 'game'
      ? 'Verify that you received your Landing Permit on Planet Base.'
      : 'Verify that you received your NFT on Sepolia';

  const popupTitle = mode === 'game' ? 'Confirm Landing Permit' : 'Confirm NFT Received';
  const popupButtonText = mode === 'game' ? 'Complete Mission' : 'View on OpenSea';

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

  // Check NFT balance on Sepolia
  const {
    data: nftBalance,
    isLoading: balanceLoading,
    error: balanceError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
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
    chainId: SEPOLIA_CHAIN_ID,
    query: { enabled: !!address },
  });

  const hasNFT = nftBalance && BigInt(nftBalance.toString()) > 0;

  // Fetch token ID if balance is exactly 1
  const {
    data: tokenIdData,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: [
      {
        name: 'tokenOfOwnerByIndex',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'index', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ],
    functionName: 'tokenOfOwnerByIndex',
    args:
      !!address && nftBalance?.toString() === '1'
        ? [address as `0x${string}`, 0n]
        : undefined,
    chainId: SEPOLIA_CHAIN_ID,
    query: {
      enabled: !!address && nftBalance?.toString() === '1',
    },
  });

  // Set tokenId once loaded
  useEffect(() => {
    if (tokenIdData) {
      setTokenId(tokenIdData.toString());
    }
  }, [tokenIdData]);

  useEffect(() => {
    checkNetwork();
  }, []);

  const dynamicPopupText = () => {
    if (mode === 'educational') {
      if (!address) return 'Please connect your wallet first.';
      if (balanceLoading) return 'Checking your NFT balance on Sepolia...';
      if (balanceError) {
        return `Error checking NFT balance: ${balanceError.message}. Ensure you're on Sepolia (chainId 11155111) and the contract is deployed at ${CONTRACT_ADDRESS}.`;
      }
      if (hasNFT) return 'You have an NFT!';
      return 'No NFT found on Sepolia for your address. Did the payment from Step 6 process correctly?';
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
      const link = tokenId
        ? `https://testnets.opensea.io/assets/sepolia/${CONTRACT_ADDRESS}/${tokenId}`
        : `https://testnets.opensea.io/collection/espresso-stellar-nft-2`;
      window.open(link, '_blank');
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