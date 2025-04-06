
import React from 'react';
import { ProviderNetworkStatus } from '@/hooks/useProviderStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusIndicator from './StatusIndicator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  const overallStatus = networks.some(n => n.status.blocks_behind > 5) 
    ? 'critical' 
    : networks.some(n => n.status.blocks_behind >= 1) 
      ? 'degraded' 
      : 'operational';

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          {provider}
          <StatusIndicator 
            status={overallStatus} 
            showLabel 
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Network</TableHead>
              <TableHead>Chain ID</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {networks.map((network) => (
              <TableRow key={network.chain_id}>
                <TableCell className="font-medium">{network.network}</TableCell>
                <TableCell>{network.chain_id}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <StatusIndicator status={getStatusType(network.status.blocks_behind)} />
                    <span className="text-xs text-muted-foreground">
                      {network.status.blocks_behind === 0 
                        ? "At consensus" 
                        : `${network.status.blocks_behind} blocks behind`}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProviderStatusCard;
