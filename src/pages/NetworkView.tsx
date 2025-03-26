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

  // Create network-specific gradient backgrounds
  const getNetworkGradient = () => {
    if (darkMode) {
      // Dark mode gradients
      switch(networkId) {
        case 'ethereum': 
          return 'bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900';
        case 'polygon': 
          return 'bg-gradient-to-br from-purple-900 to-indigo-900';
        case 'avalanche': 
          return 'bg-gradient-to-br from-red-900 to-gray-900';
        case 'binance': 
          return 'bg-gradient-to-br from-yellow-800 to-yellow-950';
        default: 
          return 'from-gray-900 to-gray-800';
      }
    } else {
      // Light mode gradients
      switch(networkId) {
        case 'ethereum': 
          return 'bg-gradient-to-br from-[#E0C7DE] via-[#89AFF5] to-[#CAF9F7]';
        case 'polygon': 
          return 'bg-gradient-to-br from-[#9945FF] to-[#993DBD]';
        case 'avalanche': 
          return 'bg-gradient-to-br from-[#E84142] to-[#221B1C]';
        case 'binance': 
          return 'bg-gradient-to-br from-[#ECBA3F] to-[#FEF6DB]';
        default: 
          return 'from-gray-50 to-gray-100';
      }
    }
  };

  // Set text color based on network for better contrast
  const getTextColorClass = () => {
    if (darkMode) return 'text-white'; // In dark mode, always use white text
    
    switch(networkId) {
      case 'ethereum': return 'text-gray-900';
      case 'polygon': return 'text-white';
      case 'avalanche': return 'text-white';
      case 'binance': return 'text-gray-900';
      default: return 'text-gray-900';
    }
  };

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
    <div className={`min-h-screen flex flex-col ${getNetworkGradient()} dark:from-gray-900 dark:to-gray-800 transition-colors duration-300`}>
      {/* Header */}
      <header className="w-full py-4 px-6 md:px-10 border-b border-gray-200 dark:border-gray-800 glass-effect">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            {/* Logo - using SVG */}
            <div className="h-8 w-auto">
              <svg width="180" height="32" viewBox="0 0 180 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full">
                <path d="M0 4C0 1.79086 1.79086 0 4 0H28C30.2091 0 32 1.79086 32 4V28C32 30.2091 30.2091 32 28 32H4C1.79086 32 0 30.2091 0 28V4Z" fill={darkMode ? "white" : "black"}/>
                <text x="16" y="22" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="bold" fill={darkMode ? "black" : "white"} textAnchor="middle">BH</text>
                <path d="M42 8.72H48.64C50.8267 8.72 52.48 9.18667 53.6 10.12C54.72 11.0533 55.28 12.44 55.28 14.28C55.28 16.12 54.72 17.5067 53.6 18.44C52.48 19.3733 50.8267 19.84 48.64 19.84H45.92V26H42V8.72ZM48.36 16.76C49.32 16.76 50.04 16.5733 50.52 16.2C51 15.8267 51.24 15.2 51.24 14.32C51.24 13.44 51 12.8133 50.52 12.44C50.04 12.0667 49.32 11.88 48.36 11.88H45.92V16.76H48.36ZM57.5497 8.72H61.4697V26H57.5497V8.72ZM64.7453 8.72H68.9053L74.9453 19.68H75.0253V8.72H78.9453V26H74.8253L68.7853 15.04H68.7053V26H64.7453V8.72ZM89.3297 26.32C87.6764 26.32 86.1964 26.08 84.8897 25.6C83.583 25.0933 82.5564 24.4133 81.8097 23.56L83.9697 20.96C84.6497 21.68 85.5297 22.2533 86.6097 22.68C87.7164 23.1067 88.8364 23.32 89.9697 23.32C91.103 23.32 91.9297 23.16 92.4497 22.84C92.9964 22.4933 93.2697 22.04 93.2697 21.48C93.2697 21.08 93.1364 20.7467 92.8697 20.48C92.603 20.2133 92.2297 20 91.7497 19.84C91.2964 19.6533 90.7897 19.5067 90.2297 19.4C89.6697 19.2667 89.103 19.1333 88.5297 19C87.9564 18.84 87.383 18.6533 86.8097 18.44C86.263 18.2267 85.7697 17.9467 85.3297 17.6C84.8897 17.2267 84.5297 16.76 84.2497 16.2C83.9964 15.64 83.8697 14.96 83.8697 14.16C83.8697 13.28 84.0764 12.48 84.4897 11.76C84.903 11.04 85.4764 10.44 86.2097 9.96C86.943 9.45333 87.7964 9.08 88.7697 8.84C89.7697 8.57333 90.8364 8.44 91.9697 8.44C93.4097 8.44 94.743 8.65333 95.9697 9.08C97.1964 9.50667 98.2097 10.0933 99.0097 10.84L97.0897 13.44C96.3697 12.8267 95.583 12.36 94.7297 12.04C93.903 11.6933 92.9964 11.52 92.0097 11.52C90.9297 11.52 90.1097 11.6933 89.5497 12.04C89.0164 12.36 88.7497 12.7867 88.7497 13.32C88.7497 13.7467 88.883 14.1067 89.1497 14.4C89.4164 14.6667 89.7764 14.8933 90.2297 15.08C90.7097 15.24 91.2297 15.3867 91.7897 15.52C92.3764 15.6267 92.9564 15.76 93.5297 15.92C94.103 16.0533 94.6697 16.2267 95.2297 16.44C95.8164 16.6267 96.3297 16.8933 96.7697 17.24C97.2364 17.56 97.6097 18 97.8897 18.56C98.1697 19.0933 98.3097 19.76 98.3097 20.56C98.3097 21.4133 98.103 22.2133 97.6897 22.96C97.2764 23.6533 96.6897 24.2533 95.9297 24.76C95.1964 25.24 94.3297 25.6133 93.3297 25.88C92.3297 26.1733 91.2697 26.32 90.1097 26.32H89.3297ZM101.094 8.72H105.014V16.56L112.254 8.72H117.054L109.934 16.4L117.414 26H112.694L107.574 19.24L105.014 21.92V26H101.094V8.72ZM121.774 8.72H125.694V22.72H133.934V26H121.774V8.72ZM144.343 26.32C142.743 26.32 141.289 26.0267 139.983 25.44C138.676 24.8267 137.556 24.0133 136.623 23C135.689 21.96 134.969 20.7733 134.463 19.44C133.983 18.08 133.743 16.64 133.743 15.12C133.743 13.5733 133.989 12.1333 134.483 10.8C134.976 9.44 135.689 8.26667 136.623 7.28C137.556 6.26667 138.683 5.46667 140.003 4.88C141.323 4.29333 142.783 4 144.383 4C145.983 4 147.443 4.29333 148.763 4.88C150.083 5.46667 151.203 6.28 152.123 7.32C153.069 8.33333 153.783 9.50667 154.263 10.84C154.743 12.1733 154.983 13.5867 154.983 15.08C154.983 16.6267 154.736 18.08 154.243 19.44C153.776 20.7733 153.069 21.96 152.123 23C151.203 24.0133 150.083 24.8267 148.763 25.44C147.443 26.0267 145.969 26.32 144.343 26.32ZM144.363 22.4C145.256 22.4 146.063 22.24 146.783 21.92C147.503 21.5733 148.109 21.1067 148.603 20.52C149.123 19.9067 149.516 19.2 149.783 18.4C150.076 17.5733 150.223 16.6933 150.223 15.76V14.48C150.223 13.5467 150.076 12.6667 149.783 11.84C149.516 11.0133 149.123 10.3067 148.603 9.72C148.109 9.10667 147.503 8.64 146.783 8.32C146.063 7.97333 145.269 7.8 144.403 7.8C143.509 7.8 142.703 7.97333 141.983 8.32C141.263 8.64 140.643 9.10667 140.123 9.72C139.629 10.3067 139.236 11.0133 138.943 11.84C138.676 12.6667 138.543 13.5467 138.543 14.48V15.76C138.543 16.6933 138.676 17.5733 138.943 18.4C139.236 19.2 139.629 19.9067 140.123 20.52C140.643 21.1067 141.263 21.5733 141.983 21.92C142.703 22.24 143.496 22.4 144.363 22.4ZM158.343 8.72H169.623V11.92H162.263V15.8H168.863V19H162.263V22.8H169.823V26H158.343V8.72ZM172.38 8.72H174.94L175.06 11.48C175.513 10.6267 176.14 9.94667 176.94 9.44C177.767 8.93333 178.7 8.68 179.74 8.68V12.92C179.54 12.92 179.347 12.92 179.16 12.92C178.974 12.92 178.78 12.92 178.58 12.92C177.7 12.92 176.954 13.16 176.34 13.64C175.754 14.0933 175.46 14.8533 175.46 15.92V26H171.54V8.72H172.38Z" fill={darkMode ? "white" : "black"}/>
                <path d="M176.44 22.6667C176.44 23.7713 175.544 24.6667 174.44 24.6667C173.335 24.6667 172.44 23.7713 172.44 22.6667C172.44 21.562 173.335 20.6667 174.44 20.6667C175.544 20.6667 176.44 21.562 176.44 22.6667Z" fill={darkMode ? "white" : "black"}/>
              </svg>
            </div>
            
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
          <h1 className={`text-4xl md:text-6xl font-bold mb-8 ${getTextColorClass()}`}>
            {network.name} <span className="font-extralight">Monitoring</span>
          </h1>
          
          <div className="mb-8">
            <p className={`${getTextColorClass()} opacity-80`}>
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

