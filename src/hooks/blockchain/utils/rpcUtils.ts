
import type { LatencyResult } from './latencyUtils';
import { categorizeLatencyError } from './latencyUtils';

// Function to measure latency to an RPC endpoint
export const measureLatency = async (endpoint: string, providerName: string): Promise<LatencyResult> => {
  try {
    const startTime = performance.now();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
      signal: AbortSignal.timeout(5000), // 5s timeout
    });
    
    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);
    
    if (!response.ok) {
      // Categorize HTTP errors
      let errorType: LatencyResult['errorType'] = 'unknown';
      let errorMessage = `HTTP error: ${response.status}`;
      
      if (response.status === 429) {
        errorType = 'rate-limit';
        errorMessage = 'Rate limit exceeded';
      } else if (response.status >= 500) {
        errorType = 'rpc-error';
        errorMessage = 'Server error';
      } else if (response.status === 403) {
        errorType = 'connection';
        errorMessage = 'Access denied';
      }
      
      return {
        provider: providerName,
        endpoint,
        latency: null,
        samples: [],
        medianLatency: null,
        status: 'error',
        errorMessage,
        errorType
      };
    }
    
    const data = await response.json();
    
    if (data.error) {
      return {
        provider: providerName,
        endpoint,
        latency: null,
        samples: [],
        medianLatency: null,
        status: 'error',
        errorMessage: data.error.message || 'RPC error',
        errorType: 'rpc-error'
      };
    }
    
    return {
      provider: providerName,
      endpoint,
      latency,
      samples: [latency],
      medianLatency: latency, // With only one sample, median = the value
      status: 'success'
    };
  } catch (error) {
    return categorizeLatencyError(error, providerName, endpoint);
  }
};

// Process block height latency data
export const processBlockHeightLatencyData = (
  blockHeightLatency: Record<string, { latency: number, endpoint: string, timestamp: number }>,
  currentResults: LatencyResult[]
): LatencyResult[] => {
  const updatedResults = [...currentResults];
  
  // For each entry in the block height latency data
  Object.entries(blockHeightLatency).forEach(([provider, data]) => {
    const { latency, endpoint } = data;
    if (latency <= 0) return; // Skip invalid latency values
    
    // Find matching provider in existing results
    const existingIndex = updatedResults.findIndex(r => r.provider === provider);
    
    if (existingIndex >= 0) {
      // Update existing provider data
      const existing = updatedResults[existingIndex];
      const samples = [...(existing.samples || []), latency].slice(-10); // Keep last 10 samples
      
      updatedResults[existingIndex] = {
        ...existing,
        latency: latency, // Most recent latency
        samples: samples,
        medianLatency: calculateMedian(samples),
        status: 'success'
      };
    } else {
      // Add new provider data
      updatedResults.push({
        provider,
        endpoint,
        latency,
        samples: [latency],
        medianLatency: latency, // With only one sample, median = the value
        status: 'success'
      });
    }
  });
  
  return updatedResults;
};

// Import the calculateMedian function
import { calculateMedian } from './latencyUtils';
