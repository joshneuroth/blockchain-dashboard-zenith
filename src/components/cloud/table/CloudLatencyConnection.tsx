
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CloudLatencyConnectionProps {
  isHighLatency: boolean;
}

const CloudLatencyConnection: React.FC<CloudLatencyConnectionProps> = ({ isHighLatency }) => {
  return (
    <div className="flex items-center justify-center w-10">
      <div className={`relative flex items-center ${isHighLatency ? 'opacity-50' : 'opacity-80'}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full bg-blue-500 animate-ping ${isHighLatency ? 'animate-pulse-opacity' : 'animate-ping'}`} />
        </div>
        <ArrowRight size={16} className={`text-blue-500 ${isHighLatency ? '' : 'animate-pulse-opacity'}`} />
      </div>
    </div>
  );
};

export default CloudLatencyConnection;
