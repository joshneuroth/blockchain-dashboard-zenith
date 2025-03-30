
// Process providers data and create status map
export const processProviderStatusMap = (providers: { [key: string]: any }) => {
  // Determine the highest block
  const blockHeights = Object.values(providers).map(p => BigInt(p.height));
  const highestBlockHeight = blockHeights.length > 0 
    ? blockHeights.reduce((max, h) => h > max ? h : max).toString()
    : "0";
  
  const providerStatusMap: {
    [key: string]: {
      height: string;
      endpoint: string;
      status: 'synced' | 'behind' | 'far-behind';
      blocksBehind: number;
    }
  } = {};
  
  // Process each provider and determine its status relative to the highest block
  Object.entries(providers).forEach(([name, providerData]) => {
    const currentHeight = BigInt(providerData.height);
    const highestHeight = BigInt(highestBlockHeight);
    const blocksBehind = Number(highestHeight - currentHeight);
    
    let status: 'synced' | 'behind' | 'far-behind' = 'synced';
    if (blocksBehind > 0) {
      status = blocksBehind === 1 ? 'behind' : 'far-behind';
    }
    
    providerStatusMap[name] = {
      height: providerData.height,
      endpoint: providerData.endpoint,
      status,
      blocksBehind
    };
  });
  
  return providerStatusMap;
};
