
import React, { useState, useEffect } from 'react';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { useLocation } from 'react-router-dom';
import NetworkHeader from '@/components/network/NetworkHeader';
import MobileNetworkSelector from '@/components/network/MobileNetworkSelector';
import NetworkFooter from '@/components/network/NetworkFooter';
import LeaderboardCard from '@/components/leaderboard/LeaderboardCard';

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
        <div className="container mx-auto max-w-5xl">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Provider <span className="font-extralight font-mono">LEADERBOARD</span>
            </h1>
            
            <div className="flex my-8">
              <div>
                <div className="text-xs text-gray-500 font-mono mb-1">ETHEREUM PROVIDER RANKINGS</div>
                <div className="text-sm max-w-md">
                  Compare performance metrics for Ethereum RPC providers across latency, 
                  reliability, and blockheight accuracy metrics. Rankings are updated regularly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="flex-grow w-full px-6 md:px-10">
        <div className="container mx-auto max-w-5xl">
          <div className="pb-12">
            <LeaderboardCard 
              providers={data?.provider_metrics || []} 
              isLoading={isLoading} 
              error={error as Error} 
              lastUpdated={data?.time_range?.end || null}
              timeRange={data?.time_range}
            />
          </div>
        </div>
      </section>
      
      <NetworkFooter />
    </div>
  );
};

export default Leaderboard;
