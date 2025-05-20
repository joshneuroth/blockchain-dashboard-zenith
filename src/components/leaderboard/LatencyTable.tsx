
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Medal } from 'lucide-react';
import { LatencyOverallData } from '@/hooks/useLeaderboardData';

interface LatencyTableProps {
  providers: LatencyOverallData[];
  isLoading: boolean;
}

const LatencyTable: React.FC<LatencyTableProps> = ({ providers, isLoading }) => {
  const getLatencyColor = (latency: number) => {
    if (latency <= 50) return "bg-green-500 text-white";
    if (latency <= 100) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  if (isLoading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <p className="text-muted-foreground">Loading latency data...</p>
      </div>
    );
  }

  if (!providers || providers.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center">
        <p className="text-muted-foreground">No latency data available</p>
      </div>
    );
  }

  // Filter out any null or undefined providers
  const validProviders = providers.filter(provider => provider !== null && provider !== undefined);

  console.log("Valid providers for latency table:", validProviders);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead className="text-right">P50 Latency</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {validProviders.map((provider) => (
          <TableRow key={provider.provider_name}>
            <TableCell className="font-mono">
              {provider.rank === 1 ? (
                <div className="flex items-center justify-center">
                  <Medal className="text-yellow-500" size={18} />
                </div>
              ) : (
                <div className="text-center">{provider.rank}</div>
              )}
            </TableCell>
            <TableCell className="font-medium">{provider.provider_name}</TableCell>
            <TableCell className="text-right">
              <Badge className={getLatencyColor(provider.overall_p50_latency_ms)}>
                {provider.overall_p50_latency_ms.toFixed(1)} ms
              </Badge>
            </TableCell>
            <TableCell>
              {provider.is_tied ? (
                <Badge variant="outline">
                  Tied with {provider.tied_count} other{provider.tied_count > 1 ? "s" : ""}
                </Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LatencyTable;
