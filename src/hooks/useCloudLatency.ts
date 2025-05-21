
import { useState, useEffect } from 'react';

// Interface for the test method in the API response
interface TestMethod {
  test_type: string;
  method: string;
  p50_latency_ms: number;
  p90_latency_ms: number;
  sample_size: number;
}

// Interface for the region in the API response
interface Region {
  region: string;
  test_methods: TestMethod[];
}

// Interface for the network in the API response
interface Network {
  network: string;
  chain_id: string;
  regions: Region[];
}

// Interface for the provider in the API response
interface Provider {
  provider: string;
  networks: Network[];
}

// Interface for the new API response format
interface NewApiResponse {
  providers: Provider[];
}

// Our application's internal data model
export interface CloudLatencyData {
  provider: string;
  origin: {
    city?: string;
    region?: string;
    country?: string;
  };
  method?: string;
  p50_latency: number;
  p90_latency: number;
  sample_size: number;
  success_rate?: number;
  timestamp?: string;
  test_type?: string;
}

export const useCloudLatency = (networkId: string) => {
  const [data, setData] = useState<CloudLatencyData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Fetching cloud latency data for network ${networkId}...`);
        
        // Updated API endpoint with the provided URL and API key
        const apiUrl = `https://api.internal.blockheight.xyz/latency?api_key=bh_a7c63f38-5757-4250-88cd-8d1f842a7142`;
        
        console.log(`Calling API: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000)
        });
        
        console.log(`API Response status: ${response.status}`);
        
        if (!response.ok) {
          console.error(`API returned status: ${response.status}`);
          const errorText = await response.text();
          console.error(`Error response: ${errorText}`);
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const rawData = await response.json();
        console.log('Retrieved raw cloud data', JSON.stringify(rawData, null, 2));
        setRawApiResponse(rawData);
        
        // Handle the new API response format
        if (!rawData || typeof rawData !== 'object') {
          console.error('Unexpected API response format:', rawData);
          throw new Error('Invalid data format received from API');
        }
        
        // Process new format with providers, networks, regions, and test_methods
        if (rawData.providers && Array.isArray(rawData.providers)) {
          console.log(`Processing new format with ${rawData.providers.length} providers`);
          
          const processedData: CloudLatencyData[] = [];
          
          // Filter for the requested network ID
          rawData.providers.forEach((provider: Provider) => {
            const networkData = provider.networks.find(
              (network) => network.chain_id === networkId
            );
            
            if (networkData) {
              networkData.regions.forEach((region) => {
                region.test_methods.forEach((method) => {
                  processedData.push({
                    provider: provider.provider,
                    origin: {
                      region: region.region
                    },
                    method: method.method,
                    p50_latency: method.p50_latency_ms,
                    p90_latency: method.p90_latency_ms,
                    sample_size: method.sample_size,
                    success_rate: 1.0, // Default if not provided
                    test_type: method.test_type
                  });
                });
              });
            }
          });
          
          console.log('Processed new format data:', processedData);
          setData(processedData);
        } 
        // Fall back to legacy formats if the new format isn't recognized
        else if (Array.isArray(rawData)) {
          console.log('API returned an array format (legacy)');
          
          // This is the old format handling code
          if (rawData.length === 0) {
            console.log('API returned empty array');
            setData([]);
            setIsLoading(false);
            return;
          }
          
          // Check if it's an array of region/metrics objects
          if (rawData.length > 0 && rawData[0].region && Array.isArray(rawData[0].metrics)) {
            console.log('API returned array of region/metrics objects');
            
            // Process old region/metrics format
            const processedData: CloudLatencyData[] = rawData.flatMap((regionData: any) => {
              console.log(`Processing region: ${regionData.region} with ${regionData.metrics.length} metrics`);
              return regionData.metrics.map((item: any) => ({
                provider: item.provider || 'Unknown',
                origin: {
                  region: regionData.region
                },
                method: item.method || 'eth_blockNumber',
                p50_latency: item.p50_latency_ms,
                p90_latency: item.p90_latency_ms,
                sample_size: item.sample_size || 0,
                success_rate: 1.0, // Default if not provided
                timestamp: item.last_updated
              }));
            });
            
            console.log('Processed multiple regions data:', processedData);
            setData(processedData);
          } else {
            // Process very old format array
            console.log('Processing old format array data');
            const processedData: CloudLatencyData[] = rawData.map((item: any) => ({
              provider: item.provider || 'Unknown',
              origin: {
                city: item.origin?.city,
                region: item.origin?.region,
                country: item.origin?.country
              },
              method: item.method || 'eth_blockNumber',
              p50_latency: item.p50_latency_ms !== undefined ? item.p50_latency_ms : 
                         (item.avg_p50_latency_ms !== undefined ? item.avg_p50_latency_ms : 0),
              p90_latency: item.p90_latency_ms !== undefined ? item.p90_latency_ms : 
                         (item.avg_p90_latency_ms !== undefined ? item.avg_p90_latency_ms : 0),
              sample_size: item.sample_size || 0,
              success_rate: item.success_rate || 1.0,
              timestamp: item.timestamp
            }));
            
            console.log('Processed old format data:', processedData);
            setData(processedData);
          }
        } 
        // Legacy format - object with region and metrics array
        else if (rawData.region && Array.isArray(rawData.metrics)) {
          console.log(`API returned legacy format with region: ${rawData.region} and ${rawData.metrics.length} metrics`);
          const region = rawData.region;
          const metrics = rawData.metrics;
          
          if (metrics.length === 0) {
            console.log('API returned empty metrics array');
            setData([]);
            setIsLoading(false);
            return;
          }
          
          // Process legacy format
          const processedData: CloudLatencyData[] = metrics.map((item: any) => ({
            provider: item.provider || 'Unknown',
            origin: {
              region: region
            },
            method: item.method || 'eth_blockNumber',
            p50_latency: item.p50_latency_ms,
            p90_latency: item.p90_latency_ms,
            sample_size: item.sample_size || 0,
            success_rate: 1.0, // Default if not provided
            timestamp: item.last_updated
          }));
          
          console.log('Processed legacy format data:', processedData);
          setData(processedData);
        }
        else {
          console.error('Unrecognized API response format:', rawData);
          throw new Error('Unrecognized data format received from API');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching cloud latency data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch');
        setData(null);
        setIsLoading(false);
      }
    };

    if (networkId) {
      fetchData();
    } else {
      console.error('Network ID is undefined or empty');
      setError('Missing network ID');
      setIsLoading(false);
    }
    
    return () => {
      // AbortController cleanup happens automatically with AbortSignal.timeout
    };
  }, [networkId]);

  return { data, isLoading, error, rawApiResponse };
};
