
import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { format } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BlockheightTimeSeriesData, TimeWindow } from '@/hooks/useBlockheightTimeSeries';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider, Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, ZoomIn } from "lucide-react";

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
  "FlashBots": "#2E7D32",
  "Lava": "#D32F2F",
  "NodeReal": "#00796B",
  "Public Node": "#455A64",
  "Tenderly-ETH": "#795548",
};

// Get color for a provider, fallback to a default color
const getProviderColor = (provider: string): string => {
  return PROVIDER_COLORS[provider] || '#888888';
};

interface BlockheightTimeSeriesChartProps {
  data: BlockheightTimeSeriesData | null;
  isLoading: boolean;
  uniqueRegions: string[];
  deviationData: Array<{
    timestamp: number;
    min: number;
    max: number;
    range: number;
    hasDeviation: boolean;
  }> | null;
  timeWindow: TimeWindow;
}

const BlockheightTimeSeriesChart: React.FC<BlockheightTimeSeriesChartProps> = ({ 
  data, 
  isLoading,
  uniqueRegions,
  deviationData,
  timeWindow
}) => {
  // State for selected providers (all selected by default)
  const [selectedProviders, setSelectedProviders] = useState<Record<string, boolean>>({});
  // State for selected region
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  // State for whether to highlight deviations
  const [highlightDeviations, setHighlightDeviations] = useState(true);
  // State for Y axis zooming
  const [zoomToDeviations, setZoomToDeviations] = useState(false);

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

  // Calculate Y axis domain based on zoom state
  const yAxisDomain = useMemo(() => {
    if (!data?.providers || !deviationData || !zoomToDeviations) {
      return ['dataMin', 'dataMax']; // Default: Show all data
    }

    // Find deviations to zoom into
    const deviationsFound = deviationData.filter(d => d.hasDeviation);
    if (deviationsFound.length === 0) {
      return ['dataMin', 'dataMax']; // No deviations found
    }

    // Calculate a good Y axis range that focuses on the deviations
    const allBlockheights: number[] = [];
    Object.entries(data.providers).forEach(([provider, regions]) => {
      const regionToUse = selectedRegion ? selectedRegion : Object.keys(regions)[0];
      if (regions[regionToUse]) {
        regions[regionToUse].forEach(point => {
          allBlockheights.push(point.blockheight);
        });
      }
    });

    if (allBlockheights.length === 0) {
      return ['dataMin', 'dataMax'];
    }

    // Find the deviation range
    const minHeight = Math.min(...allBlockheights);
    const maxHeight = Math.max(...allBlockheights);
    const total = maxHeight - minHeight;
    
    // Add padding to make the deviations more visible (5% padding)
    const padding = total * 0.05;
    return [minHeight - padding, maxHeight + padding];
  }, [data, deviationData, zoomToDeviations, selectedRegion]);

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
        time: format(new Date(timestamp * 1000), timeWindow === '10s' ? 'HH:mm:ss' : 'HH:mm'),
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

      // Add deviation data if available
      if (deviationData) {
        const deviation = deviationData.find(d => d.timestamp === timestamp);
        if (deviation) {
          dataPoint._min = deviation.min;
          dataPoint._max = deviation.max;
          dataPoint._range = deviation.range;
          dataPoint._hasDeviation = deviation.hasDeviation;
        }
      }
      
      return dataPoint;
    });
  }, [data, selectedRegion, deviationData, timeWindow]);

  // Extract deviation areas for visualization
  const deviationAreas = useMemo(() => {
    if (!chartData || !highlightDeviations) return [];
    
    const areas: Array<{start: number, end: number}> = [];
    let currentArea: {start: number, end: number} | null = null;
    
    chartData.forEach((point, index) => {
      if (point._hasDeviation) {
        if (!currentArea) {
          currentArea = { start: index, end: index };
        } else {
          currentArea.end = index;
        }
      } else if (currentArea) {
        areas.push({...currentArea});
        currentArea = null;
      }
    });
    
    // Add the last area if it exists
    if (currentArea) {
      areas.push(currentArea);
    }
    
    return areas;
  }, [chartData, highlightDeviations]);

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

  // Calculate if there are any deviations
  const hasDeviations = useMemo(() => {
    return deviationData?.some(d => d.hasDeviation) || false;
  }, [deviationData]);

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
      {hasDeviations && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
          <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Blockheight deviations detected</p>
            <p className="text-xs mt-1">Some providers are reporting different blockheights, which could indicate network issues or blockchain forks.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
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
        
        <div className="flex items-center gap-4">
          {uniqueRegions.length > 0 && (
            <div className="flex items-center gap-2">
              <Label htmlFor="region-select" className="text-sm">Region:</Label>
              <Select 
                value={selectedRegion || ''} 
                onValueChange={handleRegionChange}
              >
                <SelectTrigger id="region-select" className="w-[180px]">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueRegions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Checkbox 
              id="highlight-deviations"
              checked={highlightDeviations}
              onCheckedChange={() => setHighlightDeviations(!highlightDeviations)}
              className="rounded"
            />
            <label 
              htmlFor="highlight-deviations"
              className="text-sm font-medium cursor-pointer"
            >
              Highlight deviations
            </label>
          </div>
          
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="zoom-deviations"
                    checked={zoomToDeviations}
                    onCheckedChange={() => setZoomToDeviations(!zoomToDeviations)}
                    className="rounded"
                  />
                  <label 
                    htmlFor="zoom-deviations"
                    className="text-sm font-medium cursor-pointer flex items-center"
                  >
                    <ZoomIn className="h-3.5 w-3.5 mr-1" />
                    Focus on deviations
                  </label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Adjusts Y-axis scale to focus on blockheight differences
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
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
                interval={timeWindow === '10s' ? 2 : 0} // Only show every third tick for 10s window
              />
              <YAxis 
                domain={yAxisDomain}
                tick={{ fontSize: 12 }}
                tickMargin={10}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => `Time: ${label}`}
                    formatter={(value, name) => {
                      // Special handling for deviation data
                      if (typeof name === 'string' && name.startsWith('_')) return null;
                      return [value.toLocaleString(), name];
                    }}
                  />
                }
              />
              <Legend verticalAlign="top" height={36} />
              
              {/* Highlight areas with deviations */}
              {highlightDeviations && deviationAreas.map((area, i) => (
                <ReferenceArea 
                  key={`deviation-${i}`}
                  x1={chartData[area.start]?.time} 
                  x2={chartData[area.end]?.time} 
                  fill="#FFECB3" 
                  fillOpacity={0.3}
                  strokeOpacity={0.5}
                  stroke="#FFB300"
                  className="animate-pulse"
                />
              ))}
              
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
                    connectNulls={true}
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {selectedRegion ? `Showing data for region: ${selectedRegion}` : 'Showing data for all regions'}
          {' • '}
          Time window: {timeWindow}
        </div>
        <div className="text-xs text-muted-foreground">
          Auto-refreshes every 5 seconds • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default BlockheightTimeSeriesChart;
