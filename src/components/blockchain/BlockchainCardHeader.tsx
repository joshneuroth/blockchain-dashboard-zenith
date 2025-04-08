
import React from 'react';
import { BarChart } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface BlockchainCardHeaderProps {
  networkName: string;
  onOpenReliability: () => void;
  hasBlockHistory: boolean;
}

const BlockchainCardHeader: React.FC<BlockchainCardHeaderProps> = ({
  networkName,
  onOpenReliability,
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
      </div>
    </div>
  );
};

export default BlockchainCardHeader;
