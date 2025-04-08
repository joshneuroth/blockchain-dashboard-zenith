
import React from 'react';
import { CardContent } from '@/components/ui/card';

interface LatencyEmptyStateProps {
  selectedNetwork: string;
  selectedRegion: string;
  selectedPeriod: string;
}

const LatencyEmptyState: React.FC<LatencyEmptyStateProps> = ({ 
  selectedNetwork, 
  selectedRegion, 
  selectedPeriod 
}) => {
  return (
    <CardContent>
      <div className="h-60 flex items-center justify-center">
        <p className="text-muted-foreground">
          No latency data available for {selectedNetwork} 
          {selectedRegion !== "All Regions" ? ` in ${selectedRegion}` : ''}
          {selectedPeriod !== "all" ? ` over the past ${selectedPeriod}` : ''}
        </p>
      </div>
    </CardContent>
  );
};

export default LatencyEmptyState;
