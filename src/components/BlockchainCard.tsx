
import React, { useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import BlockComparisonChart from './BlockComparisonChart';
import { formatNumber, formatTimeDiff } from '@/lib/api';
import { useBlockchainData } from '@/hooks/useBlockchainData';

interface BlockchainCardProps {
  networkId: string;
  networkName: string;
  networkColor: string;
}

const BlockchainCard: React.FC<BlockchainCardProps> = ({ 
  networkId, 
  networkName,
  networkColor 
}) => {
  const { lastBlock, blockHistory, providers, isLoading, error, blockTimeMetrics } = useBlockchainData(networkId);
  const blockHeightRef = useRef<HTMLDivElement>(null);
  
  // Animation effect when block height updates
  useEffect(() => {
    if (blockHeightRef.current) {
      blockHeightRef.current.classList.add('animate-data-update');
      const timer = setTimeout(() => {
        if (blockHeightRef.current) {
          blockHeightRef.current.classList.remove('animate-data-update');
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [lastBlock?.height]);
  
  // Get the color class based on network
  const getColorClass = () => {
    switch (networkId) {
      case 'ethereum': return 'text-ethereum';
      case 'polygon': return 'text-polygon';
      case 'avalanche': return 'text-avalanche';
      case 'solana': return 'text-solana';
      case 'binance': return 'text-binance';
      default: return 'text-primary';
    }
  };

  // Format blocks per minute
  const formatBlocksPerMinute = (bpm: number): string => {
    if (bpm === 0 || isNaN(bpm)) return "Calculating...";
    return `${bpm.toFixed(1)} blocks/min`;
  };

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">{networkName}</h2>
        <button 
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Notify about changes"
        >
          <Bell size={18} />
        </button>
      </div>
      
      {isLoading && blockHistory.length === 0 ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-pulse-opacity">Loading blockchain data...</div>
        </div>
      ) : error ? (
        <div className="h-48 flex items-center justify-center text-red-500">
          {error}
        </div>
      ) : (
        <>
          <div 
            ref={blockHeightRef}
            className={`mt-4 ${getColorClass()} text-5xl md:text-6xl font-light tracking-wider transition-all`}
          >
            {lastBlock ? formatNumber(lastBlock.height) : "0"}
          </div>
          
          <div className="mt-2 flex flex-col text-sm text-gray-500">
            <div>
              LAST BLOCK: ABOUT {lastBlock ? formatTimeDiff(Math.floor((Date.now() - lastBlock.timestamp) / 1000)) : "N/A"}
            </div>
            <div className="font-medium mt-1">
              BLOCK TIME: {formatBlocksPerMinute(blockTimeMetrics.blocksPerMinute)}
            </div>
          </div>
          
          {lastBlock && providers && Object.keys(providers).length > 0 && (
            <div className="mt-1 flex items-center flex-wrap gap-2">
              {Object.entries(providers).map(([name, data], index) => (
                <div 
                  key={index} 
                  className="bg-gray-100 dark:bg-gray-800 text-xs px-2 py-1 rounded flex items-center"
                >
                  <span className="font-medium mr-1">{name}</span>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="text-sm text-gray-500 mb-2">LAST HOUR BLOCK HEIGHTS</h3>
            <BlockComparisonChart 
              blockHistory={blockHistory} 
              networkColor={networkColor}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BlockchainCard;
