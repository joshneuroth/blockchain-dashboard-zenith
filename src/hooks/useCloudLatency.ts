
import { useState, useEffect } from 'react';

export interface CloudLatencyData {
  provider_name: string;
  origin: {
    city?: string;
    region?: string;
    country?: string;
  };
  p50_latency: number;
  p90_latency: number;
  sample_size: number;
  success_rate: number;
  timestamp: string;
}

interface RawLatencyResponse {
  metrics: {
    [key: string]: {
      [key: string]: {
        p50: number;
        p90: number;
        samplesize: number;
        success_rate: number;
      }
    }
  };
  timestamp: string;
}

export const useCloudLatency = (networkId: string) => {
  const [data, setData] = useState<CloudLatencyData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Map network IDs to chain IDs
  const getChainId = (networkId: string): string => {
    const chainIdMap: Record<string, string> = {
      ethereum: '1',
      polygon: '137',
      avalanche: '43114',
      binance: '56'
    };
    
    return chainIdMap[networkId] || '1'; // Default to Ethereum if not found
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const chainId = getChainId(networkId);
        console.log(`Fetching cloud latency data for chain ID ${chainId}...`);
        
        const apiUrl = `https://blockheight-api.fly.dev/metrics/latency?chain_id=${chainId}&metrics=p50,p90,samplesize,success_rate&group_by_origin=true`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const rawData: RawLatencyResponse = await response.json();
        console.log('Retrieved raw cloud data', rawData);
        
        // Process the data into our desired format
        const processedData: CloudLatencyData[] = [];
        
        if (rawData && rawData.metrics) {
          // For each origin
          Object.entries(rawData.metrics).forEach(([origin, providerData]) => {
            // For each provider in this origin
            Object.entries(providerData).forEach(([provider, metrics]) => {
              processedData.push({
                provider_name: provider,
                origin: {
                  region: origin,
                  city: "", // We don't have this from the API in this format
                  country: ""
                },
                p50_latency: metrics.p50,
                p90_latency: metrics.p90,
                sample_size: metrics.samplesize,
                success_rate: metrics.success_rate,
                timestamp: rawData.timestamp
              });
            });
          });
        }
        
        setData(processedData);
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
  }, [networkId]);

  return { data, isLoading, error };
};
