import React from 'react';
import { GoldRushProvider } from '@covalenthq/goldrush-kit';
import '@covalenthq/goldrush-kit/styles.css';
import Navbar from './Navbar.jsx';
import CreateGame from './CreateGame.jsx';

const GAME_CONTRACT_ADDRESS = '0xa301cb4dd98b3c06de1dc7f597e0c7eb0fd2d96b';

const App = () => {
  return (
    <GoldRushProvider apikey={import.meta.env.COVALENT_API_KEY ?? ''}>
      <div className="flex flex-col w-full min-h-screen bg-blue-100">
        <Navbar />
        <main className="container mx-auto px-10">
          {/* Create game */}
          <CreateGame gameContractAddress={GAME_CONTRACT_ADDRESS} />

          <hr className="border-[#ff644b] my-4" />
        </main>
      </div>
    </GoldRushProvider>
  );
};

export default App;
