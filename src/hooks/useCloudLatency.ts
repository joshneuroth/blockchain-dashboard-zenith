
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
        setError(null);
        
        const response = await fetch('https://edgeprobe.fly.dev/simple-latency?days=7', {
          headers: {
            'Accept': 'application/json',
          },
          // Add a reasonable timeout
          signal: AbortSignal.timeout(10000)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const cloudData = await response.json();
        
        // Validate the data is an array
        if (!Array.isArray(cloudData)) {
          throw new Error('Invalid data format received');
        }
        
        // Filter out any entries with missing or invalid response_time
        const validCloudData = cloudData.filter(item => 
          item && 
          item.provider_name && 
          typeof item.response_time === 'number' && 
          !isNaN(item.response_time)
        );
        
        setData(validCloudData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching cloud latency data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch');
        setData([]);
        setIsLoading(false);
      }
    };

    if (networkId) {
      fetchData();
    }
    
    // Add a cleanup function
    return () => {
      // AbortController cleanup happens automatically with AbortSignal.timeout
    };
  }, [networkId]);

  return { data, isLoading, error };
};
