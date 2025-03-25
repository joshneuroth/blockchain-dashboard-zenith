
import React, { useState, useMemo } from 'react';
import { formatNumber } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface BlockMeasurement {
  timestamp: number;
  providers: {
    [key: string]: {
      height: string;
      endpoint: string;
      status: 'synced' | 'behind' | 'far-behind';
      blocksBehind: number;
    }
  }
}

interface BlockComparisonChartProps {
  blockHistory: BlockMeasurement[];
  networkColor: string;
}

interface BlockDetailsProps {
  providerName: string;
  providerData: {
    height: string;
    endpoint: string;
    status: 'synced' | 'behind' | 'far-behind';
    blocksBehind: number;
  };
  timestamp: number;
}

const BlockComparisonChart: React.FC<BlockComparisonChartProps> = ({ 
  blockHistory, 
  networkColor
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockDetailsProps | null>(null);
  
  // Process the data for the chart
  const chartData = useMemo(() => {
    return blockHistory.map(measurement => {
      const result: any = {
        timestamp: measurement.timestamp,
        time: new Date(measurement.timestamp).toLocaleTimeString(),
      };
      
      // Add each provider as a data point
      Object.entries(measurement.providers).forEach(([providerName, providerData]) => {
        result[providerName] = providerData.status === 'synced' ? 5 : 
                              providerData.status === 'behind' ? 3 : 1;
        result[`${providerName}_data`] = {
          ...providerData,
          name: providerName
        };
      });
      
      return result;
    });
  }, [blockHistory]);
  
  // Get color for a specific status
  const getStatusColor = (status: 'synced' | 'behind' | 'far-behind') => {
    switch (status) {
      case 'synced': return '#22c55e'; // green
      case 'behind': return '#eab308'; // yellow
      case 'far-behind': return '#ef4444'; // red
      default: return '#e5e7eb'; // gray
    }
  };

  // Get the network color
  const getNetworkColor = (networkColor: string) => {
    switch (networkColor) {
      case 'ethereum': return '#8A7BF7';
      case 'polygon': return '#8247E5';
      case 'avalanche': return '#E84142';
      case 'solana': return '#14F195';
      case 'binance': return '#F0B90B';
      default: return '#10b981';
    }
  };
  
  // Handle clicking on a block measurement
  const handleBarClick = (data: any, index: number, providerName: string) => {
    const providerData = data[`${providerName}_data`];
    if (!providerData) return;
    
    setSelectedBlock({
      providerName,
      providerData,
      timestamp: data.timestamp
    });
    
    setDialogOpen(true);
  };
  
  // Format the timestamp for display
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get provider names from the most recent measurement
  const providerNames = useMemo(() => {
    if (blockHistory.length === 0) return [];
    const lastMeasurement = blockHistory[blockHistory.length - 1];
    return Object.keys(lastMeasurement.providers);
  }, [blockHistory]);

  // If we have no data yet, show a loading state
  if (blockHistory.length === 0) {
    return (
      <div className="mt-6 mb-8 h-40 flex items-center justify-center text-gray-400">
        No blockchain data available yet...
      </div>
    );
  }

  return (
    <div className="mt-6 mb-8">
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
            barCategoryGap={1}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="time"
              tick={{ fontSize: 10 }}
              interval={Math.floor(chartData.length / 10)}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            
            {providerNames.map((provider, index) => (
              <Bar
                key={provider}
                dataKey={provider}
                name={provider}
                fill={getStatusColor(
                  chartData[chartData.length - 1][`${provider}_data`]?.status || 'synced'
                )}
                onClick={(data, index) => handleBarClick(data, index, provider)}
                cursor="pointer"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 mr-1 rounded-sm"></div>
            <span>In sync</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 mr-1 rounded-sm"></div>
            <span>1 block behind</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 mr-1 rounded-sm"></div>
            <span>&gt;1 block behind</span>
          </div>
        </div>
        <div>
          <span className="font-medium">REFRESH:</span> 10 SECS
        </div>
      </div>
      
      {/* Block Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Block Details</DialogTitle>
            <DialogDescription>
              {selectedBlock && `Provider: ${selectedBlock.providerName}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBlock && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="font-medium">Block Height:</div>
                <div className="col-span-2 font-mono">
                  {formatNumber(selectedBlock.providerData.height)}
                </div>
              </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="font-medium">Timestamp:</div>
                <div className="col-span-2">
                  {formatTimestamp(selectedBlock.timestamp)}
                </div>
              </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="font-medium">Status:</div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${selectedBlock.providerData.status === 'synced' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                      selectedBlock.providerData.status === 'behind' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                    {selectedBlock.providerData.status === 'synced' ? 'In sync' : 
                      `${selectedBlock.providerData.blocksBehind} ${selectedBlock.providerData.blocksBehind === 1 ? 'block' : 'blocks'} behind`}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="font-medium">Endpoint:</div>
                <div className="col-span-2 break-all text-xs font-mono">
                  {selectedBlock.providerData.endpoint}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded shadow-md text-xs">
      <p className="font-semibold">{label}</p>
      {payload.map((entry: any, index: number) => {
        const dataKey = entry.dataKey;
        const dataKeyWithData = `${dataKey}_data`;
        const providerData = entry.payload[dataKeyWithData];
        
        if (!providerData) return null;
        
        return (
          <div key={index} className="flex items-center mt-1">
            <div 
              className="w-2 h-2 mr-1 rounded-sm"
              style={{ backgroundColor: entry.fill }}
            />
            <span className="mr-1">{providerData.name}:</span>
            <span className="font-mono">
              {formatNumber(providerData.height)}
            </span>
            {providerData.blocksBehind > 0 && (
              <span className="ml-1 text-gray-500">
                ({providerData.blocksBehind} behind)
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BlockComparisonChart;
