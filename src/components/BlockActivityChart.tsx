
import React from 'react';

interface BlockActivityChartProps {
  blockHistory: Array<{
    height: string;
    timestamp: number;
    timeDiff: number;
  }>;
  networkColor: string;
}

const BlockActivityChart: React.FC<BlockActivityChartProps> = ({ blockHistory, networkColor }) => {
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

  return (
    <div className="mt-6 mb-8">
      <div className="flex items-end justify-between h-20 overflow-hidden">
        {filledHistory.reverse().map((block, index) => (
          <div 
            key={index} 
            className={`block-bar ${getBarSize(block.timeDiff)} ${isAlertBlock(block.timeDiff) ? 'block-bar-alert' : ''}`}
            style={{ 
              backgroundColor: block.height !== "0" 
                ? isAlertBlock(block.timeDiff) 
                  ? '#ef4444' // red for alerts
                  : networkColor === 'ethereum' ? '#8A7BF7'
                    : networkColor === 'polygon' ? '#8247E5'
                    : networkColor === 'avalanche' ? '#E84142'
                    : networkColor === 'solana' ? '#14F195'
                    : networkColor === 'binance' ? '#F0B90B'
                    : '#10b981' // default green
                : '#e5e7eb' // grey for empty blocks
            }}
          >
            <span className="sr-only">Block at {new Date(block.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      
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
