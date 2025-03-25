
import { BlockTimeMetrics } from './types';

export const calculateBlocksPerMinute = (
  updatedHistory: Array<{
    timestamp: number;
    providers: Record<string, any>;
  }>,
  currentMetrics: BlockTimeMetrics
) => {
  let blocksPerMinute = currentMetrics.blocksPerMinute;
  const now = Date.now();
  
  if (now - currentMetrics.lastCalculated > 30000 && updatedHistory.length >= 2) {
    const oldestIndex = Math.max(0, updatedHistory.length - 18);
    const oldestBlockTime = updatedHistory[oldestIndex].timestamp;
    const newestBlockTime = updatedHistory[updatedHistory.length - 1].timestamp;
    const minutesElapsed = (newestBlockTime - oldestBlockTime) / 60000;
    
    if (minutesElapsed > 0) {
      // Get the highest blocks from oldest and newest measurements
      const oldestMeasurement = updatedHistory[oldestIndex];
      const newestMeasurement = updatedHistory[updatedHistory.length - 1];
      
      // Find highest block in oldest measurement
      const oldestHeights = Object.values(oldestMeasurement.providers).map(p => BigInt(p.height));
      const oldestHighest = oldestHeights.reduce((max, h) => h > max ? h : max, BigInt(0));
      
      // Find highest block in newest measurement
      const newestHeights = Object.values(newestMeasurement.providers).map(p => BigInt(p.height));
      const newestHighest = newestHeights.reduce((max, h) => h > max ? h : max, BigInt(0));
      
      // Calculate blocks per minute
      const blocksDiff = Number(newestHighest - oldestHighest);
      blocksPerMinute = blocksDiff / minutesElapsed;
    }
  }
  
  return {
    blocksPerMinute,
    lastCalculated: now
  };
};
