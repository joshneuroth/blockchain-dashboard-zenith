
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Medal } from 'lucide-react';
import { Reliability } from '@/hooks/useLeaderboardData';

interface ReliabilityTableProps {
  providers: Reliability[];
  isLoading: boolean;
}

const ReliabilityTable: React.FC<ReliabilityTableProps> = ({ providers, isLoading }) => {
  const getErrorRateColor = (errorRate: number) => {
    if (errorRate <= 0.5) return "bg-green-500 text-white";
    if (errorRate <= 2) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  if (isLoading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <p className="text-muted-foreground">Loading reliability data...</p>
      </div>
    );
  }

  if (!providers || providers.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center">
        <p className="text-muted-foreground">No reliability data available</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead className="text-right">Error Rate</TableHead>
          <TableHead className="text-right">Total Tests</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {providers.map((provider) => (
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
              <Badge className={getErrorRateColor(provider.error_rate_percentage)}>
                {provider.error_rate_percentage.toFixed(2)}%
              </Badge>
            </TableCell>
            <TableCell className="text-right">{provider.total_tests.toLocaleString()}</TableCell>
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

export default ReliabilityTable;
