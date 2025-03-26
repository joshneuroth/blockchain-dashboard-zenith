
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { NETWORKS } from '@/lib/api';
import NetworkHeader from '@/components/network/NetworkHeader';
import MobileNetworkSelector from '@/components/network/MobileNetworkSelector';
import NetworkContent from '@/components/network/NetworkContent';
import NetworkFooter from '@/components/network/NetworkFooter';
import { getNetworkGradient, getTextColorClass } from '@/utils/NetworkGradient';
import { InfoCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const NetworkView = () => {
  const { networkId } = useParams();
  const [darkMode, setDarkMode] = useState(false);
  
  // Handle dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Find the network details from the NETWORKS object
  const network = networkId && NETWORKS[networkId as keyof typeof NETWORKS];
  
  if (!network) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Network Not Found</h1>
          <p className="mb-6">The network "{networkId}" was not found.</p>
          <a href="/" className="inline-block bg-blue-500 text-white px-4 py-2 rounded">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${getNetworkGradient(networkId, darkMode)} dark:from-gray-900 dark:to-gray-800 transition-colors duration-300`}>
      <NetworkHeader darkMode={darkMode} setDarkMode={setDarkMode} />
      <MobileNetworkSelector />
      <div className="w-full container mx-auto max-w-4xl px-6 mt-2">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 justify-end">
          <InfoCircle size={14} />
          <Tooltip>
            <TooltipTrigger asChild>
              <span>Data refreshes every 10s initially, then every 30s</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                To reduce rate limiting issues, blockchain data is fetched every 10 seconds during the first minute, 
                then every 30 seconds afterward.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <NetworkContent 
        networkId={networkId as string} 
        networkName={network.name} 
        networkColor={network.color}
        getTextColorClass={() => getTextColorClass(networkId, darkMode)}
      />
      <NetworkFooter />
    </div>
  );
};

export default NetworkView;
