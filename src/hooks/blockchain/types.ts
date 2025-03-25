
import { BlockData } from '@/lib/api';

export interface BlockTimeMetrics {
  blocksPerMinute: number;
  lastCalculated: number;
}

export interface NetworkData {
  lastBlock: BlockData | null;
  blockHistory: Array<{
    timestamp: number;
    providers: {
      [key: string]: {
        height: string;
        endpoint: string;
        status: 'synced' | 'behind' | 'far-behind';
        blocksBehind: number;
        blockTime?: number;
        transactionCount?: number;
      }
    }
  }>;
  providers: {
    [key: string]: BlockData;
  };
  isLoading: boolean;
  error: string | null;
  blockTimeMetrics: BlockTimeMetrics;
}
