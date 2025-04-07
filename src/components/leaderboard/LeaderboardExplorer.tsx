
import React from 'react';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Trophy, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LeaderboardExplorer: React.FC = () => {
  const { data, isLoading, error, rawResponse } = useLeaderboardData();

  return (
    <Card className="glass-card mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Trophy size={20} />
          Blockchain Provider Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span>Loading leaderboard data...</span>
          </div>
        )}
        
        {error && (
          <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-800 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading leaderboard data</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}
        
        {!isLoading && !error && data && data.length > 0 && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Response Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 10).map((entry, index) => (
                  <TableRow key={`${entry.provider}-${entry.network}-${index}`}>
                    <TableCell>{entry.rank || index + 1}</TableCell>
                    <TableCell className="font-medium">{entry.provider}</TableCell>
                    <TableCell>{entry.network}</TableCell>
                    <TableCell>{entry.score?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell>{entry.uptime ? `${(entry.uptime * 100).toFixed(2)}%` : 'N/A'}</TableCell>
                    <TableCell>{entry.responseTime ? `${entry.responseTime.toFixed(2)}ms` : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {!isLoading && !error && (!data || data.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-500">No leaderboard data available</p>
          </div>
        )}
        
        {!isLoading && !error && rawResponse && (
          <div className="mt-8 border-t pt-4">
            <details>
              <summary className="cursor-pointer text-sm font-medium">Raw API Response</summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded-md text-xs overflow-auto max-h-96">
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Data from blockheight-api.fly.dev
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('https://blockheight-api.fly.dev/docs', '_blank')}
        >
          API Docs
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LeaderboardExplorer;
