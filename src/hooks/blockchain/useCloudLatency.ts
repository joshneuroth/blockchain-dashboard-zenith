
import { useState, useEffect } from 'react';

export interface CloudLatencyResult {
  provider_name: string;
  endpoint: string;
  test_type: string;
  method: string;
  date: string;
  p50_latency: number;
  p90_latency: number;
  total_pings: number;
  success_rate: number;
}

export const useCloudLatency = (networkId: string) => {
  const [results, setResults] = useState<CloudLatencyResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchCloudLatency = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch data from the API
        const response = await fetch('https://edgeprobe.fly.dev/simple-latency');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data: CloudLatencyResult[] = await response.json();
        
        // Filter results for the current network if needed
        // In the future, we can add network filtering based on the API response
        
        setResults(data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Error fetching cloud latency data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch cloud latency data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCloudLatency();
  }, [networkId]);

  return {
    results,
    isLoading,
    error,
    lastUpdated
  };
};
