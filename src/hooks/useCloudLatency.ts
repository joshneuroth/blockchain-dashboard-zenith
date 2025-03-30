
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState } from 'react';

export interface CloudLatencyData {
  provider_name: string;
  response_time: number;
  status: number;
  method: string;
  timestamp: string;
}

export const useCloudLatency = (networkId: string) => {
  const { toast } = useToast();
  const hasShownErrorToast = useRef(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  const fetchCloudLatencyData = async (): Promise<CloudLatencyData[]> => {
    const apiUrl = 'https://edgeprobe.fly.dev/simple-latency';
    const queryParams = new URLSearchParams({ days: '7' }).toString();
    const fullUrl = `${apiUrl}?${queryParams}`;
    
    console.log('Fetching cloud latency data with URL:', fullUrl);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        signal: AbortSignal.timeout(15000) // 15 seconds timeout
      });
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error ${response.status}:`, errorText);
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Cloud latency data received:', data.length, 'records');
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data available or invalid data format');
      }
      
      return data;
    } catch (error) {
      console.error('Fetch error details:', error);
      setLastError(error instanceof Error ? error.message : String(error));
      throw error;
    }
  };

  const result = useQuery({
    queryKey: ['cloudLatency', networkId],
    queryFn: fetchCloudLatencyData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Extract data and hook callbacks
  const { data = [], isLoading, error, refetch } = result;

  // Handle errors outside the query configuration, but only show the toast once
  if (error && !hasShownErrorToast.current) {
    console.error('Error fetching cloud latency data:', error, 'Last error:', lastError);
    toast({
      title: "Connection Issue",
      description: `Could not load cloud latency data. Click 'Retry' to try again.`,
      variant: "destructive",
    });
    hasShownErrorToast.current = true;
  }

  // Reset error toast flag when refetching
  const wrappedRefetch = () => {
    hasShownErrorToast.current = false;
    return refetch();
  };

  return { data, isLoading, error, refetch: wrappedRefetch, lastError };
};
