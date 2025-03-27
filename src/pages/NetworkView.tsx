
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { NETWORKS } from '@/lib/api';
import NetworkHeader from '@/components/network/NetworkHeader';
import MobileNetworkSelector from '@/components/network/MobileNetworkSelector';
import NetworkContent from '@/components/network/NetworkContent';
import NetworkFooter from '@/components/network/NetworkFooter';
import { getNetworkGradient, getTextColorClass } from '@/utils/NetworkGradient';

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
