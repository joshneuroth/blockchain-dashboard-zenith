
import React from 'react';
import { Globe, Wifi } from 'lucide-react';
import type { GeoLocationInfo } from '@/hooks/blockchain/utils/geoLocationUtils';

interface UserLocationBoxProps {
  geoInfo: GeoLocationInfo;
}

const UserLocationBox: React.FC<UserLocationBoxProps> = ({ geoInfo }) => {
  return (
    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm z-10 w-56">
      <div className="text-xs text-gray-500 mb-1">Your Connection</div>
      <div className="flex items-center gap-2 mb-2">
        <Globe size={16} />
        <span className="text-sm font-medium">{geoInfo.location || 'Detecting...'}</span>
      </div>
      
      {geoInfo.asn && (
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
          <Wifi size={14} />
          <span>{geoInfo.asn}</span>
          {geoInfo.isp && <span>· {geoInfo.isp}</span>}
        </div>
      )}
    </div>
  );
};

export default UserLocationBox;
