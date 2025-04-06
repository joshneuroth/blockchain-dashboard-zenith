
import React from 'react';
import { ProviderStatus } from '@/hooks/useProviderStatus';
import { Card, CardContent } from '@/components/ui/card';
import StatusIndicator from './StatusIndicator';

interface StatusSummaryProps {
  data: ProviderStatus[];
}

const StatusSummary: React.FC<StatusSummaryProps> = ({ data }) => {
  // Calculate total services
  const totalProviders = data.length;
  
  // Count services by status
  const statusCounts = data.reduce((acc, provider) => {
    const hasCritical = provider.networks.some(n => n.status.blocks_behind > 5);
    const hasDegraded = !hasCritical && provider.networks.some(n => n.status.blocks_behind >= 1 && n.status.blocks_behind <= 5);
    const isOperational = !hasCritical && !hasDegraded;
    
    return {
      operational: acc.operational + (isOperational ? 1 : 0),
      degraded: acc.degraded + (hasDegraded ? 1 : 0),
      critical: acc.critical + (hasCritical ? 1 : 0)
    };
  }, { operational: 0, degraded: 0, critical: 0 });
  
  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-4">System Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-4">
            <StatusIndicator status="operational" showLabel className="flex-1" />
            <span className="text-xl font-bold">{statusCounts.operational}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <StatusIndicator status="degraded" showLabel className="flex-1" />
            <span className="text-xl font-bold">{statusCounts.degraded}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <StatusIndicator status="critical" showLabel className="flex-1" />
            <span className="text-xl font-bold">{statusCounts.critical}</span>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          Total services: {totalProviders}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusSummary;
