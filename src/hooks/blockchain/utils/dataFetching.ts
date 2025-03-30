
import { fetchBlockchainData } from '@/lib/api';
import { LatencyResult } from '../useLatencyTest';

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
      
      // Determine error type
      let errorType: LatencyResult['errorType'] = 'unknown';
      let errorMessage = result.reason?.message || 'Unknown error';
      
      if (errorMessage.includes('timeout') || result.reason instanceof DOMException && result.reason.name === 'TimeoutError') {
        errorType = 'timeout';
        errorMessage = 'Connection timed out';
      } else if (errorMessage.includes('rate') || errorMessage.includes('429')) {
        errorType = 'rate-limit';
        errorMessage = 'Rate limit exceeded';
      } else if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('connection')) {
        errorType = 'connection';
        errorMessage = 'Connection failed';
      } else if (errorMessage.includes('RPC error') || errorMessage.includes('error code')) {
        errorType = 'rpc-error';
        errorMessage = 'RPC error';
      }
      
      latencyResults.push({
        provider: rpc.name,
        endpoint: rpc.url,
        latency: null,
        samples: [],
        medianLatency: null,
        status: 'error',
        errorMessage,
        errorType
      });
    }
  });

  return { providers, latencyResults, successfulFetches };
};

// Import from another new utility file
import { saveProviderLatency } from './latencyTracking';
