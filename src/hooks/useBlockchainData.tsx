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
        
        const blockHeights = Object.values(providers).map(p => BigInt(p.height));
        const highestBlockHeight = blockHeights.length > 0 
          ? blockHeights.reduce((max, h) => h > max ? h : max).toString()
          : "0";
        
        const highestProvider = Object.values(providers).find(p => p.height === highestBlockHeight);
        
        if (highestProvider && isMounted.current) {
          const updatedHistory = [...data.blockHistory];
          
          const timestamp = Date.now();
          const lastTimestamp = data.blockHistory.length > 0 
            ? data.blockHistory[0].timestamp 
            : timestamp;
          
          const timeDiff = Math.floor((timestamp - lastTimestamp) / 1000);
          
          const providerData: { [key: string]: { height: string; timestamp: number } } = {};
          Object.entries(providers).forEach(([name, data]) => {
            providerData[name] = {
              height: data.height,
              timestamp: data.timestamp
            };
          });
          
          if (data.lastBlock?.height !== highestBlockHeight) {
            updatedHistory.unshift({
              height: highestBlockHeight,
              timestamp,
              timeDiff: timeDiff,
              provider: highestProvider.provider,
              providerData
            });
          }
          
          if (updatedHistory.length > 18) {
            updatedHistory.pop();
          }
          
          let blocksPerMinute = data.blockTimeMetrics.blocksPerMinute;
          const now = Date.now();
          
          if (now - data.blockTimeMetrics.lastCalculated > 30000 && updatedHistory.length >= 2) {
            const oldestBlockTime = updatedHistory[updatedHistory.length - 1].timestamp;
            const newestBlockTime = updatedHistory[0].timestamp;
            const minutesElapsed = (newestBlockTime - oldestBlockTime) / 60000;
            
            if (minutesElapsed > 0) {
              const blocksCount = updatedHistory.length;
              blocksPerMinute = blocksCount / minutesElapsed;
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
