
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
        
        // For Ethereum, the API expects "1" not "ethereum"
        const apiNetworkId = networkId === "ethereum" ? "1" : networkId;
        
        const apiUrl = `https://blockheight-api.fly.dev/networks/${apiNetworkId}/metrics/latency`;
        
        console.log(`Calling API: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (!response.ok) {
          console.error(`API returned status: ${response.status}`);
          const errorText = await response.text();
          console.error(`Error response: ${errorText}`);
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const rawData = await response.json();
        console.log('Retrieved raw cloud data', rawData);
        
        // Check if rawData is an array
        if (!Array.isArray(rawData)) {
          console.error('API did not return an array:', rawData);
          throw new Error('Invalid data format received from API');
        }
        
        // If the array is empty
        if (rawData.length === 0) {
          console.log('API returned an empty array');
          setData([]);
          setIsLoading(false);
          return;
        }
        
        // Process the data to match our interface
        const processedData: CloudLatencyData[] = rawData.map(item => {
          console.log('Processing item:', item);
          return {
            provider: item.provider || 'Unknown',
            origin: {
              city: item.origin?.city,
              region: item.origin?.region,
              country: item.origin?.country
            },
            p50_latency: item.p50_latency_ms !== undefined ? item.p50_latency_ms : 
                       (item.avg_p50_latency_ms !== undefined ? item.avg_p50_latency_ms : 0),
            p90_latency: item.p90_latency_ms !== undefined ? item.p90_latency_ms : 
                       (item.avg_p90_latency_ms !== undefined ? item.avg_p90_latency_ms : 0),
            sample_size: item.sample_size || 0,
            success_rate: item.success_rate || 1.0,
            timestamp: item.timestamp
          };
        });
        
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

    if (networkId) {
      fetchData();
    } else {
      console.error('Network ID is undefined or empty');
      setError('Missing network ID');
      setIsLoading(false);
    }
    
    return () => {
      // AbortController cleanup happens automatically with AbortSignal.timeout
    };
  }, [networkId]);

  return { data, isLoading, error };
};
