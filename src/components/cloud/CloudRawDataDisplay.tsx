
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { CloudLatencyData } from '@/hooks/useCloudLatency';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';

interface CloudRawDataDisplayProps {
  data: CloudLatencyData[];
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
  lastError?: string | null;
}

const CloudRawDataDisplay: React.FC<CloudRawDataDisplayProps> = ({
  data,
  isLoading,
  error,
  onRefresh,
  lastError,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Raw Data</h3>
        <Button 
          onClick={onRefresh} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
          <p><strong>Error:</strong> {lastError || "Failed to load data"}</p>
          <p className="mt-2 text-sm">Check the console for more details.</p>
        </div>
      ) : data.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No data available</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Response Time (ms)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 50).map((item, index) => (
                <TableRow key={`${item.provider_name}-${index}`}>
                  <TableCell>{item.provider_name}</TableCell>
                  <TableCell>{item.response_time}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>{item.method}</TableCell>
                  <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.length > 50 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Showing first 50 of {data.length} records
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CloudRawDataDisplay;
