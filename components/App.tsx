import React from 'react';
import { GoldRushProvider } from '@covalenthq/goldrush-kit';
import '@covalenthq/goldrush-kit/styles.css';
import Navbar from './Navbar.jsx';
import CreateGame from './CreateGame.jsx';
import Games from './Games.jsx';

const GAME_CONTRACT_ADDRESS = '0x9ba06b76a50363c689252a72c1078099f6a385c7';

const App = () => {
  return (
    <GoldRushProvider apikey={import.meta.env.COVALENT_API_KEY ?? ''}>
      <div className="flex flex-col w-full min-h-screen bg-blue-100">
        <Navbar />
        <main className="container mx-auto px-10">
          {/* Create game */}
          <CreateGame gameContractAddress={GAME_CONTRACT_ADDRESS} />

          <hr className="border-[#ff644b] my-4" />

          {/* Games */}
          <Games gameContractAddress={GAME_CONTRACT_ADDRESS} />
        </main>
      </div>
    </GoldRushProvider>
  );
};

export default App;
