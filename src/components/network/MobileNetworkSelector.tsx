
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { NETWORKS } from '@/lib/api';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MobileNetworkSelector: React.FC = () => {
  const { networkId } = useParams();
  
  // Main networks to display directly in the mobile selector
  const mainNetworks = ['ethereum', 'polygon', 'avalanche', 'binance'];
  
  // Additional networks for the dropdown
  const additionalNetworks = Object.entries(NETWORKS)
    .filter(([id]) => !mainNetworks.includes(id));
  
  return (
    <div className="md:hidden p-4 overflow-x-auto">
      <div className="blockchain-tabs flex">
        {mainNetworks.map(id => (
          <Link
            key={id}
            to={`/${id}`}
            className={`blockchain-tab ${networkId === id ? 'active' : ''} whitespace-nowrap`}
          >
            {NETWORKS[id].name}
          </Link>
        ))}
        
        {additionalNetworks.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="blockchain-tab flex items-center whitespace-nowrap">
              <MoreHorizontal size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border border-gray-200 dark:border-gray-800">
              {additionalNetworks.map(([id, network]) => (
                <DropdownMenuItem key={id} asChild>
                  <Link
                    to={`/${id}`}
                    className={`w-full px-2 py-1.5 ${networkId === id ? 'font-semibold' : ''}`}
                  >
                    {network.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default MobileNetworkSelector;
