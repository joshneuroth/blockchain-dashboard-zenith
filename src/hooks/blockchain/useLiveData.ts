import { useEffect, useRef } from 'react';
import { NETWORKS, fetchBlockchainData } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { NetworkData } from './types';
import { calculateBlocksPerMinute } from './useBlockMetrics';
import { LatencyResult } from './useLatencyTest';

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
        
        // Store latency results for each provider
        const latencyResults: LatencyResult[] = [];
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const blockData = result.value;
            providers[blockData.provider] = blockData;
            successfulFetches++;
            
            // Add latency result with required properties
            latencyResults.push({
              provider: blockData.provider,
              endpoint: blockData.endpoint,
              latency: blockData.latency || null,
              samples: blockData.latency ? [blockData.latency] : [],
              medianLatency: blockData.latency || null,
              status: 'success'
            });
          } else {
            // Add failed result with required properties
            const rpc = network.rpcs[index];
            
            // Determine error type
            let errorType: LatencyResult['errorType'] = 'unknown';
            let errorMessage = result.reason?.message || 'Unknown error';
            
            if (errorMessage.includes('timeout') || result.reason instanceof DOMException && result.reason.name === 'TimeoutError') {
              errorType = 'timeout';
              errorMessage = 'Connection timed out';
            } else if (errorMessage.includes('rate') || errorMessage.includes('429')) {
              errorType = 'rate-limit';
              errorMessage = 'Rate limit exceeded';
            } else if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('connection')) {
              errorType = 'connection';
              errorMessage = 'Connection failed';
            } else if (errorMessage.includes('RPC error') || errorMessage.includes('error code')) {
              errorType = 'rpc-error';
              errorMessage = 'RPC error';
            }
            
            latencyResults.push({
              provider: rpc.name,
              endpoint: rpc.url,
              latency: null,
              samples: [], // Add empty samples array
              medianLatency: null, // Add null medianLatency
              status: 'error',
              errorMessage,
              errorType
            });
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
        
        // Store the latency results in localStorage for the useLatencyTest hook to access
        localStorage.setItem(`latency-results-${networkId}`, JSON.stringify({
          results: latencyResults,
          timestamp: Date.now()
        }));
        
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
          
          // Save to database and limit to 100 records
          const { error: insertError } = await supabase
            .from('blockchain_readings')
            .insert({
              network_id: networkId,
              providers_data: JSON.stringify(providerStatusMap),
              created_at: new Date(timestamp).toISOString()
            });
            
          if (insertError) {
            console.error("Error saving blockchain data:", insertError);
          } else {
            // After inserting, clean up old records by keeping only the newest 100
            const { data: countData } = await supabase
              .from('blockchain_readings')
              .select('id', { count: 'exact', head: true })
              .eq('network_id', networkId);

            const count = countData?.count;

            if (count && count > 100) {
              // Get the cutoff point (the 100th newest record's timestamp)
              const { data: oldestKeepData } = await supabase
                .from('blockchain_readings')
                .select('created_at')
                .eq('network_id', networkId)
                .order('created_at', { ascending: false })
                .limit(1)
                .offset(99); // 0-indexed, so 99 is the 100th record
              
              if (oldestKeepData && oldestKeepData.length > 0) {
                const cutoffTimestamp = oldestKeepData[0].created_at;
                
                // Delete everything older than the cutoff
                const { error: deleteError } = await supabase
                  .from('blockchain_readings')
                  .delete()
                  .eq('network_id', networkId)
                  .lt('created_at', cutoffTimestamp);
                
                if (deleteError) {
                  console.error("Error cleaning up old blockchain data:", deleteError);
                } else {
                  console.log(`Cleaned up blockchain_readings table, keeping only the latest 100 records for ${networkId}`);
                }
              }
            }
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
    
    // Use a consistent 30-second interval for polling
    const intervalId = setInterval(fetchData, 30000);
    
    return () => {
      clearInterval(intervalId);
      isMounted.current = false;
    };
  }, [networkId, data.blockHistory, data.blockTimeMetrics, isInitialLoad, setData]);
};
