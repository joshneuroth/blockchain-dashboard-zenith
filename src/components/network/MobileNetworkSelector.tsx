
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { NETWORKS } from '@/lib/api';

const MobileNetworkSelector: React.FC = () => {
  const { networkId } = useParams();
  
  return (
    <div className="md:hidden p-4 overflow-x-auto">
      <div className="blockchain-tabs flex">
        {Object.entries(NETWORKS).map(([id, network]) => (
          <Link
            key={id}
            to={`/${id}`}
            className={`blockchain-tab ${networkId === id ? 'active' : ''} whitespace-nowrap`}
          >
            {network.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNetworkSelector;
