
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

export type TimeWindow = '10s' | '30s' | '1m' | '5m' | '15m';

export const useBlockheightTimeSeries = (chainId: string, timeWindow: TimeWindow = '10s') => {
  const fetchBlockheightData = async () => {
    const response = await fetch(
      `https://blockheight-api.fly.dev/internal/networks/${chainId}/blockheight/time-series?window=${timeWindow}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json() as BlockheightTimeSeriesData;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['blockheightTimeSeries', chainId, timeWindow],
    queryFn: fetchBlockheightData,
    staleTime: 5000, // 5 seconds
    refetchInterval: 5000, // Auto-refresh every 5 seconds for more real-time data
  });

  // Get all unique regions across all providers
  const uniqueRegions = useMemo(() => {
    if (!data) return [];
    
    return Array.from(new Set(
      Object.values(data.providers).flatMap(providerData => 
        Object.keys(providerData)
      )
    )).sort();
  }, [data]);

  // Calculate blockheight deviations across providers
  const deviationData = useMemo(() => {
    if (!data || !data.providers) return null;
    
    const timestamps = new Set<number>();
    const providerNames = Object.keys(data.providers);
    
    // Collect all timestamps
    providerNames.forEach(provider => {
      Object.values(data.providers[provider]).forEach(regionData => {
        regionData.forEach(point => {
          timestamps.add(point.timestamp);
        });
      });
    });
    
    const sortedTimestamps = Array.from(timestamps).sort((a, b) => a - b);
    
    // Calculate stats for each timestamp
    return sortedTimestamps.map(timestamp => {
      const blockheights: number[] = [];
      
      // Collect blockheights for this timestamp
      providerNames.forEach(provider => {
        Object.values(data.providers[provider]).forEach(regionData => {
          const point = regionData.find(p => p.timestamp === timestamp);
          if (point) {
            blockheights.push(point.blockheight);
          }
        });
      });
      
      if (blockheights.length === 0) return null;
      
      // Calculate min, max, median, variance
      const min = Math.min(...blockheights);
      const max = Math.max(...blockheights);
      const range = max - min;
      const hasDeviation = range > 0;
      
      return {
        timestamp,
        min,
        max,
        range,
        hasDeviation
      };
    }).filter(Boolean);
  }, [data]);

  return { 
    data, 
    isLoading, 
    error: error instanceof Error ? error.message : null,
    uniqueRegions,
    deviationData,
    timeWindow,
    refetch 
  };
};
