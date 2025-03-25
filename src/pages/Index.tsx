
import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import BlockchainCard from '@/components/BlockchainCard';
import NewsletterForm from '@/components/NewsletterForm';
import { NETWORKS } from '@/lib/api';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState<string | null>(null);
  
  // Handle dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Set initial active network
  useEffect(() => {
    setActiveNetwork('ethereum');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="w-full py-4 px-6 md:px-10 border-b border-gray-200 dark:border-gray-800 glass-effect">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-lg md:text-xl font-bold">
              blockheight<span className="text-gray-500">.xyz</span>
            </h1>
            
            <div className="ml-8 blockchain-tabs hidden md:flex">
              {Object.entries(NETWORKS).map(([id, network]) => (
                <button
                  key={id}
                  onClick={() => setActiveNetwork(id)}
                  className={`blockchain-tab ${activeNetwork === id ? 'active' : ''}`}
                >
                  {network.name}
                </button>
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
            <button
              key={id}
              onClick={() => setActiveNetwork(id)}
              className={`blockchain-tab ${activeNetwork === id ? 'active' : ''} whitespace-nowrap`}
            >
              {network.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="w-full py-16 px-6 md:px-10 animate-slide-in">
        <div className="container mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Experience <span className="font-extralight">TRANSPARENCY</span>
              <br />With Blockheight
            </h1>
            
            <div className="flex my-8">
              <div className="mr-8">
                <div className="text-xs text-gray-500 mb-1">WHAT IS BLOCK HEIGHT?</div>
                <div className="text-sm max-w-md">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore 
                  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo 
                  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Blockchain Cards */}
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
      
      {/* Footer */}
      <footer className="w-full py-8 px-6 md:px-10 mt-12 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <h2 className="text-lg font-bold mb-4">
                blockheight<span className="text-gray-500">.xyz</span>
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
