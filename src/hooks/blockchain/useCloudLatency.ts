
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
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    const fetchCloudLatency = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching cloud latency data...");
        
        // Add a timestamp to bust cache
        const timestamp = new Date().getTime();
        const url = `https://edgeprobe.fly.dev/simple-latency?t=${timestamp}`;
        
        // Fetch data from the API with proper error handling
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store'
          },
          mode: 'cors', // Explicitly set CORS mode
          credentials: 'omit', // Don't send cookies
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
        setRetryCount(0); // Reset retry count on success
        console.log("Cloud latency data loaded successfully:", data);
      } catch (err) {
        console.error("Error fetching cloud latency data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch cloud latency data");
        
        // Implement retry logic
        if (retryCount < 3) {
          console.log(`Retrying fetch (${retryCount + 1}/3)...`);
          setRetryCount(prev => prev + 1);
          // We'll let the next useEffect run trigger the retry
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCloudLatency();
    
    // Set up an interval to refresh data every 5 minutes
    const intervalId = setInterval(fetchCloudLatency, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [networkId, retryCount]);

  return {
    results,
    isLoading,
    error,
    lastUpdated,
    retry: () => setRetryCount(count => count + 1)
  };
};
