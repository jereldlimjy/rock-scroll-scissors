import { useState } from 'react';
import { useOnChainVerification } from '../hooks/useOnChainVerification.jsx';
import { useProofGeneration } from '../hooks/useProofGeneration.jsx';
import { useOffChainVerification } from '../hooks/useOffChainVerification.jsx';
import { sha256 } from '@noir-lang/noir_js';
import { isAddress, toBytes, pad } from 'viem';

enum Move {
  NoMove,
  Rock,
  Scroll,
  Scissors,
}

const CreateGame = ({ gameContractAddress }: { gameContractAddress: string }) => {
  const [move, setMove] = useState<Move>(Move.Rock);
  const [opponentAddress, setOpponentAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [input, setInput] = useState<any>();
  const { noir, proofData } = useProofGeneration(input);

  useOffChainVerification(noir, proofData);
  // TODO: fix onchain verification
  // useOnChainVerification(proofData);

  const handleSubmit = () => {
    if (!isAddress(opponentAddress)) {
      setMessage('Please enter a valid Ethereum address.');
      return;
    }

    setLoading(true);
    setMessage('');

    const nonce = Math.floor(Math.random() * 201);

    // Sum move and nonce to create hash
    const combinedInt = Number(move) + nonce;
    const hash = sha256(pad(toBytes(combinedInt)));

    setInput({ move: Number(move), nonce, hash: Array.from(hash) });
  };

  return (
    <div className="p-4 flex flex-col w-1/3">
      <h1 className="text-lg font-bold mb-4">Create Game</h1>
      <select
        className="mb-2 p-2 border rounded"
        value={move}
        onChange={e => setMove(e.target.value as any)}
      >
        <option value={Move.Rock}>Rock</option>
        <option value={Move.Scroll}>Scroll</option>
        <option value={Move.Scissors}>Scissors</option>
      </select>
      <input
        type="text"
        placeholder="Opponent's Address"
        className="mb-2 p-2 border rounded"
        value={opponentAddress}
        onChange={e => setOpponentAddress(e.target.value)}
      />
      <button
        className={`p-2 text-white ${loading ? 'bg-gray-500' : 'bg-sky-500'} rounded`}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Game'}
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default CreateGame;
