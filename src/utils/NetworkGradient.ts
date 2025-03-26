
export const getNetworkGradient = (networkId: string | undefined, darkMode: boolean): string => {
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

export const getTextColorClass = (networkId: string | undefined, darkMode: boolean): string => {
  if (darkMode) return 'text-white'; // In dark mode, always use white text
  
  switch(networkId) {
    case 'ethereum': return 'text-gray-900';
    case 'polygon': return 'text-white';
    case 'avalanche': return 'text-white';
    case 'binance': return 'text-gray-900';
    default: return 'text-gray-900';
  }
};
