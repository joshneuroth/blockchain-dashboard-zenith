import { useState, useEffect, useRef } from 'react';
import { NETWORKS, BlockData, NetworkData, fetchBlockchainData } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export const useBlockchainData = (networkId: string) => {
  const [data, setData] = useState<NetworkData>({
    lastBlock: null,
    blockHistory: [],
    providers: {},
    isLoading: true,
    error: null,
    blockTimeMetrics: {
      blocksPerMinute: 0,
      lastCalculated: 0
    }
  });
  
  const isMounted = useRef(true);
  const failureCount = useRef(0);

  useEffect(() => {
    isMounted.current = true;
    failureCount.current = 0;
    
    const network = NETWORKS[networkId as keyof typeof NETWORKS];
    if (!network) return;

    const fetchData = async () => {
      try {
        if (isMounted.current) {
          setData(prev => ({ ...prev, isLoading: true, error: null }));
        }
        
        const results = await Promise.allSettled(
          network.rpcs.map(rpc => fetchBlockchainData(networkId, rpc.url))
        );
        
        const providers: { [key: string]: BlockData } = {};
        let successfulFetches = 0;
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const blockData = result.value;
            providers[blockData.provider] = blockData;
            successfulFetches++;
          }
        });
        
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
        
        // Determine the highest block
        const blockHeights = Object.values(providers).map(p => BigInt(p.height));
        const highestBlockHeight = blockHeights.length > 0 
          ? blockHeights.reduce((max, h) => h > max ? h : max).toString()
          : "0";
        
        // Find the provider with the highest block
        const highestProvider = Object.values(providers).find(p => p.height === highestBlockHeight);
        
        if (highestProvider && isMounted.current) {
          const timestamp = Date.now();
          const providerStatusMap: {
            [key: string]: {
              height: string;
              endpoint: string;
              status: 'synced' | 'behind' | 'far-behind';
              blocksBehind: number;
            }
          } = {};
          
          // Process each provider and determine its status relative to the highest block
          Object.entries(providers).forEach(([name, providerData]) => {
            const currentHeight = BigInt(providerData.height);
            const highestHeight = BigInt(highestBlockHeight);
            const blocksBehind = Number(highestHeight - currentHeight);
            
            let status: 'synced' | 'behind' | 'far-behind' = 'synced';
            if (blocksBehind > 0) {
              status = blocksBehind === 1 ? 'behind' : 'far-behind';
            }
            
            providerStatusMap[name] = {
              height: providerData.height,
              endpoint: providerData.endpoint,
              status,
              blocksBehind
            };
          });
          
          // Update the history with the new measurement
          const updatedHistory = [...data.blockHistory];
          updatedHistory.unshift({
            timestamp,
            providers: providerStatusMap
          });
          
          // Keep only the most recent measurements
          if (updatedHistory.length > 18) {
            updatedHistory.pop();
          }
          
          // Calculate blocks per minute metrics
          let blocksPerMinute = data.blockTimeMetrics.blocksPerMinute;
          const now = Date.now();
          
          if (now - data.blockTimeMetrics.lastCalculated > 30000 && updatedHistory.length >= 2) {
            const oldestBlockTime = updatedHistory[updatedHistory.length - 1].timestamp;
            const newestBlockTime = updatedHistory[0].timestamp;
            const minutesElapsed = (newestBlockTime - oldestBlockTime) / 60000;
            
            if (minutesElapsed > 0) {
              // Get the highest blocks from oldest and newest measurements
              const oldestMeasurement = updatedHistory[updatedHistory.length - 1];
              const newestMeasurement = updatedHistory[0];
              
              // Find highest block in oldest measurement
              const oldestHeights = Object.values(oldestMeasurement.providers).map(p => BigInt(p.height));
              const oldestHighest = oldestHeights.reduce((max, h) => h > max ? h : max, BigInt(0));
              
              // Find highest block in newest measurement
              const newestHeights = Object.values(newestMeasurement.providers).map(p => BigInt(p.height));
              const newestHighest = newestHeights.reduce((max, h) => h > max ? h : max, BigInt(0));
              
              // Calculate blocks per minute
              const blocksDiff = Number(newestHighest - oldestHighest);
              blocksPerMinute = blocksDiff / minutesElapsed;
            }
          }
          
          setData({
            lastBlock: highestProvider,
            blockHistory: updatedHistory,
            providers,
            isLoading: false,
            error: null,
            blockTimeMetrics: {
              blocksPerMinute: blocksPerMinute,
              lastCalculated: now
            }
          });
        }
      } catch (error) {
        if (isMounted.current) {
          setData(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
          }));
        }
      }
    };

    fetchData();
    
    const intervalId = setInterval(fetchData, 10000);
    
    return () => {
      clearInterval(intervalId);
      isMounted.current = false;
    };
  }, [networkId]);

  return data;
};
