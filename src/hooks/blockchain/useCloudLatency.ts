
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
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
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
        
        // Base URL for the API
        const baseUrl = "https://edgeprobe.fly.dev";
        
        // Step 1: First fetch available methods
        console.log("Fetching available methods...");
        const methodsResponse = await fetch(`${baseUrl}/methods`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
          cache: 'no-store',
          credentials: 'omit',
        });
        
        if (!methodsResponse.ok) {
          const errorText = await methodsResponse.text();
          throw new Error(`Failed to fetch methods. Status: ${methodsResponse.status}, Details: ${errorText}`);
        }
        
        // Parse methods response
        const methodsData = await methodsResponse.json();
        console.log("Available methods:", methodsData);
        setAvailableMethods(methodsData);
        
        // Set default selected method if not already set
        if (!selectedMethod && methodsData.length > 0) {
          setSelectedMethod(methodsData[0]);
        }
        
        // Step 2: Now fetch the latency data with the correct endpoint
        // Default to 7 days of data
        const days = 7;
        const url = `${baseUrl}/simple-latency?days=${days}`;
        
        console.log("Fetching latency data from:", url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
          cache: 'no-store',
          credentials: 'omit',
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
        }
        
        const data: CloudLatencyResult[] = await response.json();
        console.log("Cloud latency data loaded successfully:", data);
        
        setResults(data);
        setLastUpdated(new Date());
        setRetryCount(0); // Reset retry count on success
      } catch (err) {
        console.error("Error fetching cloud latency data:", err);
        
        // More detailed error message
        let errorMsg = "Failed to fetch cloud latency data";
        
        if (err instanceof Error) {
          errorMsg = err.message;
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
  }, [networkId, retryCount, selectedMethod]);

  // Filter results based on selected method
  const filteredResults = selectedMethod 
    ? results.filter(result => result.method === selectedMethod)
    : results;

  return {
    results: filteredResults,
    availableMethods,
    selectedMethod,
    setSelectedMethod,
    isLoading,
    error,
    lastUpdated,
    retry: () => setRetryCount(count => count + 1)
  };
};
