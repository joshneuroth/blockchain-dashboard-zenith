
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Moon, Sun, TrendingUp, MoreHorizontal } from 'lucide-react';
import { NETWORKS } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NetworkHeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const NetworkHeader: React.FC<NetworkHeaderProps> = ({ darkMode, setDarkMode }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isLeaderboardPage = location.pathname === '/leaderboard';

  // Main networks to display directly in the header
  const mainNetworks = ['ethereum', 'polygon', 'avalanche', 'binance'];
  
  // Additional networks for the dropdown
  const additionalNetworks = Object.entries(NETWORKS)
    .filter(([id]) => !mainNetworks.includes(id));

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
            {mainNetworks.map(id => (
              <Link
                key={id}
                to={`/${id}`}
                className={`blockchain-tab ${location.pathname === `/${id}` ? 'active' : ''}`}
              >
                {NETWORKS[id].name}
              </Link>
            ))}
            
            {additionalNetworks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger className="blockchain-tab flex items-center">
                  <MoreHorizontal size={20} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border border-gray-200 dark:border-gray-800">
                  {additionalNetworks.map(([id, network]) => (
                    <DropdownMenuItem key={id} asChild>
                      <Link
                        to={`/${id}`}
                        className={`w-full px-2 py-1.5 ${location.pathname === `/${id}` ? 'font-semibold' : ''}`}
                      >
                        {network.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
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
