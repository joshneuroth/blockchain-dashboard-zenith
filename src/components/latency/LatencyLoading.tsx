
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LatencyLoadingProps {
  networkName: string;
}

const LatencyLoading: React.FC<LatencyLoadingProps> = ({ networkName }) => {
  return (
    <Card className="glass-card mb-6 animate-fade-in">
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <RefreshCw size={48} className="mb-4 opacity-70 animate-spin" />
        <h3 className="text-xl font-medium mb-2">Measuring RPC Latency...</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          Testing connection speed between your browser and {networkName} RPC endpoints.
        </p>
      </CardContent>
    </Card>
  );
};

export default LatencyLoading;
