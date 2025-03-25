
import { useState, useEffect, useRef } from 'react';
import { NETWORKS, BlockData, NetworkData, fetchBlockchainData } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const isInitialLoad = useRef(true);

  // Load historical data from database
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true }));
        
        // Get data from the last 10 minutes
        const tenMinutesAgo = new Date();
        tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
        
        const { data: blockData, error } = await supabase
          .from('blockchain_readings')
          .select('*')
          .eq('network_id', networkId)
          .gte('created_at', tenMinutesAgo.toISOString())
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        if (blockData && blockData.length > 0) {
          // Transform database data to match our application's format
          const transformedHistory = blockData.map(record => ({
            timestamp: new Date(record.created_at).getTime(),
            providers: typeof record.providers_data === 'string' 
              ? JSON.parse(record.providers_data) 
              : record.providers_data
          }));
          
          // Get the most recent entry for the lastBlock
          const lastEntry = transformedHistory[transformedHistory.length - 1];
          const providers = lastEntry.providers;
          
          // Find the highest block
          let highestBlock: BlockData | null = null;
          let highestHeight = BigInt(0);
          
          Object.entries(providers).forEach(([providerName, providerData]) => {
            // Type assertion to ensure TypeScript knows the structure
            const typedProviderData = providerData as { 
              height: string;
              endpoint: string;
              status: string;
              blocksBehind: number;
            };
            
            const height = BigInt(typedProviderData.height);
            if (height > highestHeight) {
              highestHeight = height;
              highestBlock = {
                height: typedProviderData.height,
                timestamp: lastEntry.timestamp,
                provider: providerName,
                endpoint: typedProviderData.endpoint
              };
            }
          });
          
          setData(prev => ({
            ...prev,
            lastBlock: highestBlock,
            blockHistory: transformedHistory,
            providers,
            isLoading: false,
            error: null
          }));
        }
      } catch (error) {
        console.error("Error loading historical data:", error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load historical data'
        }));
      } finally {
        isInitialLoad.current = false;
      }
    };
    
    fetchHistoricalData();
  }, [networkId]);

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
          let blocksPerMinute = data.blockTimeMetrics.blocksPerMinute;
          const now = Date.now();
          
          if (now - data.blockTimeMetrics.lastCalculated > 30000 && updatedHistory.length >= 2) {
            const oldestIndex = Math.max(0, updatedHistory.length - 18);
            const oldestBlockTime = updatedHistory[oldestIndex].timestamp;
            const newestBlockTime = updatedHistory[updatedHistory.length - 1].timestamp;
            const minutesElapsed = (newestBlockTime - oldestBlockTime) / 60000;
            
            if (minutesElapsed > 0) {
              // Get the highest blocks from oldest and newest measurements
              const oldestMeasurement = updatedHistory[oldestIndex];
              const newestMeasurement = updatedHistory[updatedHistory.length - 1];
              
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
    
    // Set interval to 10 seconds as requested
    const intervalId = setInterval(fetchData, 10000);
    
    return () => {
      clearInterval(intervalId);
      isMounted.current = false;
    };
  }, [networkId, data.blockHistory, data.blockTimeMetrics]);

  return data;
};
