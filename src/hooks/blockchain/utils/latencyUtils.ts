
export interface LatencyResult {
  provider: string;
  endpoint: string;
  latency: number | null; // in milliseconds
  medianLatency: number | null; // P50 latency value
  samples: number[]; // track multiple latency samples
  status: 'loading' | 'success' | 'error';
  errorMessage?: string;
  errorType?: 'timeout' | 'rate-limit' | 'connection' | 'rpc-error' | 'unknown';
}

interface StoredLatencyData {
  results: LatencyResult[];
  timestamp: number;
}

// How long to consider stored latency data valid (5 minutes)
export const LATENCY_DATA_TTL = 5 * 60 * 1000;

// Calculate median (P50) value from an array of numbers
export const calculateMedian = (values: number[]): number | null => {
  if (!values || values.length === 0) return null;
  
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
};

// Store latency results in local storage
export const storeLatencyResults = (networkId: string, results: LatencyResult[]) => {
  localStorage.setItem(`latency-results-${networkId}`, JSON.stringify({
    results,
    timestamp: Date.now()
  }));
};

// Get stored latency results from local storage
export const getStoredLatencyResults = (networkId: string): StoredLatencyData | null => {
  const storedData = localStorage.getItem(`latency-results-${networkId}`);
  if (!storedData) return null;
  
  try {
    return JSON.parse(storedData) as StoredLatencyData;
  } catch (e) {
    console.error('Error parsing stored latency data:', e);
    return null;
  }
};

// Check if stored latency results are still valid
export const isStoredLatencyValid = (storedData: StoredLatencyData | null): boolean => {
  if (!storedData) return false;
  
  const dataAge = Date.now() - storedData.timestamp;
  return dataAge < LATENCY_DATA_TTL && storedData.results.length > 0;
};

// Process and categorize error from latency test
export const categorizeLatencyError = (
  error: unknown,
  providerName: string,
  endpoint: string
): LatencyResult => {
  let errorType: LatencyResult['errorType'] = 'unknown';
  let errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  if (error instanceof DOMException && error.name === 'TimeoutError') {
    errorType = 'timeout';
    errorMessage = 'Connection timed out';
  } else if (errorMessage.includes('Failed to fetch')) {
    errorType = 'connection';
    errorMessage = 'Connection failed';
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
};
