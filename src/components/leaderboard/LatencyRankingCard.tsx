import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Zap, Award, ExternalLink, Filter, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { LeaderboardProvider } from '@/hooks/useLeaderboardData';
import { NETWORKS } from '@/lib/api';

interface LatencyRankingCardProps {
  providers: LeaderboardProvider[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: string | null;
}

const LatencyRankingCard: React.FC<LatencyRankingCardProps> = ({ 
  providers,
  isLoading,
  error,
  lastUpdated
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string>("Ethereum");
  const [selectedRegion, setSelectedRegion] = useState<string>("All Regions");
  
  const availableNetworks = React.useMemo(() => {
    if (!providers || providers.length === 0) return ["Ethereum"];
    
    const networks = [...new Set(providers.map(provider => provider.network))];
    return networks.length > 0 ? networks : ["Ethereum"];
  }, [providers]);

  const availableRegions = React.useMemo(() => {
    if (!providers || providers.length === 0) return ["All Regions"];
    
    const regions = ["All Regions", ...new Set(providers
      .filter(provider => provider.network === selectedNetwork && provider.region)
      .map(provider => provider.region as string))];
    
    return regions;
  }, [providers, selectedNetwork]);

  const filteredProviders = React.useMemo(() => {
    return [...(providers || [])]
      .filter(provider => 
        provider.latency > 0 && 
        provider.network === selectedNetwork &&
        (selectedRegion === "All Regions" || provider.region === selectedRegion)
      )
      .sort((a, b) => a.latency - b.latency);
  }, [providers, selectedNetwork, selectedRegion]);

  const getLatencyColor = (latency: number) => {
    if (latency <= 200) return "bg-green-500 text-white";
    if (latency <= 500) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const handleNetworkChange = (network: string) => {
    setSelectedNetwork(network);
    setSelectedRegion("All Regions");
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Zap size={20} />
            Provider Latency Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-center justify-center">
            <p className="text-muted-foreground">Loading latency data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Zap size={20} />
            Provider Latency Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-center justify-center">
            <p className="text-red-500">Error loading latency data: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Zap size={20} />
          Provider Latency Ranking
        </CardTitle>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Filter size={16} className="text-muted-foreground" />
            <Select value={selectedNetwork} onValueChange={handleNetworkChange}>
              <SelectTrigger className="w-[140px] h-10">
                <SelectValue placeholder="Select Network" />
              </SelectTrigger>
              <SelectContent>
                {availableNetworks.map((network) => (
                  <SelectItem key={network} value={network}>
                    {network}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-1">
            <Globe size={16} className="text-muted-foreground" />
            <Select value={selectedRegion} onValueChange={handleRegionChange}>
              <SelectTrigger className="w-[140px] h-10">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                {availableRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredProviders.length === 0 ? (
          <div className="h-60 flex items-center justify-center">
            <p className="text-muted-foreground">
              No latency data available for {selectedNetwork} 
              {selectedRegion !== "All Regions" ? ` in ${selectedRegion}` : ''}
            </p>
          </div>
        ) : (
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
              {filteredProviders.map((provider, index) => (
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
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          {lastUpdated ? `Last updated: ${formatDate(lastUpdated)}` : 'Data freshness unknown'}
        </p>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
          onClick={() => window.open('https://blockheight-api.fly.dev/docs', '_blank')}
        >
          <ExternalLink size={14} />
          API Docs
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LatencyRankingCard;
