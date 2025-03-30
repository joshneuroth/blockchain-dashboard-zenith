
import { fetchBlockchainData } from '@/lib/api';
import type { LatencyResult } from './latencyUtils';
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
