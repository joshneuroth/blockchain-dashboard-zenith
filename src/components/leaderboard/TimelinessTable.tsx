
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';
import { LeaderboardProvider } from '@/hooks/useLeaderboardData';

interface TimelinessTableProps {
  providers: LeaderboardProvider[];
}

const TimelinessTable: React.FC<TimelinessTableProps> = ({ providers }) => {
  // Get timeliness ranking color
  const getTimelinessColor = (score: number) => {
    if (score >= 95) return "bg-green-500 text-white";
    if (score >= 85) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Rank</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Network</TableHead>
          <TableHead className="text-right">Timeliness Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {providers.map((provider, index) => (
          <TableRow key={`${provider.provider}-${provider.network}`}>
            <TableCell className="font-mono">
              {index === 0 ? (
                <div className="flex items-center justify-center">
                  <Award className="text-yellow-500" size={18} />
                </div>
              ) : (
                <div className="text-center">{index + 1}</div>
              )}
            </TableCell>
            <TableCell className="font-medium">{provider.provider}</TableCell>
            <TableCell>{provider.network}</TableCell>
            <TableCell className="text-right">
              <Badge className={getTimelinessColor(provider.timeliness)}>
                {provider.timeliness.toFixed(1)}%
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TimelinessTable;
