
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
        
        // Fetch data from the API with better error handling and timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store'
          },
          mode: 'cors', // Explicitly set CORS mode
          credentials: 'omit', // Don't send cookies
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
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
        
        // More detailed error message
        let errorMsg = "Failed to fetch cloud latency data";
        
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            errorMsg = "Request timed out after 10 seconds";
          } else {
            errorMsg = err.message;
          }
        }
        
        setError(errorMsg);
        
        // Implement progressive retry logic with increasing delays
        if (retryCount < 3) {
          const delayMs = 1000 * Math.pow(2, retryCount); // Exponential backoff: 1s, 2s, 4s
          console.log(`Retrying fetch in ${delayMs/1000}s (attempt ${retryCount + 1}/3)...`);
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delayMs);
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
