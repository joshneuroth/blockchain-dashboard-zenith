
import React from 'react';
import { RefreshCw, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CloudLatencyHeaderProps {
  networkName: string;
  onRefresh: () => void;
  lastUpdated: string | null;
}

const CloudLatencyHeader: React.FC<CloudLatencyHeaderProps> = ({ 
  networkName,
  onRefresh,
  lastUpdated
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-medium">Cloud Region to {networkName} RPCs</h2>
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-xs text-gray-500 flex items-center">
            <History size={14} className="mr-1" />
            {lastUpdated}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={onRefresh}
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </Button>
      </div>
    </div>
  );
};

export default CloudLatencyHeader;
