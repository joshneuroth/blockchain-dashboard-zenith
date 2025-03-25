
import React, { useState } from 'react';
import { formatNumber } from '@/lib/api';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BlockActivityChartProps {
  blockHistory: Array<{
    height: string;
    timestamp: number;
    timeDiff: number;
    provider?: string;
    providerData?: {
      [key: string]: {
        height: string;
        timestamp: number;
        endpoint?: string;
      }
    }
  }>;
  networkColor: string;
}

const BlockActivityChart: React.FC<BlockActivityChartProps> = ({ blockHistory, networkColor }) => {
  const [tooltipData, setTooltipData] = useState<{
    visible: boolean;
    x: number;
    y: number;
    provider: string;
    endpoint: string;
    height: string;
    time: string;
    blockDiff?: number;
  } | null>(null);
  
  // Fill with empty blocks if we don't have enough history
  const filledHistory = [...Array(18)].map((_, i) => 
    blockHistory[i] || { height: "0", timestamp: 0, timeDiff: 0 }
  );
  
  // Determine the size of each bar based on the time difference
  const getBarSize = (timeDiff: number) => {
    if (timeDiff === 0) return 'block-bar-small';
    if (timeDiff < 5) return 'block-bar-large';
    if (timeDiff < 15) return 'block-bar-medium';
    return 'block-bar-small';
  };
  
  // Determine if a block is showing a potential issue (long time diff)
  const isAlertBlock = (timeDiff: number) => timeDiff > 30;

  // Get the color for a network
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

  // Handle mouse over for tooltip display
  const handleMouseOver = (
    e: React.MouseEvent, 
    block: typeof blockHistory[0], 
    provider: string, 
    height: string,
    endpoint?: string
  ) => {
    if (block.timestamp === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Calculate block difference from highest block if available
    let blockDiff;
    if (block.providerData) {
      const heights = Object.values(block.providerData).map(p => BigInt(p.height || "0"));
      const maxHeight = heights.length > 0 ? heights.reduce((max, h) => h > max ? h : max, BigInt(0)) : BigInt(0);
      const currentHeight = BigInt(height || "0");
      if (maxHeight > 0 && currentHeight > 0) {
        blockDiff = Number(maxHeight - currentHeight);
      }
    }
    
    setTooltipData({
      visible: true,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 70,
      provider,
      endpoint: endpoint || 'Unknown endpoint',
      height,
      time: new Date(block.timestamp).toLocaleTimeString(),
      blockDiff: blockDiff
    });
  };

  // Handle mouse out to hide tooltip
  const handleMouseOut = () => {
    setTooltipData(null);
  };

  return (
    <div className="mt-6 mb-8 relative">
      <div className="flex items-end justify-between h-20 overflow-hidden">
        {filledHistory.reverse().map((block, index) => {
          // Determine if we have provider data
          const hasProviderData = block.providerData && Object.keys(block.providerData).length > 0;
          
          if (!hasProviderData) {
            // Handle single data point like before
            return (
              <div 
                key={index} 
                className={`block-bar ${getBarSize(block.timeDiff)} ${isAlertBlock(block.timeDiff) ? 'block-bar-alert' : ''} cursor-pointer`}
                style={{ 
                  backgroundColor: block.height !== "0" 
                    ? isAlertBlock(block.timeDiff) 
                      ? '#ef4444' // red for alerts
                      : getNetworkColor(networkColor)
                    : '#e5e7eb' // grey for empty blocks
                }}
                onMouseOver={(e) => handleMouseOver(e, block, block.provider || '', block.height)}
                onMouseOut={handleMouseOut}
              >
                <span className="sr-only">Block at {new Date(block.timestamp).toLocaleTimeString()}</span>
              </div>
            );
          }
          
          // When we have multiple providers, display side by side
          const providers = Object.keys(block.providerData);
          const barWidth = 100 / providers.length;
          
          return (
            <div 
              key={index}
              className="flex h-full items-end"
              style={{ width: `${100 / filledHistory.length}%` }}
            >
              {providers.map((provider, pIdx) => {
                const providerData = block.providerData![provider];
                const height = providerData.height;
                const endpoint = providerData.endpoint;
                
                return (
                  <div 
                    key={`${index}-${pIdx}`}
                    className={`block-bar ${getBarSize(block.timeDiff)} ${isAlertBlock(block.timeDiff) ? 'block-bar-alert' : ''} cursor-pointer`}
                    style={{ 
                      width: `${barWidth}%`,
                      backgroundColor: height !== "0" 
                        ? isAlertBlock(block.timeDiff) 
                          ? '#ef4444' // red for alerts
                          : getNetworkColor(networkColor)
                        : '#e5e7eb', // grey for empty blocks
                      opacity: pIdx === 0 ? 1 : 0.7, // Make the second provider slightly transparent
                      marginLeft: pIdx > 0 ? '1px' : '0'
                    }}
                    onMouseOver={(e) => handleMouseOver(e, block, provider, height, endpoint)}
                    onMouseOut={handleMouseOut}
                  >
                    <span className="sr-only">
                      Block {height} from {provider} at {new Date(providerData.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      
      {/* Custom Tooltip */}
      {tooltipData && tooltipData.visible && (
        <div 
          className="absolute bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg text-xs z-10 pointer-events-none border border-gray-200 dark:border-gray-700"
          style={{ 
            left: `${tooltipData.x}px`, 
            top: `${tooltipData.y}px`,
            transform: 'translateX(-50%)',
            minWidth: '180px'
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="font-bold text-sm">{tooltipData.provider}</div>
            {tooltipData.blockDiff !== undefined && tooltipData.blockDiff > 0 && (
              <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded text-xs font-medium">
                -{tooltipData.blockDiff} blocks
              </div>
            )}
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-xs mb-1 break-all">
            {tooltipData.endpoint}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div>Block: {formatNumber(tooltipData.height)}</div>
            <div>Time: {tooltipData.time}</div>
          </div>
        </div>
      )}
      
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
      
      <div className="flex justify-between items-center mt-4 pt-4 border-t text-xs text-gray-500">
        <div>
          <span className="font-medium">REFRESH:</span> 10 SECS
        </div>
        <div>
          <span className="font-medium">EXPAND FULL:</span> →
        </div>
      </div>
    </div>
  );
};

export default BlockActivityChart;
