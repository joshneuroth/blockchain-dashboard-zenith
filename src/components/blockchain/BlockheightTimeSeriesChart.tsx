
import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BlockheightTimeSeriesData } from '@/hooks/useBlockheightTimeSeries';
import { Checkbox } from "@/components/ui/checkbox";

// Provider color mapping
const PROVIDER_COLORS: Record<string, string> = {
  "DRPC": "#4285F4",
  "Llama RPC": "#F5A623",
  "Chainstack": "#5E35B1",
  "Infura": "#9C27B0",
  "Quicknode": "#E91E63",
  "Alchemy": "#3F51B5",
  "Ankr": "#FF9800",
  "Pocket": "#4CAF50",
  "Blast API": "#2196F3",
  "BlockPI": "#673AB7",
};

// Get color for a provider, fallback to a default color
const getProviderColor = (provider: string): string => {
  return PROVIDER_COLORS[provider] || '#888888';
};

interface BlockheightTimeSeriesChartProps {
  data: BlockheightTimeSeriesData | null;
  isLoading: boolean;
}

const BlockheightTimeSeriesChart: React.FC<BlockheightTimeSeriesChartProps> = ({ 
  data, 
  isLoading 
}) => {
  // State for selected providers (all selected by default)
  const [selectedProviders, setSelectedProviders] = useState<Record<string, boolean>>({});

  // Initialize selected providers when data changes
  React.useEffect(() => {
    if (data?.providers) {
      const initialSelectedState = Object.keys(data.providers).reduce(
        (acc, provider) => ({ ...acc, [provider]: true }),
        {}
      );
      setSelectedProviders(initialSelectedState);
    }
  }, [data?.providers]);

  // Toggle provider selection
  const toggleProvider = (provider: string) => {
    setSelectedProviders(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data?.providers) return [];

    // Get all timestamps across all providers
    const allTimestamps = new Set<number>();
    
    Object.entries(data.providers).forEach(([provider, regions]) => {
      Object.values(regions).forEach(regionData => {
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
        // Combine all regions for now (can be separated later if needed)
        const allRegionPoints = Object.values(regions).flat();
        const pointForTimestamp = allRegionPoints.find(p => p.timestamp === timestamp);
        
        if (pointForTimestamp) {
          dataPoint[provider] = pointForTimestamp.blockheight;
        }
      });
      
      return dataPoint;
    });
  }, [data]);

  // Create chart config for providers
  const chartConfig = useMemo(() => {
    const config: Record<string, any> = {};
    
    if (data?.providers) {
      Object.keys(data.providers).forEach(provider => {
        config[provider] = {
          label: provider,
          color: getProviderColor(provider)
        };
      });
    }
    
    return config;
  }, [data?.providers]);

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
      <div className="flex flex-wrap gap-3 items-center">
        {Object.keys(data.providers).map(provider => (
          <div key={provider} className="flex items-center space-x-2">
            <Checkbox 
              id={`provider-${provider}`}
              checked={selectedProviders[provider]}
              onCheckedChange={() => toggleProvider(provider)}
              className="rounded"
              style={{ 
                borderColor: getProviderColor(provider),
                backgroundColor: selectedProviders[provider] ? getProviderColor(provider) : 'transparent' 
              }}
            />
            <label 
              htmlFor={`provider-${provider}`}
              className="text-sm font-medium cursor-pointer"
            >
              {provider}
            </label>
          </div>
        ))}
      </div>

      <div className="h-[400px] bg-white dark:bg-gray-800 rounded-lg p-4">
        <ChartContainer config={chartConfig} className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                domain={['dataMin', 'dataMax']}
                tick={{ fontSize: 12 }}
                tickMargin={10}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => `Time: ${label}`}
                    formatter={(value, name) => [value.toLocaleString(), name]}
                  />
                }
              />
              <Legend verticalAlign="top" height={36} />
              
              {Object.keys(data.providers).map(provider => (
                selectedProviders[provider] && (
                  <Line
                    key={provider}
                    type="monotone"
                    dataKey={provider}
                    stroke={getProviderColor(provider)}
                    dot={false}
                    activeDot={{ r: 6 }}
                    name={provider}
                    isAnimationActive={false}
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      
      <div className="flex justify-end">
        <div className="text-xs text-muted-foreground">
          Auto-refreshes every 10 seconds • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default BlockheightTimeSeriesChart;
