
import React from 'react';
import { Server, AlertTriangle } from 'lucide-react';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { CloudLatencyData } from '@/hooks/useCloudLatency';

interface CloudLatencyTableDisplayProps {
  sortedData: CloudLatencyData[];
  getLatencyColor: (time: number | undefined) => string;
  formatLatency: (time: number | undefined) => string;
}

const CloudLatencyTableDisplay: React.FC<CloudLatencyTableDisplayProps> = ({
  sortedData,
  getLatencyColor,
  formatLatency
}) => {
  if (sortedData.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center py-4">
          <p className="text-muted-foreground">No results match your filter criteria.</p>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {sortedData.map((item, index) => (
        <TableRow key={`${item.provider || 'unknown'}-${index}`}>
          <TableCell>
            {item.origin?.region || 'Global'}
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Server size={16} />
              <span>{item.provider || 'Unknown provider'}</span>
            </div>
          </TableCell>
          <TableCell>
            {item.method || 'eth_blockNumber'}
          </TableCell>
          <TableCell className={getLatencyColor(item.p50_latency)}>
            {formatLatency(item.p50_latency)}
          </TableCell>
          <TableCell className={getLatencyColor(item.p90_latency)}>
            {formatLatency(item.p90_latency)}
          </TableCell>
          <TableCell>
            {item.sample_size || 'N/A'}
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default CloudLatencyTableDisplay;
