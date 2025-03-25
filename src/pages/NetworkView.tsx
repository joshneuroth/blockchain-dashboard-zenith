
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { NETWORKS } from '@/lib/api';
import BlockchainCard from '@/components/BlockchainCard';
import { Moon, Sun, Home } from 'lucide-react';

const NetworkView = () => {
  const { networkId } = useParams();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  
  // Handle dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Find the network details from the NETWORKS object
  const network = networkId && NETWORKS[networkId as keyof typeof NETWORKS];
  
  // Check if we're on the home/index page
  const isHomePage = location.pathname === '/';

  if (!network) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Network Not Found</h1>
          <p className="mb-6">The network "{networkId}" was not found.</p>
          <a href="/" className="inline-block bg-blue-500 text-white px-4 py-2 rounded">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="w-full py-4 px-6 md:px-10 border-b border-gray-200 dark:border-gray-800 glass-effect">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-lg md:text-xl font-bold">
              blockheight<span className="text-gray-500">.xyz</span>
            </h1>
            
            <Link 
              to="/" 
              className={`ml-4 p-2 rounded-full transition-colors ${
                isHomePage 
                  ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              aria-label="Home"
            >
              <Home size={20} />
            </Link>
            
            <div className="ml-4 blockchain-tabs hidden md:flex">
              {Object.entries(NETWORKS).map(([id, network]) => (
                <Link
                  key={id}
                  to={`/${id}`}
                  className={`blockchain-tab ${networkId === id ? 'active' : ''}`}
                >
                  {network.name}
                </Link>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>
      
      {/* Mobile Network Selection */}
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

      <div className="w-full py-16 px-6 md:px-10">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-8">
            {network.name} <span className="font-extralight">Monitoring</span>
          </h1>
          
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-400">
              Detailed monitoring for {network.name} network. More metrics and analytics coming soon.
            </p>
          </div>
          
          <BlockchainCard
            networkId={networkId as string}
            networkName={network.name}
            networkColor={network.color}
          />
          
          {/* Additional network metrics will be added here in the future */}
          <div className="glass-card p-6 mt-8">
            <h2 className="text-xl font-medium mb-4">Coming Soon</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Advanced metrics and analytics for {network.name} will be available here soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkView;
