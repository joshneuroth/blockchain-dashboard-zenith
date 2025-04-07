
import React, { useState } from 'react';
import { useBlockheightTimeSeries, TimeWindowOption } from '@/hooks/useBlockheightTimeSeries';
import BlockheightTimeSeriesChart from './BlockheightTimeSeriesChart';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  // State for selected time window, default to 10s for maximum granularity
  const [timeWindow, setTimeWindow] = useState<TimeWindowOption>("10s");
  
  // Convert network ID to chain ID
  const chainId = NETWORK_TO_CHAIN_ID[networkId] || networkId;
  
  // Fetch time series data with selected time window
  const { data, isLoading, error, uniqueRegions, deviations } = useBlockheightTimeSeries(chainId, timeWindow);

  // Handle time window change
  const handleTimeWindowChange = (value: string) => {
    if (value) {
      setTimeWindow(value as TimeWindowOption);
    }
  };

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Blockheight Monitoring</h2>
        
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-sm text-muted-foreground mr-2">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Time Window:</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select time window granularity for blockheight data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <ToggleGroup type="single" value={timeWindow} onValueChange={handleTimeWindowChange}>
            <ToggleGroupItem value="10s" aria-label="10 seconds">10s</ToggleGroupItem>
            <ToggleGroupItem value="30s" aria-label="30 seconds">30s</ToggleGroupItem>
            <ToggleGroupItem value="1m" aria-label="1 minute">1m</ToggleGroupItem>
            <ToggleGroupItem value="5m" aria-label="5 minutes">5m</ToggleGroupItem>
            <ToggleGroupItem value="10m" aria-label="10 minutes">10m</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        Real-time monitoring of blockheight progression across different providers for {networkName}.
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
        deviations={deviations}
      />
    </div>
  );
};

export default BlockheightTimeSeriesSection;
