
import { useState, useEffect } from 'react';

export interface CloudLatencyData {
  provider_name: string;
  response_time: number;
  status: number | string;
  method: string;
  timestamp: string;
  origin?: string | {
    host?: string;
    region?: string;
    asn?: number | string;
  };
}

export const useCloudLatency = () => {
  const [data, setData] = useState<CloudLatencyData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching raw cloud latency data...');
        const response = await fetch('https://edgeprobe.fly.dev/simple-latency', {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const cloudData = await response.json();
        console.log('Retrieved raw cloud data', cloudData);
        
        // Just return the raw data without processing
        setData(cloudData);
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
  }, []);

  return { data, isLoading, error };
};
