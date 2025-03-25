
import { useEffect, useRef } from 'react';
import { NETWORKS, fetchBlockchainData } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
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
              blocksBehind,
              blockTime: providerData.blockTime || null,
              transactionCount: providerData.transactionCount || 0
            };
          });
          
          // Create the measurement record
          const newMeasurement = {
            timestamp,
            providers: providerStatusMap
          };
          
          // Save to database
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

          // Update the history with the new measurement and limit to 10 minutes
          const tenMinutesAgo = timestamp - 10 * 60 * 1000;
          const updatedHistory = [
            ...data.blockHistory.filter(item => item.timestamp > tenMinutesAgo), 
            newMeasurement
          ];
          
          // Calculate blocks per minute metrics
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
    
    // Set interval to 10 seconds
    const intervalId = setInterval(fetchData, 10000);
    
    return () => {
      clearInterval(intervalId);
      isMounted.current = false;
    };
  }, [networkId, data.blockHistory, data.blockTimeMetrics, isInitialLoad, setData]);
};
