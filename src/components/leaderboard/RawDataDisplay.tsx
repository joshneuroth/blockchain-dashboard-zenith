
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LeaderboardResponse } from '@/hooks/useLeaderboardData';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RawDataDisplayProps {
  data: LeaderboardResponse | undefined;
  isLoading: boolean;
  error: Error | null;
}

const RawDataDisplay: React.FC<RawDataDisplayProps> = ({ data, isLoading, error }) => {
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("formatted");
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleString();
  };
  
  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-medium flex items-center gap-2">
            Raw API Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-8 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-medium flex items-center gap-2">
            Raw API Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-60">
            <p className="text-lg font-medium text-red-500 mb-2">Failed to load data</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-medium flex items-center gap-2">
            Raw API Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-60">
            <p className="text-lg font-medium mb-2">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-2xl font-medium flex items-center gap-2">
          Raw API Data
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Complete API response for the Ethereum providers leaderboard
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
            <TabsTrigger value="formatted">Formatted</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>
          
          <TabsContent value="formatted">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">NETWORK</p>
                  <p className="font-medium">{data.network}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CHAIN ID</p>
                  <p className="font-medium">{data.chain_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">TIME PERIOD</p>
                  <p className="font-medium">{data.time_period}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">TIME RANGE</p>
                  <p className="font-medium">
                    {formatDate(data.time_range.start)} - {formatDate(data.time_range.end)}
                  </p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-4">Provider Metrics</h3>
            
            <ScrollArea className="h-[500px] rounded-md border">
              <Accordion type="single" collapsible className="w-full">
                {data.provider_metrics.map((provider, index) => (
                  <AccordionItem key={provider.provider_name} value={provider.provider_name}>
                    <AccordionTrigger className="px-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="mr-2">{index + 1}</Badge>
                        <span>{provider.provider_name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-3">
                          <h4 className="font-medium">Latency</h4>
                          <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                            <h5 className="font-medium text-sm">Overall</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                              <div>
                                <span className="text-muted-foreground">P50 Latency:</span>
                              </div>
                              <div>
                                <Badge>{provider.latency.overall.overall_p50_latency_ms.toFixed(2)} ms</Badge>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Rank:</span>
                              </div>
                              <div>
                                #{provider.latency.overall.rank}
                                {provider.latency.overall.is_tied && 
                                  <span className="ml-1 text-xs text-muted-foreground">
                                    (tied with {provider.latency.overall.tied_count})
                                  </span>
                                }
                              </div>
                            </div>
                          </div>
                          
                          <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                            <h5 className="font-medium text-sm">By Region</h5>
                            <div className="mt-1">
                              {provider.latency.by_region.map(region => (
                                <div key={region.region} className="mb-2 text-sm">
                                  <div className="font-medium">{region.region}</div>
                                  <div className="grid grid-cols-2 gap-2 pl-2">
                                    <div>
                                      <span className="text-muted-foreground">P50:</span>
                                    </div>
                                    <div>
                                      <Badge>{region.p50_latency_ms.toFixed(2)} ms</Badge>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">P90:</span>
                                    </div>
                                    <div>
                                      <Badge>{region.p90_latency_ms.toFixed(2)} ms</Badge>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Tests:</span>
                                    </div>
                                    <div>
                                      {region.total_tests}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Rank:</span>
                                    </div>
                                    <div>
                                      #{region.rank}
                                      {region.is_tied && 
                                        <span className="ml-1 text-xs text-muted-foreground">
                                          (tied with {region.tied_count})
                                        </span>
                                      }
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-medium">Blockheight Accuracy</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Tip Accuracy:</span>
                            </div>
                            <div>
                              <Badge>{provider.blockheight_accuracy.tip_accuracy_percentage.toFixed(2)}%</Badge>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Ahead %:</span>
                            </div>
                            <div>
                              {provider.blockheight_accuracy.ahead_percentage.toFixed(2)}%
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Checks:</span>
                            </div>
                            <div>
                              {provider.blockheight_accuracy.total_count}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Rank:</span>
                            </div>
                            <div>
                              #{provider.blockheight_accuracy.rank}
                            </div>
                          </div>
                          
                          <h4 className="font-medium">Reliability</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Error Rate:</span>
                            </div>
                            <div>
                              <Badge>{provider.reliability.error_rate_percentage.toFixed(2)}%</Badge>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Tests:</span>
                            </div>
                            <div>
                              {provider.reliability.total_tests}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Rank:</span>
                            </div>
                            <div>
                              #{provider.reliability.rank}
                              {provider.reliability.is_tied && 
                                <span className="ml-1 text-xs text-muted-foreground">
                                  (tied with {provider.reliability.tied_count})
                                </span>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="json">
            <ScrollArea className="h-[600px] rounded-md border">
              <pre className="p-4 text-xs whitespace-pre-wrap overflow-auto bg-slate-50 dark:bg-slate-900 rounded-md">
                {JSON.stringify(data, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Last updated: {formatDate(data.time_range?.end)}
        </p>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
          onClick={() => window.open('https://blockheight-api.fly.dev/docs', '_blank')}
        >
          Documentation
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RawDataDisplay;
