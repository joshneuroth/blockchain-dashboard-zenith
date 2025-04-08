
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, Award, ExternalLink, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaderboardProvider } from '@/hooks/useLeaderboardData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface TimelinessRankingCardProps {
  providers: LeaderboardProvider[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: string | null;
}

const TimelinessRankingCard: React.FC<TimelinessRankingCardProps> = ({ 
  providers,
  isLoading,
  error,
  lastUpdated
}) => {
  // State for filters
  const [selectedNetwork, setSelectedNetwork] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Extract unique networks from providers
  const networks = React.useMemo(() => {
    const uniqueNetworks = [...new Set(providers.map(provider => provider.network))];
    return ["all", ...uniqueNetworks].filter(Boolean);
  }, [providers]);

  // Sort and filter providers by timeliness (higher is better) and filter by selected network
  const filteredProviders = React.useMemo(() => {
    return [...(providers || [])]
      .filter(provider => provider.timeliness > 0)
      .filter(provider => selectedNetwork === "all" || provider.network === selectedNetwork)
      .sort((a, b) => b.timeliness - a.timeliness);
  }, [providers, selectedNetwork]);

  // Get timeliness ranking color
  const getTimelinessColor = (score: number) => {
    if (score >= 95) return "bg-green-500 text-white";
    if (score >= 85) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Clock size={20} />
            Provider Timeliness Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-center justify-center">
            <p className="text-muted-foreground">Loading timeliness data...</p>
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
            <Clock size={20} />
            Provider Timeliness Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-center justify-center">
            <p className="text-red-500">Error loading timeliness data: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredProviders.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl font-medium flex items-center gap-2">
            <Clock size={20} />
            Provider Timeliness Ranking
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-4">
            {/* Network Filter */}
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  <SelectValue placeholder="Filter by network" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {networks.map((network) => (
                  <SelectItem key={network} value={network}>
                    {network === "all" ? "All Networks" : network}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Date Range Selector - Start Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Start Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            {/* Date Range Selector - End Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "End Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-center justify-center">
            <p className="text-muted-foreground">No timeliness data available for the selected filters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Clock size={20} />
          Provider Timeliness Ranking
        </CardTitle>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {/* Network Filter */}
          <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <SelectValue placeholder="Filter by network" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {networks.map((network) => (
                <SelectItem key={network} value={network}>
                  {network === "all" ? "All Networks" : network}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Date Range Selector - Start Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Start Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          {/* Date Range Selector - End Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "End Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          {/* Reset Filters Button */}
          {(selectedNetwork !== "all" || startDate || endDate) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedNetwork("all");
                setStartDate(undefined);
                setEndDate(undefined);
              }}
              className="text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
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
            {filteredProviders.map((provider, index) => (
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

export default TimelinessRankingCard;
