
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ProviderChartProps {
  chartData: Array<Record<string, any>>;
  providers: string[];
  selectedProviders: Record<string, boolean>;
  getProviderColor: (provider: string) => string;
}

const ProviderChart: React.FC<ProviderChartProps> = ({
  chartData,
  providers,
  selectedProviders,
  getProviderColor
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 12 }}
          tickMargin={10}
          // Increase the number of ticks to show more time points
          interval="preserveStartEnd"
        />
        <YAxis 
          domain={['dataMin', 'dataMax']}
          tick={{ fontSize: 12 }}
          tickMargin={10}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(label, payload) => {
                // Display the exact timestamp in the tooltip for precision
                if (payload && payload.length > 0 && payload[0].payload.formattedTime) {
                  return `Time: ${payload[0].payload.formattedTime}`;
                }
                return `Time: ${label}`;
              }}
              formatter={(value, name) => [value.toLocaleString(), name]}
            />
          }
        />
        <Legend verticalAlign="top" height={36} />
        
        {providers.map(provider => (
          selectedProviders[provider] && (
            <Line
              key={provider}
              type="monotone"
              dataKey={provider}
              stroke={getProviderColor(provider)}
              // Show dots for each data point to emphasize the second-level granularity
              dot={{ r: 2 }}
              activeDot={{ r: 6 }}
              name={provider}
              isAnimationActive={false}
              // Connect the dots only when data exists (no interpolation for missing points)
              connectNulls={false}
            />
          )
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProviderChart;
