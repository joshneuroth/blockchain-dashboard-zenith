
import React from 'react';
import { CloudLatencyData } from '@/hooks/useCloudLatency';
import CloudLatencyConnections from './CloudLatencyConnections';
import CloudLatencyLoading from './states/CloudLatencyLoading';
import CloudLatencyEmpty from './states/CloudLatencyEmpty';
import CloudLatencyError from './states/CloudLatencyError';

interface CloudLatencyContentProps {
  isLoading: boolean;
  error: string | null;
  data: CloudLatencyData[] | null;
  networkId: string;
  networkName: string;
  rawApiResponse: any;
}

const CloudLatencyContent: React.FC<CloudLatencyContentProps> = ({
  isLoading,
  error,
  data,
  networkId,
  networkName,
  rawApiResponse
}) => {
  if (isLoading) {
    return <CloudLatencyLoading />;
  }

  if (error) {
    return <CloudLatencyError error={error} networkId={networkId} />;
  }

  if (!data || data.length === 0) {
    return <CloudLatencyEmpty 
      networkId={networkId} 
      networkName={networkName} 
      rawApiResponse={rawApiResponse} 
    />;
  }

  return (
    <>
      <CloudLatencyConnections 
        data={data} 
        networkName={networkName}
      />
    </>
  );
};

export default CloudLatencyContent;
