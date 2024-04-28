import React from 'react';
import { GoldRushProvider } from '@covalenthq/goldrush-kit';
import '@covalenthq/goldrush-kit/styles.css';
import Navbar from './Navbar.jsx';
import CreateGame from './CreateGame.jsx';

const GAME_CONTRACT_ADDRESS = '0x6135c2692db161f31781c4ccae1fefa42a8d7340';

const App = () => {
  return (
    <GoldRushProvider apikey={import.meta.env.COVALENT_API_KEY ?? ''}>
      <div className="flex flex-col min-h-screen">
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
