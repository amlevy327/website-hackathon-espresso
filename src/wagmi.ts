// src/wagmi.tsx
import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, arbitrumSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

const rollup327 = {
  id: 327327327, // Chain ID for your local rollup
  name: 'Rollup 327',
  network: 'rollup-327',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['/rpc'] }, // Proxy through Vite
    public: { http: ['/rpc'] },
  },
  // Optional: Add block explorers or contract addresses if available
} as const;

export const config = createConfig({
  chains: [mainnet, sepolia, arbitrumSepolia, rollup327], // Add Rollup 327
  connectors: [
    injected(),
    coinbaseWallet(),
    walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [rollup327.id]: http(), // Transport for Rollup 327
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}