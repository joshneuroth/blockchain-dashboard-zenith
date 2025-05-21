import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BlockchainCard from '@/components/BlockchainCard';
import NewsletterForm from '@/components/NewsletterForm';
import { NETWORKS } from '@/lib/api';
import { Link } from 'react-router-dom';
import NetworkHeader from '@/components/network/NetworkHeader';
import MobileNetworkSelector from '@/components/network/MobileNetworkSelector';
import NetworkFooter from '@/components/network/NetworkFooter';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState<string | null>(null);
  const location = useLocation();
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts.length > 1 && pathParts[1] !== '') {
      setActiveNetwork(pathParts[1]);
    } else {
      setActiveNetwork(null);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <NetworkHeader darkMode={darkMode} setDarkMode={setDarkMode} />
      <MobileNetworkSelector />
      
      <section className="w-full py-16 px-6 md:px-10 animate-slide-in">
        <div className="container mx-auto max-w-4xl">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Experience <span className="font-extralight font-mono">TRANSPARENCY</span>
              <br />With Blockheight
            </h1>
            
            <div className="flex my-8">
              <div>
                <div className="text-xs text-gray-500 font-mono mb-1">WHAT IS BLOCK HEIGHT?</div>
                <div className="text-sm max-w-md">
                  This is a blockchain monitoring dashboard called "blockheight.xyz" that provides real-time transparency 
                  and monitoring of various blockchain networks across different RPC endpoints.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="flex-grow w-full px-6 md:px-10">
        <div className="container mx-auto max-w-4xl">
          {Object.entries(NETWORKS).map(([id, network]) => (
            <BlockchainCard
              key={id}
              networkId={id}
              networkName={network.name}
              networkColor={network.color}
            />
          ))}
        </div>
      </section>
      
      <NetworkFooter />
    </div>
  );
};

export default Index;
