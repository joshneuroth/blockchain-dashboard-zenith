
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

  // Get color based on latency
  const getLatencyColor = (latency: number | undefined) => {
    if (latency === undefined || isNaN(latency)) return "text-gray-500";
    if (latency < 100) return "text-green-600 dark:text-green-400";
    if (latency < 300) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  // Format latency with safety check
  const formatLatency = (latency: number | undefined) => {
    if (latency === undefined || isNaN(latency)) return "N/A";
    return `${latency.toFixed(2)} ms`;
  };

  // Format origin information in a readable way
  const formatOrigin = (origin: any): string => {
    if (!origin) return "Unknown";
    
    if (typeof origin === 'string') return origin;
    
    const parts = [];
    if (origin.host) parts.push(origin.host);
    if (origin.region) parts.push(origin.region);
    if (origin.country) parts.push(origin.country);
    if (origin.city) parts.push(origin.city);
    if (origin.asn) parts.push(`ASN: ${origin.asn}`);
    
    return parts.length > 0 ? parts.join(' | ') : "Unknown";
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
                  <TableHead>P50 Latency</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.provider_name}</TableCell>
                    <TableCell className={getLatencyColor(item.p50_latency)}>
                      {formatLatency(item.p50_latency)}
                    </TableCell>
                    <TableCell>{formatOrigin(item.origin)}</TableCell>
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
