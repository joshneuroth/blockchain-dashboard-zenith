
import React from 'react';
import { CloudLatencyData } from '@/hooks/useCloudLatency';
import { AlertCircle } from 'lucide-react';
import CloudLatencyTable from './CloudLatencyTable';

interface CloudLatencyConnectionsProps {
  data: CloudLatencyData[];
  networkName: string;
}

const CloudLatencyConnections: React.FC<CloudLatencyConnectionsProps> = ({ data, networkName }) => {
  // Check if we have valid data
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-6">
        <AlertCircle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
        <p>No cloud latency data available for {networkName}.</p>
      </div>
    );
  }

  return (
    <div>
      <CloudLatencyTable data={data} filterMethod={null} />
    </div>
  );
};

export default CloudLatencyConnections;
