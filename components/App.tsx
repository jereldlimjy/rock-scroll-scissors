import { useState } from 'react';
import React from 'react';
import { useOnChainVerification } from '../hooks/useOnChainVerification.jsx';
import { useProofGeneration } from '../hooks/useProofGeneration.jsx';
import { useOffChainVerification } from '../hooks/useOffChainVerification.jsx';
import { sha256 } from '@noir-lang/noir_js';
import { isAddress, toBytes, pad } from 'viem';
import { GoldRushProvider } from '@covalenthq/goldrush-kit';
import '@covalenthq/goldrush-kit/styles.css';
import Navbar from './Navbar.jsx';

enum Move {
  NoMove,
  Rock,
  Scroll,
  Scissors,
}

const GAME_CONTRACT_ADDRESS = '0xdcb73d72e0513c713a2812c75ede60cfe307e73b';

const App = () => {
  const [move, setMove] = useState<Move>(Move.Rock);
  const [input, setInput] = useState<any>();
  const { noir, proofData } = useProofGeneration(input);

  useOffChainVerification(noir, proofData);
  // TODO: fix onchain verification
  // useOnChainVerification(proofData);

  const handleSubmit = () => {
    const nonce = Math.floor(Math.random() * 201);

    // Sum move and nonce to create hash
    const combinedInt = Number(move) + nonce;
    const hash = sha256(pad(toBytes(combinedInt)));

    console.log(Array.from(hash));

    setInput({ move: Number(move), nonce, hash: Array.from(hash) });
  };

  return (
    <GoldRushProvider apikey={import.meta.env.COVALENT_API_KEY ?? ''}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-10">
          <div>
            <select value={move} onChange={e => setMove(e.target.value as any)}>
              <option value={Move.Rock}>Rock</option>
              <option value={Move.Scroll}>Scroll</option>
              <option value={Move.Scissors}>Scissors</option>
            </select>
            <input name="opponent" type="text" placeholder="Opponent's Address" />
            <button type="submit" onClick={handleSubmit}>
              Calculate proof
            </button>
          </div>
        </main>
      </div>
    </GoldRushProvider>
  );
};

export default App;
