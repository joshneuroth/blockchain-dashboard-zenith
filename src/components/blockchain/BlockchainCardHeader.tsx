
import React from 'react';
import { BarChart } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface BlockchainCardHeaderProps {
  networkName: string;
  onOpenReliability: () => void;
  onOpenMonitor: () => void;
  hasBlockHistory: boolean;
}

const BlockchainCardHeader: React.FC<BlockchainCardHeaderProps> = ({
  networkName,
  onOpenReliability,
  onOpenMonitor,
  hasBlockHistory
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-medium">{networkName}</h2>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={onOpenReliability}
          disabled={!hasBlockHistory}
        >
          <BarChart size={16} />
          <span className="hidden sm:inline">Reliability</span>
        </Button>
        <Button 
          variant="default" 
          size="sm"
          className="bg-black text-white hover:bg-black/80 dark:bg-green-600 dark:hover:bg-green-700 dark:text-white"
          onClick={onOpenMonitor}
        >
          Monitor your RPC
        </Button>
      </div>
    </div>
  );
};

export default BlockchainCardHeader;
