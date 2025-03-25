
import React, { useState } from 'react';
import { formatNumber } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  
  // Fill with empty blocks if we don't have enough history
  const filledHistory = [...Array(18)].map((_, i) => 
    blockHistory[i] || { timestamp: 0, providers: {} }
  );
  
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
  const handleBlockClick = (timestamp: number, providerName: string, providerData: any) => {
    if (timestamp === 0) return;
    
    setSelectedBlock({
      providerName,
      providerData,
      timestamp
    });
    
    setDialogOpen(true);
  };
  
  // Format the timestamp for display
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="mt-6 mb-8 relative">
      <div className="flex items-end justify-between h-20 overflow-hidden">
        {filledHistory.reverse().map((measurement, index) => {
          // Skip if this is an empty placeholder
          if (measurement.timestamp === 0) {
            return (
              <div 
                key={index}
                className="flex h-full items-end relative mx-px"
                style={{ width: `${100 / filledHistory.length}%` }}
              >
                <div 
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700"
                  style={{ opacity: 0.5 }}
                ></div>
              </div>
            );
          }
          
          // Get all providers for this measurement
          const providers = Object.entries(measurement.providers);
          const barWidth = 100 / (providers.length || 1);
          
          return (
            <div 
              key={index}
              className="flex h-full items-end relative mx-px"
              style={{ width: `${100 / filledHistory.length}%` }}
            >
              {providers.map(([providerName, providerData], pIdx) => {
                // Determine bar height based on status (5 units for synced, 3 for behind, 1 for far behind)
                const barHeight = providerData.status === 'synced' ? 5 : 
                                 providerData.status === 'behind' ? 3 : 1;
                
                return (
                  <div
                    key={`${index}-${pIdx}`}
                    className="cursor-pointer mx-px"
                    style={{ 
                      width: `${barWidth}%`,
                      height: `${barHeight * 20}%`, // Multiply by 20% of container height
                      backgroundColor: getStatusColor(providerData.status),
                      opacity: providerData.status === 'synced' ? 1 : 0.85
                    }}
                    onClick={() => handleBlockClick(measurement.timestamp, providerName, providerData)}
                  >
                    <span className="sr-only">
                      Block {providerData.height} from {providerName}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      
      {/* Time markers */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {[...Array(7)].map((_, i) => {
          const hour = new Date().getHours();
          const minute = new Date().getMinutes();
          
          // Calculate time for this tick (subtract i*3 minutes from current time)
          const tickMinute = minute - (i * 3);
          const tickHour = hour + Math.floor(tickMinute / 60);
          const adjustedMinute = ((tickMinute % 60) + 60) % 60;
          const displayHour = ((tickHour % 24) + 24) % 24;
          
          return (
            <div key={i} className="text-center">
              {String(displayHour).padStart(2, '0')}:{String(adjustedMinute).padStart(2, '0')}
            </div>
          );
        })}
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

export default BlockComparisonChart;
