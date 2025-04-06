
import { useState, useEffect } from 'react';

export interface CloudLatencyData {
  provider: string;
  origin: {
    city?: string;
    region?: string;
    country?: string;
  };
  p50_latency: number;
  p90_latency: number;
  sample_size: number;
  success_rate?: number;
  timestamp?: string;
}

export const useCloudLatency = (networkId: string) => {
  const [data, setData] = useState<CloudLatencyData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Fetching cloud latency data for network ${networkId}...`);
        
        // Use the new API endpoint with networkId
        const apiUrl = `https://blockheight-api.fly.dev/networks/${networkId}/metrics/latency`;
        
        console.log(`Calling API: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const rawData = await response.json();
        console.log('Retrieved raw cloud data', rawData);
        
        // Process the data to match our interface
        const processedData: CloudLatencyData[] = Array.isArray(rawData) ? rawData.map(item => ({
          provider: item.provider,
          origin: {
            city: item.origin?.city,
            region: item.origin?.region,
            country: item.origin?.country
          },
          p50_latency: item.p50_latency_ms || item.avg_p50_latency_ms,
          p90_latency: item.p90_latency_ms || item.avg_p90_latency_ms,
          sample_size: item.sample_size,
          success_rate: item.success_rate || 1.0
        })) : [];
        
        console.log('Processed data:', processedData);
        setData(processedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching cloud latency data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch');
        setData(null);
        setIsLoading(false);
      }
    };

    fetchData();
    
    return () => {
      // AbortController cleanup happens automatically with AbortSignal.timeout
    };
  }, [networkId]);

  return { data, isLoading, error };
};
