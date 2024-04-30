import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useContractRead } from 'wagmi';
import gameAbi from '../artifacts/circuit/contract/noirstarter/RockScrollScissors.sol/RockScrollScissors.json';
import { ethers } from 'ethers';

const Games = ({ gameContractAddress }: { gameContractAddress: string }) => {
  const [games, setGames] = useState([]);
  const { address } = useAccount();
  const provider = new ethers.JsonRpcProvider(import.meta.env.SEPOLA_RPC_URL ?? '');
  const { data: gameIds } = useContractRead({
    address: gameContractAddress as any,
    abi: gameAbi.abi,
    functionName: 'getGamesByPlayer',
    args: [address],
  });

  useEffect(() => {
    const fetchGames = async () => {
      const contract = new ethers.Contract(gameContractAddress, gameAbi.abi, provider);
      const gamesData = await Promise.all(
        (gameIds as any[]).map(async gameId => {
          const gameData = await contract.games(gameId);
          return gameData;
        }),
      );

      console.log(gamesData);
    };
    fetchGames();
  }, [address, provider]);

  return <div></div>;
};

export default Games;
