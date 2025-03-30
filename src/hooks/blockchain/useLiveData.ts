
import { useEffect, useRef } from 'react';
import { NETWORKS } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { NetworkData } from './types';
import { fetchBlockchainProviderData } from './utils/dataFetching';
import { saveProviderLatency } from './utils/latencyTracking';
import { saveBlockchainData, cleanupOldRecords } from './utils/databaseOperations';
import { processProviderStatusMap } from './utils/dataProcessing';
import { calculateBlocksPerMinute } from './useBlockMetrics';

export const useLiveData = (
  networkId: string, 
  data: NetworkData,
  setData: React.Dispatch<React.SetStateAction<NetworkData>>,
  isInitialLoad: React.MutableRefObject<boolean>
) => {
  const isMounted = useRef(true);
  const failureCount = useRef(0);
  
  useEffect(() => {
    isMounted.current = true;
    failureCount.current = 0;
    
    const network = NETWORKS[networkId as keyof typeof NETWORKS];
    if (!network) return;

    const fetchData = async () => {
      try {
        if (isMounted.current && !isInitialLoad.current) {
          setData(prev => ({ ...prev, isLoading: true, error: null }));
        }
        
        const { providers, latencyResults, successfulFetches } = await fetchBlockchainProviderData(network, networkId);
        
        if (successfulFetches === 0) {
          failureCount.current++;
          
          if (failureCount.current >= 3 && failureCount.current % 3 === 0) {
            toast({
              title: `${network.name} Connection Issues`,
              description: "Having trouble connecting to blockchain nodes. Will keep trying.",
              variant: "destructive",
            });
          }
          
          throw new Error(`Failed to fetch data from any ${network.name} provider`);
        } else {
          failureCount.current = 0;
        }
        
        // Store the latency results in localStorage for the useLatencyTest hook to access
        localStorage.setItem(`latency-results-${networkId}`, JSON.stringify({
          results: latencyResults,
          timestamp: Date.now()
        }));
        
        // Process the provider data and update the state
        const timestamp = Date.now();
        const providerStatusMap = processProviderStatusMap(providers);
        
        // Save to localStorage instead of database
        await saveBlockchainData(networkId, providerStatusMap, timestamp);
        await cleanupOldRecords(networkId);

        // Update the history with the new measurement and limit to 10 minutes
        const tenMinutesAgo = timestamp - 10 * 60 * 1000;
        const updatedHistory = [
          ...data.blockHistory.filter(item => item.timestamp > tenMinutesAgo), 
          {
            timestamp,
            providers: providerStatusMap
          }
        ];
        
        // Save the updated history to localStorage
        const localStorageKey = `blockchain-history-${networkId}`;
        localStorage.setItem(localStorageKey, JSON.stringify({ 
          blockHistory: updatedHistory,
          lastUpdated: timestamp
        }));
        
        // Calculate blocks per minute metrics
        const blockTimeMetrics = calculateBlocksPerMinute(updatedHistory, data.blockTimeMetrics);
        
        // Find the provider with the highest block
        const { highestProvider } = findHighestBlockProvider(providers);
        
        if (highestProvider && isMounted.current) {
          setData({
            lastBlock: highestProvider,
            blockHistory: updatedHistory,
            providers,
            isLoading: false,
            error: null,
            blockTimeMetrics
          });
        }
      } catch (error) {
        if (isMounted.current && !isInitialLoad.current) {
          setData(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
          }));
        }
      }
    };

    fetchData();
    
    // Use a consistent 30-second interval for polling
    const intervalId = setInterval(fetchData, 30000);
    
    return () => {
      clearInterval(intervalId);
      isMounted.current = false;
    };
  }, [networkId, data.blockHistory, data.blockTimeMetrics, isInitialLoad, setData]);
};

// Helper functions
const findHighestBlockProvider = (providers: { [key: string]: any }) => {
  // Determine the highest block
  const blockHeights = Object.values(providers).map(p => BigInt(p.height));
  const highestBlockHeight = blockHeights.length > 0 
    ? blockHeights.reduce((max, h) => h > max ? h : max).toString()
    : "0";
  
  // Find the provider with the highest block
  const highestProvider = Object.values(providers).find(p => p.height === highestBlockHeight);
  
  return { highestProvider, highestBlockHeight };
};
