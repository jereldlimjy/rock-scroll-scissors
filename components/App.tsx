import React from 'react';
import { GoldRushProvider } from '@covalenthq/goldrush-kit';
import '@covalenthq/goldrush-kit/styles.css';
import Navbar from './Navbar.jsx';
import CreateGame from './CreateGame.jsx';

const GAME_CONTRACT_ADDRESS = '0xA0DB764E90ca471eAa977947eAa2BA22b9083D41';

const App = () => {
  return (
    <GoldRushProvider apikey={import.meta.env.COVALENT_API_KEY ?? ''}>
      <div className="flex flex-col w-full bg-[#fff8f3]">
        <Navbar />
        <main className="container mx-auto px-10">
          {/* Create game */}
          <CreateGame gameContractAddress={GAME_CONTRACT_ADDRESS} />
        </main>
      </div>
    </GoldRushProvider>
  );
};

export default App;
