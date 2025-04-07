import React, { useState, useEffect } from 'react';
import { Moon, Sun, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import BlockchainCard from '@/components/BlockchainCard';
import NewsletterForm from '@/components/NewsletterForm';
import { NETWORKS } from '@/lib/api';
import LeaderboardExplorer from '@/components/leaderboard/LeaderboardExplorer';

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

  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <header className="w-full py-4 px-6 md:px-10 border-b border-gray-200 dark:border-gray-800 glass-effect">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-lg md:text-xl font-bold">
              blockheight<span className="text-gray-500 font-mono">.xyz</span>
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
                  className={`blockchain-tab ${activeNetwork === id ? 'active' : ''}`}
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
      
      <div className="md:hidden p-4 overflow-x-auto">
        <div className="blockchain-tabs flex">
          {Object.entries(NETWORKS).map(([id, network]) => (
            <Link
              key={id}
              to={`/${id}`}
              className={`blockchain-tab ${activeNetwork === id ? 'active' : ''} whitespace-nowrap`}
            >
              {network.name}
            </Link>
          ))}
        </div>
      </div>
      
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
          
          <LeaderboardExplorer />
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
      
      <footer className="w-full py-8 px-6 md:px-10 mt-12 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <h2 className="text-lg font-bold mb-4">
                blockheight<span className="text-gray-500 font-mono">.xyz</span>
              </h2>
              <NewsletterForm />
            </div>
            
            <div className="col-span-1">
              <h3 className="text-sm font-semibold mb-4">BLOCKHEIGHT.XYZ</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:underline">About Us</a></li>
                <li><a href="#" className="hover:underline">Mission</a></li>
                <li><a href="#" className="hover:underline">Blog</a></li>
                <li><a href="#" className="hover:underline">Press & Media</a></li>
              </ul>
            </div>
            
            <div className="col-span-1">
              <h3 className="text-sm font-semibold mb-4">FOLLOW US</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:underline">Twitter</a></li>
                <li><a href="#" className="hover:underline">LinkedIn</a></li>
                <li><a href="#" className="hover:underline">Instagram</a></li>
              </ul>
            </div>
            
            <div className="col-span-1">
              <h3 className="text-sm font-semibold mb-4">SUPPORT</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:underline">Contact Us</a></li>
                <li><a href="#" className="hover:underline">FAQ</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} blockheight.xyz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
