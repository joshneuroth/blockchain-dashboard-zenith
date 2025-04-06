
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CloudLatencyData } from '@/hooks/useCloudLatency';
import { formatDistanceToNow } from 'date-fns';

interface CloudLatencyTableProps {
  data: CloudLatencyData[];
  filterMethod: string | null;
}

const CloudLatencyTable: React.FC<CloudLatencyTableProps> = ({ data, filterMethod }) => {
  // Apply method filtering if a filter is selected
  const filteredData = filterMethod 
    ? data.filter(item => item.method === filterMethod)
    : data;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Region</TableHead>
            <TableHead className="text-right">P50 Latency</TableHead>
            <TableHead className="text-right">P90 Latency</TableHead>
            <TableHead className="text-right">Sample Size</TableHead>
            {data.some(item => item.timestamp) && (
              <TableHead className="text-right">Last Updated</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No latency data available for the selected filters
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.provider}</TableCell>
                <TableCell>{item.method || 'N/A'}</TableCell>
                <TableCell>
                  {item.origin.city || item.origin.region || 'Global'}
                </TableCell>
                <TableCell className="text-right">{item.p50_latency.toFixed(2)} ms</TableCell>
                <TableCell className="text-right">{item.p90_latency.toFixed(2)} ms</TableCell>
                <TableCell className="text-right">{item.sample_size}</TableCell>
                {data.some(item => item.timestamp) && (
                  <TableCell className="text-right">
                    {item.timestamp 
                      ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })
                      : 'N/A'}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CloudLatencyTable;
