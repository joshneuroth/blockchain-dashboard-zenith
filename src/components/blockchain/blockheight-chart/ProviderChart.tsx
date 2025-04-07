
import React, { useContext } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area
} from 'recharts';
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useTheme } from "next-themes";
import { useParams } from "react-router-dom";

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
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const { networkId } = useParams();

  // Determine the gradient colors based on network
  const getGradientColors = (networkId: string | undefined, isDarkMode: boolean) => {
    if (isDarkMode) {
      // Dark mode gradients
      switch(networkId) {
        case 'ethereum': 
          return { start: '#4c249f', end: '#141428' };
        case 'polygon': 
          return { start: '#673ab7', end: '#1a1a2e' };
        case 'avalanche': 
          return { start: '#e84142', end: '#1a1a1a' };
        case 'binance': 
          return { start: '#f0b90b', end: '#1a1a1a' };
        default: 
          return { start: '#4c249f', end: '#141428' }; // Default to ethereum colors
      }
    } else {
      // Light mode gradients
      switch(networkId) {
        case 'ethereum': 
          return { start: '#CFB9FA', end: '#E0C7DE' };
        case 'polygon': 
          return { start: '#9945FF', end: '#D4C1FA' };
        case 'avalanche': 
          return { start: '#FF8B8C', end: '#FFD4D4' };
        case 'binance': 
          return { start: '#FFDD33', end: '#FFF5D4' };
        default: 
          return { start: '#CFB9FA', end: '#E0C7DE' }; // Default to ethereum colors
      }
    }
  };

  const gradientColors = getGradientColors(networkId, isDarkMode);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="networkGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={gradientColors.start} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={gradientColors.end} stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 12 }}
          tickMargin={10}
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
            <React.Fragment key={`${provider}-fragment`}>
              <Area
                type="step"
                dataKey={provider}
                stroke={getProviderColor(provider)}
                strokeWidth={2}
                fill="url(#networkGradient)"
                fillOpacity={0.6}
                connectNulls={false}
              />
              <Line
                key={provider}
                type="step"
                dataKey={provider}
                stroke={getProviderColor(provider)}
                dot={{ r: 2 }}
                activeDot={{ r: 6 }}
                name={provider}
                isAnimationActive={false}
                connectNulls={false}
                strokeWidth={2}
              />
            </React.Fragment>
          )
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProviderChart;
