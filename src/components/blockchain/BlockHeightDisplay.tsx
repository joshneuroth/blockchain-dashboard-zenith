
import React, { useRef, useEffect } from 'react';
import { formatNumber } from '@/lib/api';

interface BlockHeightDisplayProps {
  height: string | undefined;
  timestamp: number | undefined;
  networkId: string;
  formatTimeDiff: (diff: number) => string;
}

const BlockHeightDisplay: React.FC<BlockHeightDisplayProps> = ({ 
  height, 
  timestamp,
  networkId,
  formatTimeDiff
}) => {
  const blockHeightRef = useRef<HTMLDivElement>(null);

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
  }, [height]);

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

  const getTimeSinceLastBlock = (): string => {
    if (!timestamp) return "N/A";
    
    const millisecondsDiff = Date.now() - timestamp;
    
    if (millisecondsDiff < 1000) {
      return `${millisecondsDiff}ms ago`;
    } else {
      return formatTimeDiff(Math.floor(millisecondsDiff / 1000));
    }
  };

  return (
    <>
      <div 
        ref={blockHeightRef}
        className={`mt-4 ${getColorClass()} text-5xl md:text-6xl font-light tracking-wider transition-all font-mono`}
      >
        {height ? formatNumber(height) : "0"}
      </div>
      
      <div className="mt-2 text-sm text-gray-500">
        <div>LAST BLOCK: {getTimeSinceLastBlock()}</div>
      </div>
    </>
  );
};

export default BlockHeightDisplay;
