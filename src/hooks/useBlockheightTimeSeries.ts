
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface BlockheightDataPoint {
  timestamp: number;
  blockheight: number;
  origin_region: string;
}

export interface ProviderRegionData {
  [region: string]: BlockheightDataPoint[];
}

export interface BlockheightTimeSeriesData {
  network: string;
  chain_id: number;
  time_range: {
    start: number;
    end: number;
    window: string;
  };
  providers: {
    [provider: string]: ProviderRegionData;
  };
}

export const useBlockheightTimeSeries = (chainId: string) => {
  const fetchBlockheightData = async () => {
    // Use the updated API endpoint with the API key
    const response = await fetch(`https://api.internal.blockheight.xyz/internal/networks/${chainId}/blockheight/time-series?api_key=bh_a7c63f38-5757-4250-88cd-8d1f842a7142`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json() as BlockheightTimeSeriesData;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['blockheightTimeSeries', chainId],
    queryFn: fetchBlockheightData,
    staleTime: 10000, // 10 seconds
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  // Get all unique regions across all providers
  const uniqueRegions = data ? 
    Array.from(new Set(
      Object.values(data.providers).flatMap(providerData => 
        Object.keys(providerData)
      )
    )).sort() : 
    [];

  return { 
    data, 
    isLoading, 
    error: error instanceof Error ? error.message : null,
    uniqueRegions,
    refetch 
  };
};
