
import React from 'react';
import { useParams } from 'react-router-dom';
import { NETWORKS } from '@/lib/api';
import BlockchainCard from '@/components/BlockchainCard';
import { Moon, Sun } from 'lucide-react';

const NetworkView = () => {
  const { networkId } = useParams();
  
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="w-full py-16 px-6 md:px-10">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-8">
            {network.name} <span className="font-extralight">Monitoring</span>
          </h1>
          
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-400">
              Detailed monitoring for {network.name} network. More metrics and analytics coming soon.
            </p>
          </div>
          
          <BlockchainCard
            networkId={networkId as string}
            networkName={network.name}
            networkColor={network.color}
          />
          
          {/* Additional network metrics will be added here in the future */}
          <div className="glass-card p-6 mt-8">
            <h2 className="text-xl font-medium mb-4">Coming Soon</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Advanced metrics and analytics for {network.name} will be available here soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkView;
