
import { useState, useRef } from 'react';
import { NetworkData } from './blockchain/types';
import { useHistoricalData } from './blockchain/useHistoricalData';
import { useLiveData } from './blockchain/useLiveData';

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
  
  const isInitialLoad = useRef(true);

  // Load historical data from database
  useHistoricalData(networkId, setData);

  // Set up live data fetching and updating
  useLiveData(networkId, data, setData, isInitialLoad);

  return data;
};
