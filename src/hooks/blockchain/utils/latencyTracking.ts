
import { calculateMedian } from './latencyUtils';

// Store latency in local storage for use by the latency test
export const saveProviderLatency = (
  networkId: string,
  providerName: string,
  endpoint: string,
  latency: number | null | undefined
) => {
  if (!latency) return;
  
  const blockHeightLatencyKey = `blockheight-latency-${networkId}`;
  
  try {
    let latencyData: Record<string, any> = {};
    const existingData = localStorage.getItem(blockHeightLatencyKey);
    
    if (existingData) {
      latencyData = JSON.parse(existingData);
    }
    
    // Update with the latest latency reading
    latencyData[providerName] = {
      latency,
      endpoint,
      timestamp: Date.now()
    };
    
    localStorage.setItem(blockHeightLatencyKey, JSON.stringify(latencyData));
    
    // Dispatch a storage event for the latency test to pick up
    window.dispatchEvent(new StorageEvent('storage', {
      key: blockHeightLatencyKey,
      newValue: JSON.stringify(latencyData)
    }));
  } catch (e) {
    console.error('Error storing latency data:', e);
  }
};

// Update dataFetching.ts to use our new utility functions

<lov-write file_path="src/hooks/blockchain/utils/dataFetching.ts">
import { fetchBlockchainData } from '@/lib/api';
import { LatencyResult } from '../utils/latencyUtils';
import { saveProviderLatency } from './latencyTracking';
import { categorizeLatencyError } from './latencyUtils';

export const fetchBlockchainProviderData = async (network: any, networkId: string) => {
  const results = await Promise.allSettled(
    network.rpcs.map((rpc: any) => fetchBlockchainData(networkId, rpc.url))
  );
  
  const providers: { [key: string]: any } = {};
  let successfulFetches = 0;
  
  // Store latency results for each provider
  const latencyResults: LatencyResult[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const blockData = result.value;
      providers[blockData.provider] = blockData;
      successfulFetches++;
      
      // Add latency result with required properties
      latencyResults.push({
        provider: blockData.provider,
        endpoint: blockData.endpoint,
        latency: blockData.latency || null,
        samples: blockData.latency ? [blockData.latency] : [],
        medianLatency: blockData.latency || null,
        status: 'success'
      });
      
      // Save provider latency to localStorage
      saveProviderLatency(networkId, blockData.provider, blockData.endpoint, blockData.latency);
    } else {
      // Add failed result with required properties
      const rpc = network.rpcs[index];
      
      // Use the utility function to categorize error
      const errorResult = categorizeLatencyError(result.reason, rpc.name, rpc.url);
      latencyResults.push(errorResult);
    }
  });

  return { providers, latencyResults, successfulFetches };
};
