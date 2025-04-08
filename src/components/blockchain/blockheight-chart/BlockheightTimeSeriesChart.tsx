
import React, { useState, useMemo } from 'react';
import { ChartContainer } from "@/components/ui/chart";
import { BlockheightTimeSeriesData } from '@/hooks/useBlockheightTimeSeries';
import ChartFilters from './ChartFilters';
import ProviderChart from './ProviderChart';
import ChartFooter from './ChartFooter';
import { useChartData } from './hooks/useChartData';
import { useProviderColors } from './hooks/useProviderColors';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface BlockheightTimeSeriesChartProps {
  data: BlockheightTimeSeriesData | null;
  isLoading: boolean;
  uniqueRegions: string[];
}

const BlockheightTimeSeriesChart: React.FC<BlockheightTimeSeriesChartProps> = ({ 
  data, 
  isLoading,
  uniqueRegions
}) => {
  // State for selected providers (all selected by default)
  const [selectedProviders, setSelectedProviders] = useState<Record<string, boolean>>({});
  // State for selected region
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  // Check if we're on mobile
  const isMobile = useIsMobile();

  // Initialize selected providers when data changes
  React.useEffect(() => {
    if (data?.providers) {
      const initialSelectedState = Object.keys(data.providers).reduce(
        (acc, provider) => ({ ...acc, [provider]: true }),
        {}
      );
      setSelectedProviders(initialSelectedState);
      
      // Set the first region as default if none is selected and regions exist
      if (selectedRegion === null && uniqueRegions.length > 0) {
        setSelectedRegion(uniqueRegions[0]);
      }
    }
  }, [data?.providers, uniqueRegions, selectedRegion]);

  // Toggle provider selection
  const toggleProvider = (provider: string) => {
    setSelectedProviders(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  // Handle region change
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  // Get provider colors
  const { getProviderColor, chartConfig } = useProviderColors(data);
  
  // Get formatted chart data
  const { chartData } = useChartData(data, selectedRegion);

  if (isLoading && !data) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="animate-pulse-opacity">Loading blockheight data...</div>
      </div>
    );
  }

  if (!data || Object.keys(data.providers).length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-muted-foreground">No blockheight data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChartFilters 
        providers={Object.keys(data.providers)}
        selectedProviders={selectedProviders}
        toggleProvider={toggleProvider}
        uniqueRegions={uniqueRegions}
        selectedRegion={selectedRegion}
        handleRegionChange={handleRegionChange}
        getProviderColor={getProviderColor}
      />

      <div className="h-[400px] bg-white dark:bg-gray-800 rounded-lg p-4">
        {isMobile ? (
          <ScrollArea className="h-full">
            {/* Set a minimum width to ensure chart is scrollable on mobile */}
            <div className="min-w-[800px] h-full">
              <ChartContainer config={chartConfig} className="h-full">
                <ProviderChart 
                  chartData={chartData} 
                  providers={Object.keys(data.providers)}
                  selectedProviders={selectedProviders}
                  getProviderColor={getProviderColor}
                />
              </ChartContainer>
            </div>
          </ScrollArea>
        ) : (
          <ChartContainer config={chartConfig} className="h-full">
            <ProviderChart 
              chartData={chartData} 
              providers={Object.keys(data.providers)}
              selectedProviders={selectedProviders}
              getProviderColor={getProviderColor}
            />
          </ChartContainer>
        )}
      </div>
      
      <ChartFooter selectedRegion={selectedRegion} />
    </div>
  );
};

export default BlockheightTimeSeriesChart;
