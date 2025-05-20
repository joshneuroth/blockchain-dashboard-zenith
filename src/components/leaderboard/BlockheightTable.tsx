
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Medal } from 'lucide-react';
import { BlockheightAccuracy } from '@/hooks/useLeaderboardData';

interface BlockheightTableProps {
  providers: BlockheightAccuracy[];
  isLoading: boolean;
}

const BlockheightTable: React.FC<BlockheightTableProps> = ({ providers, isLoading }) => {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 99.5) return "bg-green-500 text-white";
    if (accuracy >= 98) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  if (isLoading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <p className="text-muted-foreground">Loading blockheight data...</p>
      </div>
    );
  }

  if (!providers || providers.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center">
        <p className="text-muted-foreground">No blockheight data available</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead className="text-right">Tip Accuracy</TableHead>
          <TableHead className="text-right">Ahead %</TableHead>
          <TableHead className="text-right">Total Checks</TableHead>
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
              <Badge className={getAccuracyColor(provider.tip_accuracy_percentage)}>
                {provider.tip_accuracy_percentage.toFixed(2)}%
              </Badge>
            </TableCell>
            <TableCell className="text-right">{provider.ahead_percentage.toFixed(2)}%</TableCell>
            <TableCell className="text-right">{provider.total_count.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BlockheightTable;
