
import React from 'react';
import { CloudLatencyData } from '@/hooks/useCloudLatency';
import CloudProviderConnection from './CloudProviderConnection';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface CloudLatencyConnectionsProps {
  data: CloudLatencyData[];
  networkName: string;
}

const CloudLatencyConnections: React.FC<CloudLatencyConnectionsProps> = ({ data, networkName }) => {
  // Safety check for data
  const validData = Array.isArray(data) ? data : [];
  
  // Exit early with a message if no data
  if (validData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No cloud latency data available at this time.</p>
      </div>
    );
  }
  
  // Organize data by provider
  const providerData: Record<string, CloudLatencyData[]> = validData.reduce((acc, item) => {
    if (!acc[item.provider_name]) {
      acc[item.provider_name] = [];
    }
    acc[item.provider_name].push(item);
    return acc;
  }, {} as Record<string, CloudLatencyData[]>);

  // Get the latest data point for each provider
  const latestByProvider = Object.keys(providerData).map(provider => {
    const providerItems = providerData[provider];
    // Sort by timestamp (newest first) and get the first item
    return providerItems.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  });

  // Sort providers by response time (faster first)
  const sortedProviders = latestByProvider.sort((a, b) => a.response_time - b.response_time);
  
  // Prepare chart data with safety check for each property
  const chartData = sortedProviders.map(provider => ({
    name: provider.provider_name || 'Unknown',
    responseTime: typeof provider.response_time === 'number' ? Math.round(provider.response_time) : 0,
    fill: provider.response_time < 100 ? "#22c55e" : 
          provider.response_time < 300 ? "#eab308" : "#ef4444"
  }));

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Response times from cloud services to {networkName} RPCs. Data collected over the last 7 days.
      </p>
      
      {/* Chart visualization */}
      <div className="h-64 w-full">
        <ChartContainer
          config={{ responseTime: { color: "#3b82f6" } }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              layout="vertical"
            >
              <XAxis type="number" unit=" ms" />
              <YAxis type="category" dataKey="name" tick={{fontSize: 12}} width={100} />
              <Tooltip
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value) => [`${value} ms`, 'Response Time']}
                  />
                }
              />
              <Bar 
                dataKey="responseTime"
                name="Response Time" 
                radius={[0, 4, 4, 0]}
                barSize={20}
                fill="var(--color-responseTime)"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      
      {/* Detailed provider connections */}
      <div className="space-y-3 mt-4">
        {sortedProviders.map((providerInfo, index) => {
          // Make sure we have non-empty arrays of data for each provider 
          const providerDataArray = providerData[providerInfo.provider_name] || [];
          
          return (
            <CloudProviderConnection 
              key={`${providerInfo.provider_name}-${index}`}
              provider={providerInfo}
              allData={providerDataArray}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CloudLatencyConnections;
