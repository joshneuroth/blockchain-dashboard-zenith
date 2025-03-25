
import { useState, useEffect } from 'react';
import { NETWORKS, BlockData, NetworkData, fetchBlockchainData } from '@/lib/api';

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

  useEffect(() => {
    const network = NETWORKS[networkId as keyof typeof NETWORKS];
    if (!network) return;

    const fetchData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));
        
        const results = await Promise.allSettled(
          network.rpcs.map(rpc => fetchBlockchainData(networkId, rpc.url))
        );
        
        const providers: { [key: string]: BlockData } = {};
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const blockData = result.value;
            providers[blockData.provider] = blockData;
          }
        });
        
        // Find the highest block among providers
        const blockHeights = Object.values(providers).map(p => BigInt(p.height));
        const highestBlockHeight = blockHeights.length > 0 
          ? blockHeights.reduce((max, h) => h > max ? h : max).toString()
          : "0";
        
        const highestProvider = Object.values(providers).find(p => p.height === highestBlockHeight);
        
        if (highestProvider) {
          // Update block history (keep last 18 blocks)
          const updatedHistory = [...data.blockHistory];
          
          const timestamp = Date.now();
          const lastTimestamp = data.blockHistory.length > 0 
            ? data.blockHistory[0].timestamp 
            : timestamp;
          
          const timeDiff = Math.floor((timestamp - lastTimestamp) / 1000);
          
          // Only add a new entry if the block height changed
          if (data.lastBlock?.height !== highestBlockHeight) {
            updatedHistory.unshift({
              height: highestBlockHeight,
              timestamp,
              timeDiff: timeDiff
            });
          }
          
          // Keep only the last 18 blocks for the chart
          if (updatedHistory.length > 18) {
            updatedHistory.pop();
          }
          
          // Calculate blocks per minute
          let blocksPerMinute = data.blockTimeMetrics.blocksPerMinute;
          const now = Date.now();
          
          // Recalculate blocks per minute every 30 seconds
          if (now - data.blockTimeMetrics.lastCalculated > 30000 && updatedHistory.length >= 2) {
            // Calculate time range in minutes
            const oldestBlockTime = updatedHistory[updatedHistory.length - 1].timestamp;
            const newestBlockTime = updatedHistory[0].timestamp;
            const minutesElapsed = (newestBlockTime - oldestBlockTime) / 60000;
            
            if (minutesElapsed > 0) {
              // Count blocks in the time range
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
        } else {
          setData(prev => ({
            ...prev,
            isLoading: false,
            error: 'Failed to fetch blockchain data from any provider'
          }));
        }
      } catch (error) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred'
        }));
      }
    };

    // Fetch initial data
    fetchData();
    
    // Set up polling every 10 seconds
    const intervalId = setInterval(fetchData, 10000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [networkId]);

  return data;
};
