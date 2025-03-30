
import { useState, useEffect } from 'react';
import { NetworkData } from './types';

export const useHistoricalData = (networkId: string, setData: React.Dispatch<React.SetStateAction<NetworkData>>) => {
  useEffect(() => {
    const fetchHistoricalData = () => {
      try {
        setData(prev => ({ ...prev, isLoading: true }));
        
        // Get local storage key for this network
        const localStorageKey = `blockchain-history-${networkId}`;
        const storedData = localStorage.getItem(localStorageKey);
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          
          if (parsedData && parsedData.blockHistory && parsedData.blockHistory.length > 0) {
            // Filter to only include data from the last 10 minutes
            const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
            const recentHistory = parsedData.blockHistory.filter((item: any) => 
              item.timestamp >= tenMinutesAgo
            );
            
            if (recentHistory.length > 0) {
              // Get the most recent entry for the lastBlock
              const lastEntry = recentHistory[recentHistory.length - 1];
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
              
              // Get current providers from the most recent data point
              const lastBlockProviders: { [key: string]: any } = {};
              Object.entries(providers).forEach(([providerName, data]) => {
                const providerData = data as { 
                  height: string;
                  endpoint: string;
                  status: string;
                  blocksBehind: number;
                };
                
                lastBlockProviders[providerName] = {
                  height: providerData.height,
                  timestamp: lastEntry.timestamp,
                  provider: providerName,
                  endpoint: providerData.endpoint
                };
              });
              
              setData(prev => ({
                ...prev,
                lastBlock: highestBlock,
                blockHistory: recentHistory,
                providers: lastBlockProviders,
                isLoading: false,
                error: null
              }));
              return;
            }
          }
        }
        
        // If we get here, we either had no data or it was all too old
        setData(prev => ({
          ...prev,
          isLoading: false
        }));
      } catch (error) {
        console.error("Error loading local historical data:", error);
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
