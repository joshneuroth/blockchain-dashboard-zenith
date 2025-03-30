
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useCloudLatency } from '@/hooks/useCloudLatency';
import { Cloud, AlertCircle, Loader2 } from 'lucide-react';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';

interface CloudLatencyCardProps {
  networkId?: string;
  networkName?: string;
}

const CloudLatencyCard: React.FC<CloudLatencyCardProps> = ({ networkName }) => {
  const { data, isLoading, error } = useCloudLatency();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Get color based on response time
  const getResponseTimeColor = (time: number | undefined) => {
    if (time === undefined || isNaN(time)) return "text-gray-500";
    if (time < 100) return "text-green-600 dark:text-green-400";
    if (time < 300) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  // Format response time with safety check
  const formatResponseTime = (time: number | undefined) => {
    if (time === undefined || isNaN(time)) return "N/A";
    return `${time.toFixed(2)} ms`;
  };

  // Format any value safely for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <Card className="glass-card mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Cloud size={20} />
          Cloud Latency Data {networkName ? `for ${networkName}` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading cloud latency data...</span>
          </div>
        ) : error ? (
          <div className="py-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
            <p className="text-destructive">Error loading cloud latency data: {error}</p>
            <p className="text-sm mt-2 text-muted-foreground">This may be due to network connectivity issues or CORS restrictions.</p>
          </div>
        ) : !data || !Array.isArray(data) || data.length === 0 ? (
          <div className="py-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <p>No cloud latency data available {networkName ? `for ${networkName}` : ''}.</p>
            <p className="text-sm mt-2 text-muted-foreground">
              The API might not have data available at the moment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.provider_name}</TableCell>
                    <TableCell className={getResponseTimeColor(item.response_time)}>
                      {formatResponseTime(item.response_time)}
                    </TableCell>
                    <TableCell>{formatValue(item.status)}</TableCell>
                    <TableCell>{formatValue(item.method)}</TableCell>
                    <TableCell>{formatValue(item.origin)}</TableCell>
                    <TableCell>{formatDate(item.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CloudLatencyCard;
