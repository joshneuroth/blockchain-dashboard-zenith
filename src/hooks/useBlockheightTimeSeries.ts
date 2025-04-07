
import { useState, useEffect } from 'react';

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
  const [data, setData] = useState<BlockheightTimeSeriesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://blockheight-api.fly.dev/internal/networks/${chainId}/blockheight/time-series`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching blockheight time series:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchData();
    
    // Set up auto-refresh every 10 seconds
    const intervalId = setInterval(fetchData, 10000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [chainId]);

  return { data, isLoading, error };
};
