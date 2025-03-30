
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
        
        // Fetch data from the API with proper error handling
        const response = await fetch('https://edgeprobe.fly.dev/simple-latency', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors', // Explicitly set CORS mode
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
        }
        
        const data: CloudLatencyResult[] = await response.json();
        
        // Filter results for the current network if needed
        // For now, we're using all the results since the API doesn't provide network-specific filtering
        
        setResults(data);
        setLastUpdated(new Date());
        console.log("Cloud latency data loaded successfully:", data);
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
