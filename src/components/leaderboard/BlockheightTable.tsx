
import React, { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Medal, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';
import { BlockheightAccuracy } from '@/hooks/useLeaderboardData';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface BlockheightTableProps {
  providers: BlockheightAccuracy[];
  isLoading: boolean;
}

const BlockheightTable: React.FC<BlockheightTableProps> = ({ providers, isLoading }) => {
  const [sortField, setSortField] = useState<'rank' | 'tip_rank' | 'ahead_rank'>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 99.5) return "bg-green-500 text-white";
    if (accuracy >= 98) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  const handleSort = (field: 'rank' | 'tip_rank' | 'ahead_rank') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProviders = [...(providers || [])].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    return (a[sortField] - b[sortField]) * multiplier;
  });

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

  // Filter out any null or undefined providers
  const validProviders = sortedProviders.filter(provider => provider !== null && provider !== undefined);

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="w-16 cursor-pointer" 
              onClick={() => handleSort('rank')}
            >
              <div className="flex items-center">
                Overall Rank
                {sortField === 'rank' && (
                  sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                )}
              </div>
            </TableHead>
            <TableHead>Provider</TableHead>
            <TableHead 
              className="cursor-pointer text-right" 
              onClick={() => handleSort('tip_rank')}
            >
              <div className="flex items-center justify-end">
                <div className="flex items-center">
                  At Tip Rank
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <span className="inline-flex cursor-help ml-1">
                        <HelpCircle size={14} className="text-muted-foreground" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="max-w-xs">Ranking based on how accurately the provider reports the latest block</p>
                    </TooltipContent>
                  </Tooltip>
                  {sortField === 'tip_rank' && (
                    sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                  )}
                </div>
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer text-right" 
              onClick={() => handleSort('ahead_rank')}
            >
              <div className="flex items-center justify-end">
                <div className="flex items-center">
                  Ahead Rank
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <span className="inline-flex cursor-help ml-1">
                        <HelpCircle size={14} className="text-muted-foreground" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="max-w-xs">Ranking based on how often the provider is ahead of consensus</p>
                    </TooltipContent>
                  </Tooltip>
                  {sortField === 'ahead_rank' && (
                    sortDirection === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                  )}
                </div>
              </div>
            </TableHead>
            <TableHead className="text-right">Tip Accuracy</TableHead>
            <TableHead className="text-right">Ahead %</TableHead>
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
                {provider.tip_rank === 1 ? (
                  <span className="flex justify-end items-center">
                    <span className="mr-1">1</span>
                    <Medal className="text-yellow-500" size={14} />
                  </span>
                ) : (
                  provider.tip_rank
                )}
                {provider.is_tied_tip_rank && 
                  <span className="text-xs text-muted-foreground ml-1">
                    (tied)
                  </span>}
              </TableCell>
              <TableCell className="text-right">
                {provider.ahead_rank === 1 ? (
                  <span className="flex justify-end items-center">
                    <span className="mr-1">1</span>
                    <Medal className="text-yellow-500" size={14} />
                  </span>
                ) : (
                  provider.ahead_rank
                )}
                {provider.is_tied_ahead_rank && 
                  <span className="text-xs text-muted-foreground ml-1">
                    (tied)
                  </span>}
              </TableCell>
              <TableCell className="text-right">
                <Badge className={getAccuracyColor(provider.tip_accuracy_percentage)}>
                  {provider.tip_accuracy_percentage.toFixed(2)}%
                </Badge>
              </TableCell>
              <TableCell className="text-right">{provider.ahead_percentage.toFixed(2)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
};

export default BlockheightTable;
