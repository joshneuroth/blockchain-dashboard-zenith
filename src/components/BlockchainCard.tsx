
import React, { useState, useEffect } from 'react';
import { formatTimeDiff } from '@/lib/api';
import { useBlockchainData } from '@/hooks/useBlockchainData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BlockHeightDisplay from './blockchain/BlockHeightDisplay';
import BlockTimeInfo from './blockchain/BlockTimeInfo';
import ProviderList from './blockchain/ProviderList';
import BlockchainCardHeader from './blockchain/BlockchainCardHeader';
import BlockComparisonChart, { TimeFilterOption } from './BlockComparisonChart';
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
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('last10');
  const [reliabilityDialogOpen, setReliabilityDialogOpen] = useState(false);
  const [reliabilityTimePeriod, setReliabilityTimePeriod] = useState<TimePeriod>('all-time');
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(30);
  
  const reliabilityData = useReliabilityData({ 
    lastBlock, 
    blockHistory, 
    providers, 
    isLoading, 
    error, 
    blockTimeMetrics 
  }, reliabilityTimePeriod);
  
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

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in">
      <BlockchainCardHeader 
        networkName={networkName}
        onOpenReliability={() => setReliabilityDialogOpen(true)}
        hasBlockHistory={blockHistory.length > 0}
      />
      
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
          <BlockHeightDisplay 
            height={lastBlock?.height}
            timestamp={lastBlock?.timestamp}
            networkId={networkId}
            formatTimeDiff={formatTimeDiff}
          />
          
          <div className="flex flex-col text-sm text-gray-500">
            <BlockTimeInfo blocksPerMinute={blockTimeMetrics.blocksPerMinute} />
          </div>
          
          <ProviderList providers={providers} />
          
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
