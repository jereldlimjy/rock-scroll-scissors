import { ConnectKitButton } from 'connectkit';
import ScrollIcon from './Scrollcon.jsx';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center py-6 px-10">
      <div className="flex items-center text-lg">
        Rock
        <div className="mx-2">
          <ScrollIcon height={24} width={24} />
        </div>{' '}
        Scissors
      </div>
      <ConnectKitButton />
    </nav>
  );
};

export default Navbar;
