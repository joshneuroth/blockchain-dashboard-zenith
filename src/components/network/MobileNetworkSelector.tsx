
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { NETWORKS } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MobileNetworkSelector: React.FC = () => {
  const { networkId } = useParams();
  
  // Define main networks to show in the mobile selector
  const mainNetworks = Object.entries(NETWORKS).slice(0, 4);
  // Define additional networks for the dropdown
  const additionalNetworks = Object.entries(NETWORKS).slice(4);
  
  return (
    <div className="md:hidden p-4 overflow-x-auto">
      <div className="blockchain-tabs flex">
        {mainNetworks.map(([id, network]) => (
          <Link
            key={id}
            to={`/${id}`}
            className={`blockchain-tab ${networkId === id ? 'active' : ''} whitespace-nowrap`}
          >
            {network.name}
          </Link>
        ))}
        
        {additionalNetworks.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="blockchain-tab flex items-center whitespace-nowrap">
              <MoreHorizontal size={18} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {additionalNetworks.map(([id, network]) => (
                <DropdownMenuItem key={id} asChild>
                  <Link
                    to={`/${id}`}
                    className={`w-full px-4 py-2 text-sm ${
                      networkId === id 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
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
