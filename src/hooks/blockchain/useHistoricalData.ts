
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NetworkData } from './types';

export const useHistoricalData = (networkId: string, setData: React.Dispatch<React.SetStateAction<NetworkData>>) => {
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
          let highestBlock = null;
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
      }
    };
    
    fetchHistoricalData();
  }, [networkId, setData]);
};
