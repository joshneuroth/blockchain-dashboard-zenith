
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';
import { ProviderData } from '@/hooks/useLeaderboardData';

interface TimelinessTableProps {
  providers: ProviderData[];
}

const TimelinessTable: React.FC<TimelinessTableProps> = ({ providers }) => {
  // Get blockheight accuracy color
  const getAccuracyColor = (score: number) => {
    if (score >= 99.5) return "bg-green-500 text-white";
    if (score >= 98) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  // Modified to show blockheight accuracy
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Ahead Rank</TableHead>
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
              {provider.blockheight_accuracy.ahead_rank === 1 ? (
                <div className="flex items-center justify-center">
                  <Award className="text-yellow-500" size={18} />
                </div>
              ) : (
                <div className="text-center">
                  {provider.blockheight_accuracy.ahead_rank}
                  {provider.blockheight_accuracy.is_tied_ahead_rank && 
                    <span className="text-xs text-muted-foreground ml-1">
                      (tied)
                    </span>}
                </div>
              )}
            </TableCell>
            <TableCell className="font-medium">{provider.provider_name}</TableCell>
            <TableCell className="text-right">
              <Badge className={getAccuracyColor(provider.blockheight_accuracy.tip_accuracy_percentage)}>
                {provider.blockheight_accuracy.tip_accuracy_percentage.toFixed(2)}%
              </Badge>
            </TableCell>
            <TableCell className="text-right">{provider.blockheight_accuracy.ahead_percentage.toFixed(2)}%</TableCell>
            <TableCell className="text-right">{provider.blockheight_accuracy.total_count.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TimelinessTable;
