
import React, { useEffect, useRef, useState } from 'react';
import { BarChart, RefreshCw } from 'lucide-react';
import BlockComparisonChart, { TimeFilterOption } from './BlockComparisonChart';
import { formatNumber, formatTimeDiff } from '@/lib/api';
import { useBlockchainData } from '@/hooks/useBlockchainData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReliabilityTable from './ReliabilityTable';
import { useReliabilityData, TimePeriod } from '@/hooks/blockchain/useReliabilityData';
import MonitorPaymentModal from './MonitorPaymentModal';

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
  const [monitorModalOpen, setMonitorModalOpen] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(30);
  
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
  
  // Update countdown timer for refresh
  useEffect(() => {
    const refreshInterval = 30; // seconds
    setTimeUntilRefresh(refreshInterval);
    
    // Reset timer whenever new data comes in
    if (lastBlock) {
      setTimeUntilRefresh(refreshInterval);
    }
    
    // Create countdown
    const countdownInterval = setInterval(() => {
      setTimeUntilRefresh(prev => {
        if (prev <= 1) {
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdownInterval);
  }, [lastBlock]);
  
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

  const getTimeSinceLastBlock = (): string => {
    if (!lastBlock) return "N/A";
    
    const millisecondsDiff = Date.now() - lastBlock.timestamp;
    
    if (millisecondsDiff < 1000) {
      return `${millisecondsDiff}ms ago`;
    } else {
      return formatTimeDiff(Math.floor(millisecondsDiff / 1000));
    }
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
          <Button 
            variant="default" 
            size="sm"
            className="bg-black text-white hover:bg-black/80 dark:bg-green-600 dark:hover:bg-green-700 dark:text-white"
            onClick={() => setMonitorModalOpen(true)}
          >
            Monitor your RPC
          </Button>
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
            className={`mt-4 ${getColorClass()} text-5xl md:text-6xl font-light tracking-wider transition-all font-mono`}
          >
            {lastBlock ? formatNumber(lastBlock.height) : "0"}
          </div>
          
          <div className="mt-2 flex flex-col text-sm text-gray-500">
            <div>
              <div>LAST BLOCK: {getTimeSinceLastBlock()}</div>
            </div>
            <div className="font-medium mt-1 flex flex-wrap items-center gap-x-3">
              <span>BLOCK TIME:</span>
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
      
      <MonitorPaymentModal
        open={monitorModalOpen}
        onOpenChange={setMonitorModalOpen}
        networkName={networkName}
      />
    </div>
  );
};

export default BlockchainCard;
