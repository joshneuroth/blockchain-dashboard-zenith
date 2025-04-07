
import React from 'react';

interface ChartFooterProps {
  selectedRegion: string | null;
}

const ChartFooter: React.FC<ChartFooterProps> = ({ selectedRegion }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-xs text-muted-foreground">
        Data Source: BlockHeight API
      </div>
      <div className="text-xs text-muted-foreground">
        Auto-refreshes every 10 seconds • Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'})}
      </div>
    </div>
  );
};

export default ChartFooter;
