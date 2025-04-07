
import React, { useState } from 'react';
import { useBlockheightTimeSeries, TimeWindow } from '@/hooks/useBlockheightTimeSeries';
import BlockheightTimeSeriesChart from './BlockheightTimeSeriesChart';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('10s');
  
  // Convert network ID to chain ID
  const chainId = NETWORK_TO_CHAIN_ID[networkId] || networkId;
  
  // Fetch time series data
  const { data, isLoading, error, uniqueRegions } = useBlockheightTimeSeries(chainId, timeWindow);

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Blockheight Monitoring</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Real-time monitoring of blockheight progression across different providers for {networkName}.
      </p>
      
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="time-window-select" className="text-sm">Time Window:</Label>
          <Select 
            value={timeWindow} 
            onValueChange={(value) => setTimeWindow(value as TimeWindow)}
          >
            <SelectTrigger id="time-window-select" className="w-[120px]">
              <SelectValue placeholder="Select time window" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10s">10 seconds</SelectItem>
              <SelectItem value="30s">30 seconds</SelectItem>
              <SelectItem value="1m">1 minute</SelectItem>
              <SelectItem value="5m">5 minutes</SelectItem>
              <SelectItem value="10m">10 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
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
      />
    </div>
  );
};

export default BlockheightTimeSeriesSection;
