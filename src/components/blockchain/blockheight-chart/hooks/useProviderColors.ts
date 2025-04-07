
import { useMemo } from 'react';
import { BlockheightTimeSeriesData } from '@/hooks/useBlockheightTimeSeries';

// Provider color mapping
const PROVIDER_COLORS: Record<string, string> = {
  "DRPC": "#4285F4",
  "Llama RPC": "#F5A623",
  "Chainstack": "#5E35B1",
  "Infura": "#9C27B0",
  "Quicknode": "#E91E63",
  "Alchemy": "#3F51B5",
  "Ankr": "#FF9800",
  "Pocket": "#4CAF50",
  "Blast API": "#2196F3",
  "BlockPI": "#673AB7",
  "FlashBots": "#2E7D32",
  "Lava": "#D32F2F",
  "NodeReal": "#00796B",
  "Public Node": "#455A64",
  "Tenderly-ETH": "#795548",
};

// Get color for a provider, fallback to a default color
export const getProviderColorStatic = (provider: string): string => {
  return PROVIDER_COLORS[provider] || '#888888';
};

export const useProviderColors = (data: BlockheightTimeSeriesData | null) => {
  // Get color for a provider, fallback to a default color
  const getProviderColor = (provider: string): string => {
    return PROVIDER_COLORS[provider] || '#888888';
  };

  // Create chart config for providers
  const chartConfig = useMemo(() => {
    const config: Record<string, any> = {};
    
    if (data?.providers) {
      Object.keys(data.providers).forEach(provider => {
        config[provider] = {
          label: provider,
          color: getProviderColor(provider)
        };
      });
    }
    
    return config;
  }, [data?.providers]);

  return { getProviderColor, chartConfig };
};
