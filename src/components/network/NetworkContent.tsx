
import React from 'react';
import BlockchainCard from '@/components/BlockchainCard';
import LatencyTest from '@/components/LatencyTest';
import CloudLatencyCard from '@/components/cloud/CloudLatencyCard';

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
  // Network ID mapping for the cloud latency API
  const getApiNetworkId = () => {
    // Map network identifiers to numeric IDs for the API
    const networkMapping: Record<string, string> = {
      "ethereum": "1",
      "polygon": "137",
      "optimism": "10",
      "arbitrum": "42161",
      "base": "8453",
      "zksync": "324",
      "avalanche": "43114",
      "bsc": "56",
      "fantom": "250",
      "solana": "501"  // Using placeholder ID for Solana
    };
    
    console.log(`Converting network ID: ${networkId} to API network ID`);
    const apiId = networkMapping[networkId] || networkId;
    console.log(`Mapped network ID ${networkId} to API ID ${apiId}`);
    return apiId;
  };

  const apiNetworkId = getApiNetworkId();
  console.log(`Network ID: ${networkId}, API Network ID: ${apiNetworkId}`);

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
        
        <CloudLatencyCard 
          networkId={apiNetworkId}
          networkName={networkName}
        />
      </div>
    </div>
  );
};

export default NetworkContent;
