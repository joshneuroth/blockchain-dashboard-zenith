
import { useMemo } from 'react';
import { NetworkData } from './types';

export type TimePeriod = 'all-time' | 'last-100';

export interface ProviderReliability {
  name: string;
  total: number;
  inSync: number;
  syncPercentage: number;
}

export const useReliabilityData = (
  networkData: NetworkData,
  timePeriod: TimePeriod
): ProviderReliability[] => {
  const { blockHistory } = networkData;

  return useMemo(() => {
    if (!blockHistory || blockHistory.length === 0) {
      return [];
    }

    // Filter readings based on time period
    const readings = timePeriod === 'last-100' 
      ? blockHistory.slice(-100) 
      : blockHistory;

    // Initialize providers statistics
    const providerStats: Record<string, { total: number; inSync: number }> = {};

    // Analyze each reading
    readings.forEach(reading => {
      Object.entries(reading.providers).forEach(([providerName, data]) => {
        if (!providerStats[providerName]) {
          providerStats[providerName] = { total: 0, inSync: 0 };
        }
        
        providerStats[providerName].total += 1;
        if (data.status === 'synced') {
          providerStats[providerName].inSync += 1;
        }
      });
    });

    // Convert to array and calculate percentages
    return Object.entries(providerStats)
      .map(([name, { total, inSync }]) => ({
        name,
        total,
        inSync,
        syncPercentage: total > 0 ? (inSync / total) * 100 : 0
      }))
      .sort((a, b) => b.syncPercentage - a.syncPercentage);
  }, [blockHistory, timePeriod]);
};
