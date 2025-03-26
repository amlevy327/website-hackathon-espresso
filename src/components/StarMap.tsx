import { Box, Avatar, Typography } from '@mui/material';
import sepGame from '../public/planets/sep-game.png';
import sepEdu from '../public/planets/sep-edu.jpg';
import arbGame from '../public/planets/arb-game.png';
import arbEdu from '../public/planets/arb-edu.png';
import espressoGame from '../public/planets/espresso-game.png';
import espressoEdu from '../public/planets/espresso-edu.png';
import planet327Game from '../public/planets/planet327-game.png';
import planet327Edu from '../public/planets/planet327-edu.png';

interface StarMapProps {
  isConnected: boolean;
  chainId: number | undefined;
  balances: {
    ethSepolia: number;
    arbSepolia: number;
    rollup327: number;
  };
  mode: 'game' | 'educational';
  hasSepoliaNft?: boolean;
}

const StarMap = ({ isConnected, chainId, balances, mode, hasSepoliaNft }: StarMapProps) => {
  const chainToPlanet: { [key: number]: string } = {
    11155111: mode === 'game' ? 'PlanetSep' : 'Ethereum Sepolia',
    421614: mode === 'game' ? 'PlanetArb' : 'Arbitrum Sepolia',
    327327327: mode === 'game' ? 'Planet327' : 'Rollup 327327327',
  };

  const planetImages: { [key: string]: string } = mode === 'game' 
  ? {
      PlanetSep: sepGame,
      PlanetArb: arbGame,
      Planet327: planet327Game,
      WarpTunnel: espressoGame
    }
  : {
      "Ethereum Sepolia": sepEdu,
      "Arbitrum Sepolia": arbEdu,
      "Rollup 327327327": planet327Edu,
      "Espresso": espressoEdu,
  };

  const currentPlanet = isConnected && chainId ? chainToPlanet[chainId] : null;

  const planetPositions = {
    [mode === 'game' ? 'PlanetSep' : 'Ethereum Sepolia']: { x: 450, y: 150, balance: balances.ethSepolia },
    [mode === 'game' ? 'PlanetArb' : 'Arbitrum Sepolia']: { x: 50, y: 150, balance: balances.arbSepolia },
    [mode === 'game' ? 'Planet327' : 'Rollup 327327327']: { x: 200, y: 50, balance: balances.rollup327 },
    [mode === 'game' ? 'WarpTunnel' : 'Espresso']: { x: 300, y: 150, balance: 0 },
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 200,
        background: '#1a1a1a',
        borderRadius: 2,
        overflow: 'hidden',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      {Object.entries(planetPositions).map(([name, { x, y, balance }]) => (
        <Box
          key={name}
          sx={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', textAlign: 'center' }}
        >
          <Avatar
            sx={{ width: 40, height: 40 }}
            alt={name}
            src={planetImages[name] || '/planets/default.png'}
          />
          <Typography variant="caption" color="white" sx={{ mt: 0.5 }}>
            {name}
          </Typography>
          {isConnected && currentPlanet === name && (
            <Typography
              sx={{
                position: 'absolute',
                bottom: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '1.5rem',
              }}
            >
              👤
            </Typography>
          )}
          {balance > 0 && (
            <Typography
              sx={{
                position: 'absolute',
                bottom: -20,
                left: -10,
                fontSize: '1.5rem',
              }}
            >
              🛢️
            </Typography>
          )}
          {name === (mode === 'game' ? 'PlanetSep' : 'Ethereum Sepolia') && hasSepoliaNft && (
            <Typography
              sx={{
                position: 'absolute',
                bottom: -20,
                right: -20,
                fontSize: '1.5rem',
              }}
            >
              🪪
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default StarMap;
