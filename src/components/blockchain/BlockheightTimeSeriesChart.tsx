
import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Rectangle,
  ReferenceArea
} from 'recharts';
import { format } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BlockheightTimeSeriesData } from '@/hooks/useBlockheightTimeSeries';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Tooltip as UITooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { AlertTriangle, HelpCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

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

// Define deviation thresholds
const DEVIATION_LEVELS = {
  MINOR: 1,
  MODERATE: 5,
  SIGNIFICANT: 10,
  CRITICAL: 20
};

// Deviation colors
const DEVIATION_COLORS = {
  NONE: "rgba(0, 0, 0, 0)",
  MINOR: "rgba(254, 247, 205, 0.3)",   // Soft yellow
  MODERATE: "rgba(254, 215, 170, 0.3)", // Light orange
  SIGNIFICANT: "rgba(249, 115, 22, 0.3)", // Bright orange
  CRITICAL: "rgba(234, 56, 76, 0.3)"    // Red
};

// Get color for a provider, fallback to a default color
const getProviderColor = (provider: string): string => {
  return PROVIDER_COLORS[provider] || '#888888';
};

// Get color based on deviation level
const getDeviationColor = (deviation: number): string => {
  if (deviation >= DEVIATION_LEVELS.CRITICAL) return DEVIATION_COLORS.CRITICAL;
  if (deviation >= DEVIATION_LEVELS.SIGNIFICANT) return DEVIATION_COLORS.SIGNIFICANT;
  if (deviation >= DEVIATION_LEVELS.MODERATE) return DEVIATION_COLORS.MODERATE;
  if (deviation >= DEVIATION_LEVELS.MINOR) return DEVIATION_COLORS.MINOR;
  return DEVIATION_COLORS.NONE;
};

// Custom background for chart to highlight deviations
const DeviationBackground = (props: any) => {
  const { x, y, width, height, deviations, points } = props;
  
  if (!points || points.length < 2 || !deviations) return null;
  
  const segmentWidth = width / (points.length - 1);
  
  return (
    <g>
      {points.map((point: any, index: number) => {
        if (index === points.length - 1) return null;
        
        const timestamp = point.payload.timestamp;
        const deviation = deviations[timestamp] || 0;
        const color = getDeviationColor(deviation);
        
        // Skip rendering if no deviation
        if (color === DEVIATION_COLORS.NONE) return null;
        
        const startX = x + index * segmentWidth;
        const segWidth = segmentWidth;
        
        return (
          <rect
            key={`deviation-${index}`}
            x={startX}
            y={y}
            width={segWidth}
            height={height}
            fill={color}
            className="transition-all duration-500 ease-in-out"
          />
        );
      })}
    </g>
  );
};

interface BlockheightTimeSeriesChartProps {
  data: BlockheightTimeSeriesData | null;
  isLoading: boolean;
  uniqueRegions: string[];
  deviations?: Record<number, number>;
}

const BlockheightTimeSeriesChart: React.FC<BlockheightTimeSeriesChartProps> = ({ 
  data, 
  isLoading,
  uniqueRegions,
  deviations = {}
}) => {
  // State for selected providers (all selected by default)
  const [selectedProviders, setSelectedProviders] = useState<Record<string, boolean>>({});
  // State for selected region
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  // Reference to chart for animation
  const chartRef = useRef<HTMLDivElement>(null);
  // Track previous data for animation
  const [hasDeviation, setHasDeviation] = useState(false);

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

  // Effect to detect and animate deviations
  useEffect(() => {
    const hasAnyDeviation = Object.values(deviations).some(
      deviation => deviation >= DEVIATION_LEVELS.MODERATE
    );
    
    if (hasAnyDeviation && !hasDeviation) {
      // Trigger animation when deviation occurs
      if (chartRef.current) {
        chartRef.current.classList.add('animate-data-update');
        setTimeout(() => {
          if (chartRef.current) {
            chartRef.current.classList.remove('animate-data-update');
          }
        }, 500);
      }
    }
    
    setHasDeviation(hasAnyDeviation);
  }, [deviations, hasDeviation]);

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
        deviation: deviations[timestamp] || 0,
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
  }, [data, selectedRegion, deviations]);

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

  // Get maximum deviation
  const maxDeviation = useMemo(() => {
    return Math.max(...Object.values(deviations), 0);
  }, [deviations]);

  // Calculate deviation severity
  const deviationSeverity = useMemo(() => {
    if (maxDeviation >= DEVIATION_LEVELS.CRITICAL) return "critical";
    if (maxDeviation >= DEVIATION_LEVELS.SIGNIFICANT) return "significant";
    if (maxDeviation >= DEVIATION_LEVELS.MODERATE) return "moderate";
    if (maxDeviation >= DEVIATION_LEVELS.MINOR) return "minor";
    return "none";
  }, [maxDeviation]);

  // Custom tooltip formatter
  const tooltipFormatter = (value: any, name: string) => {
    if (name === 'deviation') {
      return [`${value} blocks`, 'Blockheight Deviation'];
    }
    return [value.toLocaleString(), name];
  };

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
      </div>

      {/* Deviation indicator */}
      {maxDeviation > 0 && (
        <div 
          className={cn(
            "px-4 py-3 rounded-md flex items-center gap-2 text-sm animate-fade-in",
            {
              "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200": deviationSeverity === "critical",
              "bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-200": deviationSeverity === "significant",
              "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200": deviationSeverity === "moderate",
              "bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200": deviationSeverity === "minor",
            }
          )}
        >
          <AlertTriangle size={18} className="flex-shrink-0" />
          <div>
            <span className="font-medium">
              {deviationSeverity === "critical" && "Critical blockheight deviation detected"}
              {deviationSeverity === "significant" && "Significant blockheight deviation detected"}
              {deviationSeverity === "moderate" && "Moderate blockheight deviation detected"}
              {deviationSeverity === "minor" && "Minor blockheight deviation detected"}
            </span>
            <span className="ml-1">
              (max difference: {maxDeviation} blocks)
            </span>
          </div>
          <TooltipProvider delayDuration={0}>
            <UITooltip>
              <TooltipTrigger asChild>
                <HelpCircle size={16} className="text-muted-foreground ml-1 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Blockheight deviations indicate that different providers are reporting different blockchain heights.</p>
                <ul className="mt-2 list-disc list-inside text-xs">
                  <li>Minor: 1+ blocks</li>
                  <li>Moderate: 5+ blocks</li>
                  <li>Significant: 10+ blocks</li>
                  <li>Critical: 20+ blocks</li>
                </ul>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      )}

      <div 
        ref={chartRef} 
        className="h-[400px] bg-white dark:bg-gray-800 rounded-lg p-4 relative transition-all"
      >
        <ChartContainer config={chartConfig} className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              {/* Custom background for deviation highlighting */}
              <defs>
                <linearGradient id="deviationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,0,0,0.1)" />
                  <stop offset="100%" stopColor="rgba(255,0,0,0)" />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              
              {/* Custom background component to highlight deviations */}
              <DeviationBackground 
                x={0} 
                y={0} 
                width="100%" 
                height="100%" 
                deviations={deviations}
                points={chartData}
              />
              
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
                    formatter={tooltipFormatter}
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
                    strokeWidth={2}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      const deviation = deviations[payload.timestamp] || 0;
                      // Only show dots for points with deviations
                      if (deviation <= DEVIATION_LEVELS.MINOR) return null;
                      return (
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={deviation > DEVIATION_LEVELS.SIGNIFICANT ? 5 : 4} 
                          stroke={getProviderColor(provider)}
                          strokeWidth={2}
                          fill="#fff"
                          className="transition-all duration-300"
                        />
                      );
                    }}
                    activeDot={{ 
                      r: 6,
                      stroke: getProviderColor(provider),
                      strokeWidth: 2,
                      fill: '#fff'
                    }}
                    name={provider}
                    isAnimationActive={false}
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Legend for deviation colors */}
        <div className="absolute bottom-2 right-2 bg-white/80 dark:bg-gray-800/80 rounded p-2 text-xs">
          <div className="font-medium mb-1 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>Deviation Legend:</span>
          </div>
          <div className="flex gap-2">
            {[
              { level: "Minor", color: DEVIATION_COLORS.MINOR },
              { level: "Moderate", color: DEVIATION_COLORS.MODERATE },
              { level: "Significant", color: DEVIATION_COLORS.SIGNIFICANT },
              { level: "Critical", color: DEVIATION_COLORS.CRITICAL }
            ].map(({ level, color }) => (
              <div key={level} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: color.replace(/[^,]+\)/, '1)') }}></div>
                <span>{level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {selectedRegion ? `Showing data for region: ${selectedRegion}` : 'Showing data for all regions'}
        </div>
        <div className="text-xs text-muted-foreground">
          Auto-refreshes every 10 seconds • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default BlockheightTimeSeriesChart;
