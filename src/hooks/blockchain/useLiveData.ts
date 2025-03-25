import { useEffect, useRef } from 'react';
import { NETWORKS, fetchBlockchainData } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { NetworkData } from './types';
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
        
        const results = await Promise.allSettled(
          network.rpcs.map(rpc => fetchBlockchainData(networkId, rpc.url))
        );
        
        const providers: { [key: string]: any } = {};
        let successfulFetches = 0;
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const blockData = result.value;
            providers[blockData.provider] = blockData;
            successfulFetches++;
          } else {
            console.error(`Failed to fetch from ${network.rpcs[index].name}:`, result.reason);
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
          const timestamp = Date.now();
          const providerStatusMap: {
            [key: string]: {
              height: string;
              endpoint: string;
              status: 'synced' | 'behind' | 'far-behind';
              blocksBehind: number;
            }
          } = {};
          
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
          
          try {
            const { error } = await supabase
              .from('blockchain_readings')
              .insert({
                network_id: networkId,
                providers_data: JSON.stringify(providerStatusMap),
                created_at: new Date(timestamp).toISOString()
              });
              
            if (error) {
              console.error("Error saving blockchain data:", error);
            }
          } catch (dbError) {
            console.error("Database error:", dbError);
          }

          const tenMinutesAgo = timestamp - 10 * 60 * 1000;
          const updatedHistory = [
            ...data.blockHistory.filter(item => item.timestamp > tenMinutesAgo), 
            {
              timestamp,
              providers: providerStatusMap
            }
          ];
          
          const blockTimeMetrics = calculateBlocksPerMinute(updatedHistory, data.blockTimeMetrics);
          
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
        console.error("Error in fetchData:", error);
        if (isMounted.current) {
          setData(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
          }));
        }
      }
    };

    const intervalId = setInterval(fetchData, 10000);
    
    return () => {
      clearInterval(intervalId);
      isMounted.current = false;
    };
  }, [networkId, data.blockHistory, data.blockTimeMetrics, isInitialLoad, setData]);
};
