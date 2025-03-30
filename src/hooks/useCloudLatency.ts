
import { useState, useEffect } from 'react';

export interface CloudLatencyData {
  provider_name: string;
  response_time: number;
  status: number;
  method: string;
  timestamp: string;
}

export const useCloudLatency = (networkId: string) => {
  const [data, setData] = useState<CloudLatencyData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null); // Reset error state on new fetch
        
        console.log('Fetching cloud latency data...');
        const response = await fetch('https://edgeprobe.fly.dev/simple-latency?days=7', {
          headers: {
            'Accept': 'application/json',
          },
          // Add a longer timeout since we've seen high latency
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const cloudData = await response.json();
        console.log('Cloud latency data received:', cloudData.length, 'records');
        setData(cloudData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching cloud latency data:', err);
        // Only set error if we're not already loading new data
        if (isLoading) {
          setError(err instanceof Error ? err.message : 'Failed to fetch');
        }
        setIsLoading(false);
      }
    };

    fetchData();
  }, [networkId]);

  return { data, isLoading, error };
};
