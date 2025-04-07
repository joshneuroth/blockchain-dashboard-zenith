
import React, { useState } from 'react';
import { useBlockheightTimeSeries, TimeWindow } from '@/hooks/useBlockheightTimeSeries';
import BlockheightTimeSeriesChart from './BlockheightTimeSeriesChart';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface BlockheightTimeSeriesSectionProps {
  networkId: string;
  networkName: string;
}

// Map network IDs to chain IDs
const NETWORK_TO_CHAIN_ID: Record<string, string> = {
  "ethereum": "1",
  "polygon": "137",
  "optimism": "10",
  "arbitrum": "42161",
  "base": "8453",
  "zksync": "324",
  "avalanche": "43114",
  "binance": "56", // This should be "bsc" in your code
  "bsc": "56",
  "fantom": "250",
  "solana": "501"
};

const BlockheightTimeSeriesSection: React.FC<BlockheightTimeSeriesSectionProps> = ({ 
  networkId, 
  networkName 
}) => {
  // State for selected time window
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('10s');
  
  // Convert network ID to chain ID
  const chainId = NETWORK_TO_CHAIN_ID[networkId] || networkId;
  
  // Fetch time series data with the selected time window
  const { data, isLoading, error, uniqueRegions, deviationData } = useBlockheightTimeSeries(chainId, timeWindow);

  const handleTimeWindowChange = (value: string) => {
    if (value) {
      setTimeWindow(value as TimeWindow);
    }
  };

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold">Blockheight Monitoring</h2>
        
        <ToggleGroup 
          type="single" 
          value={timeWindow} 
          onValueChange={handleTimeWindowChange}
          className="border rounded-md"
        >
          <ToggleGroupItem value="10s" className="px-3 py-1 text-xs">10s</ToggleGroupItem>
          <ToggleGroupItem value="30s" className="px-3 py-1 text-xs">30s</ToggleGroupItem>
          <ToggleGroupItem value="1m" className="px-3 py-1 text-xs">1m</ToggleGroupItem>
          <ToggleGroupItem value="5m" className="px-3 py-1 text-xs">5m</ToggleGroupItem>
          <ToggleGroupItem value="15m" className="px-3 py-1 text-xs">15m</ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        Real-time monitoring of blockheight progression across different providers for {networkName}.
        {timeWindow === '10s' && " Showing most granular data (10-second intervals)."}
      </p>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load blockheight data: {error}
          </AlertDescription>
        </Alert>
      )}
      
      <BlockheightTimeSeriesChart 
        data={data} 
        isLoading={isLoading}
        uniqueRegions={uniqueRegions}
        deviationData={deviationData}
        timeWindow={timeWindow}
      />
    </div>
  );
};

export default BlockheightTimeSeriesSection;
