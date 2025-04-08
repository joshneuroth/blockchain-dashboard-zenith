
import React, { useState, useEffect } from 'react';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import TimelinessRankingCard from '@/components/leaderboard/TimelinessRankingCard';
import LatencyRankingCard from '@/components/leaderboard/LatencyRankingCard';
import JoinDaoCard from '@/components/leaderboard/JoinDaoCard';
import { Link, useLocation } from 'react-router-dom';
import { NETWORKS } from '@/lib/api';
import NetworkHeader from '@/components/network/NetworkHeader';
import MobileNetworkSelector from '@/components/network/MobileNetworkSelector';

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
      <NetworkHeader darkMode={darkMode} setDarkMode={setDarkMode} />
      <MobileNetworkSelector />
      
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
          {/* New DAO Card placed after hero section */}
          <JoinDaoCard />
          
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
