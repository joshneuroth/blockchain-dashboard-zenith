
import React, { useState, useEffect } from 'react';
import { useServiceEvents } from '@/hooks/useServiceEvents';
import { Link, useLocation } from 'react-router-dom';
import NetworkHeader from '@/components/network/NetworkHeader';
import MobileNetworkSelector from '@/components/network/MobileNetworkSelector';
import NetworkFooter from '@/components/network/NetworkFooter';
import EventCard from '@/components/status/EventCard';
import EventFilter from '@/components/status/EventFilter';
import RefreshIndicator from '@/components/status/RefreshIndicator';
import { AlertTriangle } from 'lucide-react';
import { ServiceEvent } from '@/lib/eventsApi';

const Status = () => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // Fetch service events data with refresh state
  const { 
    data: events, 
    isLoading, 
    error, 
    secondsSinceRefresh 
  } = useServiceEvents(selectedTypes);
  
  console.log("Events loaded:", events.length, events);

  // Apply filters
  const filteredEvents = events.filter(event => {
    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(event.status);
    const providerMatch = selectedProviders.length === 0 || selectedProviders.includes(event.provider);
    const chainMatch = selectedChains.length === 0 || selectedChains.includes(event.chain);
    const typeMatch = selectedTypes.length === 0 || (event.type && selectedTypes.includes(event.type));
    return statusMatch && providerMatch && chainMatch && typeMatch;
  });

  // Get active incidents (not resolved)
  const activeIncidents = filteredEvents.filter(event => event.status === 'active');
  
  // Get resolved events
  const resolvedEvents = filteredEvents.filter(event => event.status === 'resolved');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="py-10 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading service events...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-10 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Error loading service events</p>
          <p className="text-muted-foreground mt-2">
            {error.message || "An unknown error occurred"}
          </p>
        </div>
      );
    }

    if (filteredEvents.length === 0) {
      return (
        <div className="py-10 text-center">
          <p className="text-lg font-medium">No service events found</p>
          <p className="text-muted-foreground mt-2">
            {events.length > 0 
              ? "Try adjusting your filters" 
              : "All providers are currently operating normally"}
          </p>
        </div>
      );
    }

    return (
      <>
        {activeIncidents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Active Incidents ({activeIncidents.length})
            </h2>
            <div>
              {activeIncidents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {resolvedEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Resolved Incidents ({resolvedEvents.length})
            </h2>
            <div>
              {resolvedEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <NetworkHeader darkMode={darkMode} setDarkMode={setDarkMode} />
      <MobileNetworkSelector />
      
      <section className="w-full py-16 px-6 md:px-10 animate-slide-in">
        <div className="container mx-auto max-w-4xl">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              RPC Provider <span className="font-extralight font-mono">STATUS</span>
            </h1>
            
            <div className="flex my-8">
              <div>
                <div className="text-xs text-gray-500 font-mono mb-1">SERVICE EVENTS</div>
                <div className="text-sm max-w-md">
                  Monitor service degradations and outages across blockchain RPC providers. 
                  Stay informed about the current status and historical incidents.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="flex-grow w-full px-6 md:px-10 mb-10">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <RefreshIndicator secondsSinceRefresh={secondsSinceRefresh} />
          </div>
          
          <EventFilter 
            events={events}
            selectedStatuses={selectedStatuses}
            selectedProviders={selectedProviders}
            selectedChains={selectedChains}
            selectedTypes={selectedTypes}
            onStatusChange={setSelectedStatuses}
            onProviderChange={setSelectedProviders}
            onChainChange={setSelectedChains}
            onTypeChange={setSelectedTypes}
          />
          
          {renderContent()}
        </div>
      </section>
      
      <NetworkFooter />
    </div>
  );
};

export default Status;
