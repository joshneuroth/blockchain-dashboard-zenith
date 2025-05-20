import React from "react";
import { Check, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ServiceEvent } from "@/lib/eventsApi";

interface EventFilterProps {
  events: ServiceEvent[];
  selectedStatuses: string[];
  selectedProviders: string[];
  selectedChains: string[];
  onStatusChange: (statuses: string[]) => void;
  onProviderChange: (providers: string[]) => void;
  onChainChange: (chains: string[]) => void;
}

const EventFilter: React.FC<EventFilterProps> = ({
  events,
  selectedStatuses,
  selectedProviders,
  selectedChains,
  onStatusChange,
  onProviderChange,
  onChainChange
}) => {
  // Get unique providers and chains
  const providers = Array.from(new Set(events.map(event => event.provider)));
  const chains = Array.from(new Set(events.map(event => event.chain)));
  const statuses = ['active', 'resolved'];

  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const toggleProvider = (provider: string) => {
    if (selectedProviders.includes(provider)) {
      onProviderChange(selectedProviders.filter(p => p !== provider));
    } else {
      onProviderChange([...selectedProviders, provider]);
    }
  };

  const toggleChain = (chain: string) => {
    if (selectedChains.includes(chain)) {
      onChainChange(selectedChains.filter(c => c !== chain));
    } else {
      onChainChange([...selectedChains, chain]);
    }
  };

  const activeFiltersCount = 
    (selectedStatuses.length > 0 ? 1 : 0) +
    (selectedProviders.length > 0 ? 1 : 0) +
    (selectedChains.length > 0 ? 1 : 0);

  return (
    <div className="mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          {statuses.map(status => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={selectedStatuses.includes(status)}
              onCheckedChange={() => toggleStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </DropdownMenuCheckboxItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Providers</DropdownMenuLabel>
          {providers.map(provider => (
            <DropdownMenuCheckboxItem
              key={provider}
              checked={selectedProviders.includes(provider)}
              onCheckedChange={() => toggleProvider(provider)}
            >
              {provider}
            </DropdownMenuCheckboxItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Chains</DropdownMenuLabel>
          {chains.map(chain => (
            <DropdownMenuCheckboxItem
              key={chain}
              checked={selectedChains.includes(chain)}
              onCheckedChange={() => toggleChain(chain)}
            >
              {chain}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default EventFilter;
