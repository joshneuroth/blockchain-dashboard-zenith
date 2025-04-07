
import { useMemo } from 'react';
import { format } from 'date-fns';
import { BlockheightTimeSeriesData } from '@/hooks/useBlockheightTimeSeries';

export const useChartData = (
  data: BlockheightTimeSeriesData | null,
  selectedRegion: string | null
) => {
  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data?.providers) return [];

    // Get all timestamps across all providers, filtered by selected region
    const allTimestamps = new Set<number>();
    
    Object.entries(data.providers).forEach(([provider, regions]) => {
      // Filter by selected region if one is selected
      const regionsToUse = selectedRegion ? 
        (regions[selectedRegion] ? { [selectedRegion]: regions[selectedRegion] } : {}) : 
        regions;
      
      Object.values(regionsToUse).forEach(regionData => {
        regionData.forEach(point => {
          allTimestamps.add(point.timestamp);
        });
      });
    });
    
    // Sort timestamps
    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);
    
    // Create data points for each timestamp
    return sortedTimestamps.map(timestamp => {
      const dataPoint: Record<string, any> = {
        timestamp,
        time: format(new Date(timestamp * 1000), 'HH:mm:ss'),
      };
      
      // Add blockheight for each provider
      Object.entries(data.providers).forEach(([provider, regions]) => {
        // Filter by selected region if one is selected
        const regionToUse = selectedRegion ? selectedRegion : Object.keys(regions)[0];
        
        if (regions[regionToUse]) {
          const pointForTimestamp = regions[regionToUse].find(p => p.timestamp === timestamp);
          
          if (pointForTimestamp) {
            dataPoint[provider] = pointForTimestamp.blockheight;
          }
        }
      });
      
      return dataPoint;
    });
  }, [data, selectedRegion]);

  return { chartData };
};
