
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
