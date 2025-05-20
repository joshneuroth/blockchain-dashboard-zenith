
import React from "react";
import { AlertTriangle, ArrowUp, Filter, TrendingDown } from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EventFilterProps {
  events: ServiceEvent[];
  selectedStatuses: string[];
  selectedProviders: string[];
  selectedChains: string[];
  selectedTypes: string[];
  onStatusChange: (statuses: string[]) => void;
  onProviderChange: (providers: string[]) => void;
  onChainChange: (chains: string[]) => void;
  onTypeChange: (types: string[]) => void;
}

const EventFilter: React.FC<EventFilterProps> = ({
  events,
  selectedStatuses,
  selectedProviders,
  selectedChains,
  selectedTypes,
  onStatusChange,
  onProviderChange,
  onChainChange,
  onTypeChange
}) => {
  // Get unique providers and chains
  const providers = Array.from(new Set(events.map(event => event.provider)));
  const chains = Array.from(new Set(events.map(event => event.chain)));
  const statuses = ['active', 'resolved'];
  // Define event types
  const types = [
    { id: 'high_latency', label: 'High Latency', icon: <ArrowUp size={14} /> },
    { id: 'height_stagnation', label: 'Block Height Stagnation', icon: <TrendingDown size={14} /> },
    { id: 'provider_error', label: 'Provider Error', icon: <AlertTriangle size={14} /> }
  ];

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

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  };

  const activeFiltersCount = 
    (selectedStatuses.length > 0 ? 1 : 0) +
    (selectedProviders.length > 0 ? 1 : 0) +
    (selectedChains.length > 0 ? 1 : 0) +
    (selectedTypes.length > 0 ? 1 : 0);

  return (
    <div className="mb-6 space-y-4">
      {/* Type filter toggle group */}
      <div>
        <div className="text-sm font-medium mb-2">Filter by type:</div>
        <ToggleGroup type="multiple" className="justify-start flex-wrap gap-2">
          {types.map(type => (
            <ToggleGroupItem
              key={type.id}
              value={type.id}
              aria-label={type.label}
              className="flex items-center gap-1 text-xs h-8 px-2"
              pressed={selectedTypes.includes(type.id)}
              onClick={() => toggleType(type.id)}
            >
              {type.icon}
              <span>{type.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Status quick filter tabs */}
        <Tabs 
          defaultValue="all" 
          onValueChange={(value) => {
            if (value === "all") {
              onStatusChange([]);
            } else {
              onStatusChange([value]);
            }
          }}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Advanced filters */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter size={16} />
              <span>More Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Providers</DropdownMenuLabel>
            {providers.length > 0 ? (
              providers.map(provider => (
                <DropdownMenuCheckboxItem
                  key={provider}
                  checked={selectedProviders.includes(provider)}
                  onCheckedChange={() => toggleProvider(provider)}
                >
                  {provider}
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <div className="px-2 py-1 text-sm text-muted-foreground">No providers available</div>
            )}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>Chains</DropdownMenuLabel>
            {chains.length > 0 ? (
              chains.map(chain => (
                <DropdownMenuCheckboxItem
                  key={chain}
                  checked={selectedChains.includes(chain)}
                  onCheckedChange={() => toggleChain(chain)}
                >
                  {chain}
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <div className="px-2 py-1 text-sm text-muted-foreground">No chains available</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default EventFilter;
