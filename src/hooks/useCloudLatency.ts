
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface CloudLatencyData {
  provider_name: string;
  response_time: number;
  status: number;
  method: string;
  timestamp: string;
}

export const useCloudLatency = (networkId: string) => {
  const { toast } = useToast();
  
  const fetchCloudLatencyData = async (): Promise<CloudLatencyData[]> => {
    console.log('Fetching cloud latency data...');
    const response = await fetch('https://edgeprobe.fly.dev/simple-latency?days=7', {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(20000) // 20 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Cloud latency data received:', data.length, 'records');
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data available');
    }
    
    return data;
  };

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['cloudLatency', networkId],
    queryFn: fetchCloudLatencyData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff with max 30s
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.error('Error fetching cloud latency data:', err);
      toast({
        title: "Connection Issue",
        description: "Could not load cloud latency data. Click 'Retry' to try again.",
        variant: "destructive",
      });
    }
  });

  return { data, isLoading, error, refetch };
};
