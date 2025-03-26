// src/App.tsx
import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useReadContract } from 'wagmi';
import { Box, Switch, FormControlLabel, Typography } from '@mui/material';
import StarMap from './components/StarMap';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Step5 from './components/Step5';
import Step6 from './components/Step6';
import Step7 from './components/Step7';

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  const { isConnected, chainId, address } = account;

  // *** Balances ***
  const { data: ethSepoliaBalance } = useBalance({
    address: isConnected ? address : undefined,
    chainId: 11155111,
  });

  const { data: arbSepoliaBalance } = useBalance({
    address: isConnected ? address : undefined,
    chainId: 421614,
  });

  const { data: rollup327Balance } = useBalance({
    address: isConnected ? address : undefined,
    chainId: 327327327,
  });

  const { data: nftBalance } = useReadContract({
    address: '0xf1a8a6A06AB68418F738CabA5a60Fd8B2508d68F',
    abi: [
      {
        inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    chainId: 11155111,
    query: {
      enabled: !!address,
    },
  });

  const balances = {
    ethSepolia: ethSepoliaBalance ? Number(ethSepoliaBalance.value) / 1e18 : 0,
    arbSepolia: arbSepoliaBalance ? Number(arbSepoliaBalance.value) / 1e18 : 0,
    rollup327: rollup327Balance ? Number(rollup327Balance.value) / 1e18 : 0,
  };

  const hasNft: boolean | undefined = nftBalance !== undefined ? BigInt(nftBalance.toString()) >= 1n : undefined;

  // *** Mode ***
  const [mode, setMode] = useState<'game' | 'educational'>('game');
  
  // Track completion state for each mode separately
  const [gameProgress, setGameProgress] = useState<boolean[]>([false, false, false, false, false]);
  const [eduProgress, setEduProgress] = useState<boolean[]>([false, false, false, false, false]);

  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.checked ? 'educational' : 'game');
  };

  // Function to update progress based on current mode
  const completeStep = (stepIndex: number) => {
    if (mode === 'game') {
      setGameProgress((prev) => {
        const newProgress = [...prev];
        newProgress[stepIndex] = true;
        return newProgress;
      });
    } else {
      setEduProgress((prev) => {
        const newProgress = [...prev];
        newProgress[stepIndex] = true;
        return newProgress;
      });
    }
  };

  // Get current progress based on mode
  const currentProgress = mode === 'game' ? gameProgress : eduProgress;

  return (
    <>
      <div>
        <h2>Account</h2>
        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>
        {account.status === 'connected' && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>

      <Box sx={{ border: '1px solid grey', borderRadius: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h1" sx={{ fontSize: '2rem' }}>
            Espresso Stellar
          </Typography>
          <FormControlLabel
            control={<Switch checked={mode === 'educational'} onChange={handleModeChange} />}
            label="Toggle Mode (Game / Educational)"
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1 }}>
            {mode === 'game' ? 'Game Mode' : 'Educational Mode'}
          </Typography>
          <Typography style={{ whiteSpace: 'pre-line' }}>
            {mode === 'game'
              ? 'Greetings, Space Pioneer. You’ve just awoken from hypersleep. Welcome to a fractured galaxy! \n\nThe Universe is vast but broken. Earthlings like you can zip between Planets in an instant, yet sending resources or messages between them? That’s a grueling 15-minute trek through the void. It’s chaos which leads to trade stalls, communication lags, and grounded interstellar dreams.\n\nBut hope has arrived! A mysterious Warp Tunnel has emerged, connecting select Planets with near-instant transfers. Resources and data now flow in mere seconds. You’re a trailblazer in this new era and your mission is clear: harness the Warp Tunnel’s power. Your goal? Secure a rare Landing Permit on Planet Sepolia without ever leaving your current orbit. The galaxy’s counting on you. Ready to warp in?'
              : 'Greetings, Blockchain Explorer. Ethereum’s universe is incredible, but it’s holding us back.\n\nPicture this: you can switch between chains like Arbitrum and Ethereum in a flash, but moving assets or data between them? That’s a 15-minute wait in the blockchain wilderness which is slow, clunky, and frustrating. We deserve better!\n\nEnter Espresso Confirmations: an amazing layer that slashes wait times to seconds and skips the hassle of juggling gas across chains. Your mission? Take it for a spin. Make a payment on an Arbitrum Nitro Sepolia Rollup, then snag an NFT on Ethereum Sepolia. No Ethereum Sepolia gas required! Feel the speed. See the future. Ready to dive in?'}
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1 }}>
            Starmap
          </Typography>
          <StarMap
            isConnected={isConnected}
            chainId={chainId}
            balances={balances}
            mode={mode}
            hasSepoliaNft={hasNft}
          />
        </Box>

        <Box>
          <Typography variant="h3" sx={{ FontSize: '1.5rem', mb: 1 }}>
            Steps
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Step1
              mode={mode}
              walletAddress={address}
              isCompleted={currentProgress[0]}
              onComplete={() => completeStep(0)}
            />
            <Step2 mode={mode} isCompleted={currentProgress[1]} onComplete={() => completeStep(1)} />
            <Step3 mode={mode} isCompleted={currentProgress[2]} onComplete={() => completeStep(2)} />
            <Step4 mode={mode} isCompleted={currentProgress[3]} onComplete={() => completeStep(3)} />
            <Step5 mode={mode} isCompleted={currentProgress[4]} onComplete={() => completeStep(4)} />
            <Step6 mode={mode} isCompleted={currentProgress[5]} onComplete={() => completeStep(5)} />
            <Step7 mode={mode} isCompleted={currentProgress[6]} onComplete={() => completeStep(6)} />
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default App;