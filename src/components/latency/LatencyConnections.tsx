
import React from 'react';
import { LatencyResult } from '@/hooks/blockchain/useLatencyTest';
import UserLocationBox from './UserLocationBox';
import ProviderConnection from './ProviderConnection';
import type { GeoLocationInfo } from '@/hooks/blockchain/utils/geoLocationUtils';

interface LatencyConnectionsProps {
  results: LatencyResult[];
  geoInfo: GeoLocationInfo;
}

const LatencyConnections: React.FC<LatencyConnectionsProps> = ({ results, geoInfo }) => {
  return (
    <div className="relative my-8">
      {/* User location box */}
      <UserLocationBox geoInfo={geoInfo} />
      
      {/* Connection lines and results */}
      <div className="ml-[220px] space-y-6">
        {results.map((result, index) => (
          <ProviderConnection key={index} result={result} />
        ))}
      </div>
    </div>
  );
};

export default LatencyConnections;
