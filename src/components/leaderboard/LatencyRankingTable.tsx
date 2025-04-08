
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';
import { LeaderboardProvider } from '@/hooks/useLeaderboardData';
import { TimePeriod } from '@/hooks/useLatencyRankingFilters';

interface LatencyRankingTableProps {
  providers: LeaderboardProvider[];
  selectedNetwork: string;
  selectedRegion: string;
  selectedPeriod: TimePeriod;
}

const LatencyRankingTable: React.FC<LatencyRankingTableProps> = ({
  providers,
  selectedNetwork,
  selectedRegion,
  selectedPeriod
}) => {
  const getLatencyColor = (latency: number) => {
    if (latency <= 200) return "bg-green-500 text-white";
    if (latency <= 500) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  if (providers.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center">
        <p className="text-muted-foreground">
          No latency data available for {selectedNetwork} 
          {selectedRegion !== "All Regions" ? ` in ${selectedRegion}` : ''}
          {selectedPeriod !== "all" ? ` over the past ${selectedPeriod}` : ''}
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Rank</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Network</TableHead>
          <TableHead>Region</TableHead>
          <TableHead className="text-right">P50 Latency</TableHead>
          <TableHead className="text-right">P90/P50 Ratio</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {providers.map((provider, index) => (
          <TableRow key={`${provider.provider}-${provider.network}-${provider.region || 'global'}`}>
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
            <TableCell>{provider.region || "Global"}</TableCell>
            <TableCell className="text-right">
              <Badge className={getLatencyColor(provider.latency)}>
                {provider.latency.toFixed(1)} ms
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {provider.p50_p90_ratio !== undefined ? (
                <span>{provider.p50_p90_ratio.toFixed(2)}</span>
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

export default LatencyRankingTable;
