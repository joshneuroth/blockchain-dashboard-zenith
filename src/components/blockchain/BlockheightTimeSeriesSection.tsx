
import React from 'react';
import { useBlockheightTimeSeries } from '@/hooks/useBlockheightTimeSeries';
import BlockheightTimeSeriesChart from './BlockheightTimeSeriesChart';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  // Convert network ID to chain ID
  const chainId = NETWORK_TO_CHAIN_ID[networkId] || networkId;
  
  // Fetch time series data
  const { data, isLoading, error, uniqueRegions } = useBlockheightTimeSeries(chainId);

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Blockheight Monitoring</h2>
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
      />
    </div>
  );
};

export default BlockheightTimeSeriesSection;
