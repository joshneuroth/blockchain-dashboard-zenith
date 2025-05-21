
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Moon, Sun, TrendingUp, MoreHorizontal, Activity } from 'lucide-react';
import { NETWORKS } from '@/lib/api';
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
  const isStatusPage = location.pathname === '/status';
  
  // Only show Ethereum in the main header
  const ethereumNetwork = Object.entries(NETWORKS).find(([id]) => id === 'ethereum');

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
          
          <Link 
            to="/status" 
            className={`ml-4 p-2 rounded-full transition-colors ${
              isStatusPage 
                ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            aria-label="Status"
          >
            <Activity size={20} />
          </Link>
          
          <div className="ml-4 blockchain-tabs hidden md:flex">
            {ethereumNetwork && (
              <Link
                key={ethereumNetwork[0]}
                to={`/${ethereumNetwork[0]}`}
                className={`blockchain-tab ${location.pathname === `/${ethereumNetwork[0]}` ? 'active' : ''}`}
              >
                {ethereumNetwork[1].name}
              </Link>
            )}
          </div>
          
          {/* Single ellipsis icon for chains menu */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="ml-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="More chains"
              >
                <MoreHorizontal size={20} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="p-4">
                <h3 className="text-sm font-medium mb-2">More Chains</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(NETWORKS).map(([id, network]) => (
                    <Link
                      key={id}
                      to={`/${id}`}
                      className={`px-3 py-2 rounded text-sm ${
                        location.pathname === `/${id}` 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {network.name}
                    </Link>
                  ))}
                </div>
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
