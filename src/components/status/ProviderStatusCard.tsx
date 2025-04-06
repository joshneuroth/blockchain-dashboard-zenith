
import React from 'react';
import { ProviderNetworkStatus } from '@/hooks/useProviderStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusIndicator from './StatusIndicator';

interface ProviderStatusCardProps {
  provider: string;
  networks: ProviderNetworkStatus[];
}

const getStatusType = (blocksBehind: number) => {
  if (blocksBehind === 0) return 'operational';
  if (blocksBehind >= 1 && blocksBehind <= 5) return 'degraded';
  return 'critical';
};

const ProviderStatusCard: React.FC<ProviderStatusCardProps> = ({ provider, networks }) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          {provider}
          <StatusIndicator 
            status={networks.some(n => n.status.blocks_behind > 5) 
              ? 'critical' 
              : networks.some(n => n.status.blocks_behind >= 1) 
                ? 'degraded' 
                : 'operational'
            } 
            showLabel 
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {networks.map((network) => (
            <div key={network.chain_id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div>
                <div className="font-medium">{network.network}</div>
                <div className="text-sm text-muted-foreground">
                  Chain ID: {network.chain_id}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusIndicator status={getStatusType(network.status.blocks_behind)} />
                <div className="text-xs text-muted-foreground">
                  {network.status.blocks_behind === 0 
                    ? "At consensus" 
                    : `${network.status.blocks_behind} blocks behind`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderStatusCard;
