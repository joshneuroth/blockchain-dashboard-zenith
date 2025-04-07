
import { useState, useEffect, useMemo } from 'react';
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
    const response = await fetch(`https://blockheight-api.fly.dev/internal/networks/${chainId}/blockheight/time-series`);
    
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

  // Calculate max deviation per timestamp
  const deviations = useMemo(() => {
    if (!data?.providers) return {};
    
    const deviationMap: Record<number, number> = {};
    const timestamps = new Set<number>();
    
    // Collect all timestamps
    Object.values(data.providers).forEach(regions => {
      Object.values(regions).forEach(points => {
        points.forEach(point => timestamps.add(point.timestamp));
      });
    });
    
    // Calculate deviation for each timestamp
    timestamps.forEach(timestamp => {
      const blockheights: number[] = [];
      
      Object.values(data.providers).forEach(regions => {
        Object.values(regions).forEach(points => {
          const point = points.find(p => p.timestamp === timestamp);
          if (point) blockheights.push(point.blockheight);
        });
      });
      
      if (blockheights.length > 1) {
        const max = Math.max(...blockheights);
        const min = Math.min(...blockheights);
        deviationMap[timestamp] = max - min;
      } else {
        deviationMap[timestamp] = 0;
      }
    });
    
    return deviationMap;
  }, [data]);

  return { 
    data, 
    isLoading, 
    error: error instanceof Error ? error.message : null,
    uniqueRegions,
    deviations,
    refetch 
  };
};
