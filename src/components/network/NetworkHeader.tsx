
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Moon, Sun, TrendingUp, MoreHorizontal, ChainIcon } from 'lucide-react';
import { NETWORKS } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface NetworkHeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const NetworkHeader: React.FC<NetworkHeaderProps> = ({ darkMode, setDarkMode }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isLeaderboardPage = location.pathname === '/leaderboard';
  
  // Define main networks to show in the header
  const mainNetworks = Object.entries(NETWORKS).slice(0, 4);
  // Define additional networks for the dropdown
  const additionalNetworks = Object.entries(NETWORKS).slice(4);

  return (
    <header className="w-full py-4 px-6 md:px-10 border-b border-gray-200 dark:border-gray-800 glass-effect">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-lg md:text-xl font-bold">
            blockheight<span className="text-gray-500 font-mono">.xyz</span>
          </h1>
          
          <Link 
            to="/" 
            className={`ml-4 p-2 rounded-full transition-colors ${
              isHomePage 
                ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            aria-label="Home"
          >
            <Home size={20} />
          </Link>
          
          <Link 
            to="/leaderboard" 
            className={`ml-4 p-2 rounded-full transition-colors ${
              isLeaderboardPage 
                ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            aria-label="Leaderboard"
          >
            <TrendingUp size={20} />
          </Link>
          
          <div className="ml-4 blockchain-tabs hidden md:flex">
            {mainNetworks.map(([id, network]) => (
              <Link
                key={id}
                to={`/${id}`}
                className={`blockchain-tab ${location.pathname === `/${id}` ? 'active' : ''}`}
              >
                {network.name}
              </Link>
            ))}
            
            {additionalNetworks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger className="blockchain-tab flex items-center">
                  <MoreHorizontal size={20} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {additionalNetworks.map(([id, network]) => (
                    <DropdownMenuItem key={id} asChild>
                      <Link
                        to={`/${id}`}
                        className={`w-full px-4 py-2 text-sm ${
                          location.pathname === `/${id}` 
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {network.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Add the chain dropdown icon */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="ml-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="More chains"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="6" height="10" rx="1" />
                  <rect x="9" y="4" width="6" height="16" rx="1" />
                  <rect x="16" y="10" width="6" height="7" rx="1" />
                </svg>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="p-4">
                <h3 className="text-sm font-medium mb-2">More Chains</h3>
                <p className="text-xs text-gray-500">Dropdown content will be added in the next step</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default NetworkHeader;
