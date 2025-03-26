
import React from 'react';
import BlockchainCard from '@/components/BlockchainCard';
import LatencyTest from '@/components/LatencyTest';

interface NetworkContentProps {
  networkId: string;
  networkName: string;
  networkColor: string;
  getTextColorClass: () => string;
}

const NetworkContent: React.FC<NetworkContentProps> = ({ 
  networkId, 
  networkName, 
  networkColor,
  getTextColorClass
}) => {
  return (
    <div className="w-full py-16 px-6 md:px-10">
      <div className="container mx-auto max-w-4xl">
        <h1 className={`text-4xl md:text-6xl font-bold mb-8 ${getTextColorClass()}`}>
          {networkName} <span className="font-extralight">Monitoring</span>
        </h1>
        
        <div className="mb-8">
          <p className={`${getTextColorClass()} opacity-80`}>
            Detailed monitoring for {networkName} network. More metrics and analytics coming soon.
          </p>
        </div>
        
        <BlockchainCard
          networkId={networkId}
          networkName={networkName}
          networkColor={networkColor}
        />
        
        <LatencyTest 
          networkId={networkId}
          networkName={networkName}
        />
        
        <div className="glass-card p-6 mt-8">
          <h2 className="text-xl font-medium mb-4">Coming Soon</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Advanced metrics and analytics for {networkName} will be available here soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkContent;
