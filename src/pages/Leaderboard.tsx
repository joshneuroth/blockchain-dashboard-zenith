
import React, { useState, useEffect } from 'react';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import TimelinessRankingCard from '@/components/leaderboard/TimelinessRankingCard';
import LatencyRankingCard from '@/components/leaderboard/LatencyRankingCard';
import { Moon, Sun, Home, TrendingUp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Leaderboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  
  // Fetch leaderboard data
  const { data, isLoading, error } = useLeaderboardData();
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <header className="w-full py-4 px-6 md:px-10 border-b border-gray-200 dark:border-gray-800 glass-effect">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-lg md:text-xl font-bold">
              blockheight<span className="text-gray-500 font-mono">.xyz</span>
            </h1>
            
            <Link 
              to="/" 
              className="ml-4 p-2 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Home"
            >
              <Home size={20} />
            </Link>
            
            <Link 
              to="/leaderboard" 
              className="ml-4 p-2 rounded-full transition-colors bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              aria-label="Leaderboard"
            >
              <TrendingUp size={20} />
            </Link>
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
      
      <section className="w-full py-16 px-6 md:px-10 animate-slide-in">
        <div className="container mx-auto max-w-4xl">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Provider <span className="font-extralight font-mono">LEADERBOARD</span>
            </h1>
            
            <div className="flex my-8">
              <div>
                <div className="text-xs text-gray-500 font-mono mb-1">BLOCKCHAIN PROVIDER RANKINGS</div>
                <div className="text-sm max-w-md">
                  Track the performance of different blockchain RPC providers across networks. 
                  See which providers offer the best timeliness and lowest latency for your applications.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="flex-grow w-full px-6 md:px-10">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-8 pb-12">
            <TimelinessRankingCard 
              providers={data?.providers || []} 
              isLoading={isLoading} 
              error={error as Error} 
              lastUpdated={data?.last_updated || null}
            />
            
            <LatencyRankingCard 
              providers={data?.providers || []} 
              isLoading={isLoading} 
              error={error as Error} 
              lastUpdated={data?.last_updated || null} 
            />
          </div>
        </div>
      </section>
      
      <footer className="w-full py-8 px-6 md:px-10 mt-12 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Data provided by the blockheight.xyz API. Updated every 5 minutes.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              &copy; {new Date().getFullYear()} blockheight.xyz. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Leaderboard;
