import { useState } from 'react';
import React from 'react';
import { useOnChainVerification } from '../hooks/useOnChainVerification.jsx';
import { useProofGeneration } from '../hooks/useProofGeneration.jsx';
import { useOffChainVerification } from '../hooks/useOffChainVerification.jsx';
import { blake2s256 } from '@noir-lang/noir_js';
import { isAddress, toBytes } from 'viem';

enum Move {
  Rock,
  Scroll,
  Scissors,
}

function Component() {
  const [move, setMove] = useState<Move>(Move.Rock);
  const [input, setInput] = useState<any>();
  const { noir, proofData } = useProofGeneration(input);
  useOffChainVerification(noir, proofData);
  useOnChainVerification(proofData);

  const handleSubmit = () => {
    const nonce = Math.floor(Math.random() * 201);

    // Sum move and nonce to create hash
    const combinedInt = move + nonce;
    const hash = blake2s256(toBytes(combinedInt));

    console.log(Array.from(hash));
    console.log(move);
    console.log(nonce);

    setInput({ move: move, nonce, hash: Array.from(hash) });
  };

  return (
    <div className="container">
      <h1>Rock Scroll Scissors</h1>
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
  );
}

export default Component;
