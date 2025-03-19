// src/App.tsx
import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useReadContract } from 'wagmi';
import { Box, Switch, FormControlLabel, Typography, Button } from '@mui/material';
import StarMap from './components/StarMap';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';

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
    address: '0xf957D78bDcdAD0Ca846b1D3ff9858B8Ef5A9E2FF',
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
    chainId: 327327327,
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
              ? 'Greetings, Earthling. Welcome back from hypersleep. Let me get you up to speed.\n\nThe Universe is a strange and fragmented place. Earthlings can instantly travel to different Planets, but resources and communication cannot. They require travel times of up to 15 minutes between Planets! This is a terrible experience and prohibits interplanetary travel.\n\nBut a Warp Tunnel has appeared! Certain planets are now able to send resources and other communication in seconds.\n\nYour mission, should you choose to accept, is to be a Space Pioneer and use this Warp Tunnel. Your objective is to receive a Landing Permit on Planet Base without traveling there. Good luck!'
              : 'Greetings, Blockchain User.\n\nEthereum is fragmented and the cross-chain user experience is terrible. While you can change networks instantly, moving assets and communication between chains can take up to 15 minutes! We need to do better.\n\nEspresso confirmations are one way to make this experience better! Espresso confirmations eliminate the need to change chains and reduce the wait time to seconds.\n\nYour mission, should you choose to accept, is to complete your first Espresso enabled blockchain interaction! You will make a payment on an Arbitrum Nitro Sepolia Rollup and receive an NFT on Base Sepolia, without needing gas on the Base Sepolia network. Good luck!'}
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
            hasRollup327Nft={hasNft}
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
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default App;