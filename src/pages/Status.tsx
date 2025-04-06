
import React, { useState } from 'react';
import { useProviderStatus } from '@/hooks/useProviderStatus';
import NetworkHeader from '@/components/network/NetworkHeader';
import NetworkFooter from '@/components/network/NetworkFooter';
import StatusSummary from '@/components/status/StatusSummary';
import ProviderStatusCard from '@/components/status/ProviderStatusCard';
import { StatusLoading, StatusError } from '@/components/status/StatusStates';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Status: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, isLoading, error } = useProviderStatus();
  
  // Filter providers based on search term
  const filteredProviders = data?.filter(provider => 
    provider.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.networks.some(network => 
      network.network.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const lastUpdated = data && data[0]?.networks[0]?.status.last_updated
    ? new Date(data[0].networks[0].status.last_updated).toLocaleString()
    : 'Unknown';
  
  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <NetworkHeader darkMode={darkMode} setDarkMode={setDarkMode} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Platform Status</h1>
            <p className="text-muted-foreground">
              Real-time operational status of blockchain RPC providers.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastUpdated}
            </p>
          </div>
          
          {isLoading ? (
            <StatusLoading />
          ) : error ? (
            <StatusError error={(error as Error).message} />
          ) : data ? (
            <>
              <StatusSummary data={data} />
              
              <div className="mb-8 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  className="pl-10"
                  placeholder="Search by provider or network..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders?.map((provider) => (
                  <ProviderStatusCard
                    key={provider.provider}
                    provider={provider.provider}
                    networks={provider.networks}
                  />
                ))}
              </div>
              
              {filteredProviders?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No providers match your search.</p>
                </div>
              )}
            </>
          ) : null}
        </main>
        
        <NetworkFooter />
      </div>
    </div>
  );
};

export default Status;
