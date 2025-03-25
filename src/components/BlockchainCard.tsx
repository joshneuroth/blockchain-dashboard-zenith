
import React, { useEffect, useRef, useState } from 'react';
import { Bell, BarChart } from 'lucide-react';
import BlockComparisonChart, { TimeFilterOption } from './BlockComparisonChart';
import { formatNumber, formatTimeDiff } from '@/lib/api';
import { useBlockchainData } from '@/hooks/useBlockchainData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReliabilityTable from './ReliabilityTable';
import { useReliabilityData, TimePeriod } from '@/hooks/blockchain/useReliabilityData';

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
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('last10');
  const [reliabilityDialogOpen, setReliabilityDialogOpen] = useState(false);
  const [reliabilityTimePeriod, setReliabilityTimePeriod] = useState<TimePeriod>('all-time');
  
  const reliabilityData = useReliabilityData({ 
    lastBlock, 
    blockHistory, 
    providers, 
    isLoading, 
    error, 
    blockTimeMetrics 
  }, reliabilityTimePeriod);
  
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

  const formatBlocksPerMinute = (bpm: number): string => {
    if (bpm === 0 || isNaN(bpm)) return "Calculating...";
    return `${bpm.toFixed(1)} blocks/min`;
  };

  const formatBlocksPerSecond = (bpm: number): string => {
    if (bpm === 0 || isNaN(bpm)) return "Calculating...";
    const bps = bpm / 60;
    return `${bps.toFixed(2)} blocks/sec`;
  };

  const getBlockTime = (): string => {
    if (!lastBlock || !lastBlock.blockTime) return "N/A";
    
    const blockTime = new Date(lastBlock.blockTime);
    const now = new Date();
    const diffMs = now.getTime() - blockTime.getTime();
    
    if (diffMs < 1000) {
      return `${diffMs}ms ago`;
    } else if (diffMs < 60000) {
      return `${Math.floor(diffMs / 1000)}s ago`;
    } else {
      return formatTimeDiff(Math.floor(diffMs / 1000));
    }
  };

  const getTransactionCount = (): string => {
    if (!lastBlock || !lastBlock.transactionCount) return "N/A";
    return formatNumber(lastBlock.transactionCount.toString());
  };

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">{networkName}</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setReliabilityDialogOpen(true)}
            disabled={blockHistory.length === 0}
          >
            <BarChart size={16} />
            <span className="hidden sm:inline">Reliability</span>
          </Button>
          <button 
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Notify about changes"
          >
            <Bell size={18} />
          </button>
        </div>
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
            <div className="flex flex-wrap items-center gap-x-4">
              <span className="font-medium">BLOCK TIME:</span>
              <span>{getBlockTime()}</span>
            </div>
            <div className="font-medium mt-1 flex flex-wrap items-center gap-x-4">
              <span>TRANSACTIONS:</span>
              <span>{getTransactionCount()}</span>
            </div>
            <div className="font-medium mt-1 flex flex-wrap items-center gap-x-3">
              <span>BLOCK RATE:</span>
              <span>{formatBlocksPerMinute(blockTimeMetrics.blocksPerMinute)}</span>
              <span className="text-xs opacity-80">({formatBlocksPerSecond(blockTimeMetrics.blocksPerMinute)})</span>
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
            <h3 className="text-sm text-gray-500 mb-2">BLOCK HEIGHTS</h3>
            <BlockComparisonChart 
              blockHistory={blockHistory} 
              networkColor={networkColor}
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
            />
          </div>
        </>
      )}

      <Dialog open={reliabilityDialogOpen} onOpenChange={setReliabilityDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{networkName} Provider Reliability</DialogTitle>
          </DialogHeader>
          <ReliabilityTable 
            data={reliabilityData}
            timePeriod={reliabilityTimePeriod}
            onTimePeriodChange={setReliabilityTimePeriod}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlockchainCard;
