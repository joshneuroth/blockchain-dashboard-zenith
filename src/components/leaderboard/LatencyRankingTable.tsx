
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';
import { ProviderData } from '@/hooks/useLeaderboardData';
import { TimePeriod } from '@/hooks/useLatencyRankingFilters';

interface LatencyRankingTableProps {
  providers: ProviderData[];
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
    if (latency < 80) return "bg-green-500 text-white";
    if (latency <= 120) return "bg-yellow-500 text-white";
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
          <TableHead className="text-right">P50 Latency</TableHead>
          <TableHead className="text-right">P90 Latency</TableHead>
          <TableHead className="text-right">Tests</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {providers.map((provider) => {
          // Get the relevant latency data based on region selection
          let latencyData;
          
          if (selectedRegion === "All Regions") {
            // Use overall latency
            latencyData = {
              rank: provider.latency.overall.rank,
              p50: provider.latency.overall.overall_p50_latency_ms,
              p90: null, // Overall doesn't have p90
              tests: provider.latency.by_region.reduce((sum, region) => sum + region.total_tests, 0),
              isTied: provider.latency.overall.is_tied,
              tiedCount: provider.latency.overall.tied_count
            };
          } else {
            // Find the specific region data
            const regionData = provider.latency.by_region.find(r => r.region === selectedRegion);
            
            if (!regionData) {
              return null; // Skip this provider if no data for selected region
            }
            
            latencyData = {
              rank: regionData.rank,
              p50: regionData.p50_latency_ms,
              p90: regionData.p90_latency_ms,
              tests: regionData.total_tests,
              isTied: regionData.is_tied,
              tiedCount: regionData.tied_count
            };
          }
          
          return (
            <TableRow key={provider.provider_name}>
              <TableCell className="font-mono">
                {latencyData.rank === 1 ? (
                  <div className="flex items-center justify-center">
                    <Award className="text-yellow-500" size={18} />
                  </div>
                ) : (
                  <div className="text-center">
                    {latencyData.rank}
                    {latencyData.isTied && latencyData.tiedCount > 0 && 
                      <span className="text-xs text-muted-foreground ml-1">
                        (tied with {latencyData.tiedCount})
                      </span>
                    }
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{provider.provider_name}</TableCell>
              <TableCell className="text-right">
                <Badge className={getLatencyColor(latencyData.p50)}>
                  {latencyData.p50.toFixed(1)} ms
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {latencyData.p90 !== null ? (
                  <span>{latencyData.p90.toFixed(1)} ms</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {latencyData.tests.toLocaleString()}
              </TableCell>
            </TableRow>
          );
        }).filter(Boolean)}
      </TableBody>
    </Table>
  );
};

export default LatencyRankingTable;
