import { useState, useEffect } from 'react';
import { sha256 } from '@noir-lang/noir_js';
import { isAddress, toBytes, pad } from 'viem';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { getCircuit } from '../utils/compile.js';
import { BarretenbergBackend, ProofData } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import { use } from 'chai';

enum Move {
  NoMove,
  Rock,
  Scroll,
  Scissors,
}

const CreateGame = ({ gameContractAddress }: { gameContractAddress: string }) => {
  const [move, setMove] = useState<Move>(Move.Rock);
  const [opponentAddress, setOpponentAddress] = useState<string>('');
  const [betAmount, setBetAmount] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [noir, setNoir] = useState<Noir | undefined>(undefined);

  useEffect(() => {
    const setupNoir = async () => {
      try {
        const circuit = await getCircuit();
        const backend = new BarretenbergBackend(circuit, {
          threads: navigator.hardwareConcurrency,
        });
        const noir = new Noir(circuit, backend);

        await toast.promise(noir.init, {
          pending: 'Initializing Noir...',
          success: 'Noir initialized!',
          error: 'Error initializing Noir',
        });

        setNoir(noir);
      } catch (err) {
        toast.error((err as any).message);
      }
    };

    setupNoir();
  }, []);

  const handleSubmit = async () => {
    if (!isAddress(opponentAddress)) {
      toast.error('Please enter a valid Ethereum address.');
      return;
    }

    if (betAmount === '0') {
      toast.error('Bet amount must be greater than 0.');
      return;
    }

    if (!noir) {
      toast.error('Noir not initialized');
      return;
    }

    setLoading(true);

    const nonce = Math.floor(Math.random() * 201);

    // Sum move and nonce to create hash
    const combinedInt = Number(move) + nonce;
    const hash = sha256(pad(toBytes(combinedInt)));

    try {
      const data = await toast.promise(
        noir.generateProof({ move: Number(move), nonce, hash: Array.from(hash) }),
        {
          pending: 'Generating proof',
          success: 'Proof generated',
          error: 'Error generating proof',
        },
      );

      await toast.promise(noir.verifyProof(data), {
        pending: 'Verifying proof off-chain',
        success: 'Proof verified off-chain',
        error: 'Error verifying proof off-chain',
      });
    } catch (err) {
      toast.error((err as any).message);
      setLoading(false);
    }
  };

  return (
    <div className="p-5 flex flex-col mx-auto w-[488px] bg-[#ffffff66] hover:bg-[#ffffff99] rounded">
      <h1 className="text-xl text-center font-bold mb-4 tracking-wide">Create Game</h1>

      {/* image of move here */}

      <select
        className="mb-4 p-2 border rounded"
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
        className="mb-4 p-2 border rounded"
        value={opponentAddress}
        onChange={e => setOpponentAddress(e.target.value)}
      />
      <input
        type="text"
        placeholder="Bet Amount (in ETH)"
        className="mb-4 p-2 border rounded"
        value={opponentAddress}
        onChange={e => setOpponentAddress(e.target.value)}
      />
      <button
        className={`p-2 text-white ${
          loading ? 'bg-gray-500' : 'bg-[#ff644b]'
        } rounded disabled:bg-gray-500 hover:bg-[#ff4a29]`}
        onClick={handleSubmit}
        disabled={loading || !noir}
      >
        {loading ? 'Creating Game...' : 'Create Game'}
      </button>
    </div>
  );
};

export default CreateGame;
