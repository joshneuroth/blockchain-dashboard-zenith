// Networks and their RPC endpoints
export const NETWORKS = {
  ethereum: {
    name: "Ethereum",
    rpcs: [
      { url: "https://eth.llamarpc.com", name: "LlamaRPC" },
      { url: "https://rpc.flashbots.net", name: "Flashbots" },
      { url: "https://ethereum.publicnode.com", name: "PublicNode" },
      { url: "https://eth.meowrpc.com", name: "MeowRPC" },
      { url: "https://api.edennetwork.io/v1/rpc", name: "Eden Network" }
    ],
    color: "ethereum"
  },
  polygon: {
    name: "Polygon",
    rpcs: [
      { url: "https://polygon.llamarpc.com", name: "LlamaRPC" },
      { url: "https://polygon-rpc.com", name: "Polygon" },
      { url: "https://polygon.meowrpc.com", name: "MeowRPC" },
      { url: "https://polygon-bor.publicnode.com", name: "PublicNode" },
      { url: "https://polygon.api.onfinality.io/public", name: "OnFinality" }
    ],
    color: "polygon"
  },
  avalanche: {
    name: "Avalanche",
    rpcs: [
      { url: "https://api.avax.network/ext/bc/C/rpc", name: "Avalanche" },
      { url: "https://avalanche-c-chain.publicnode.com", name: "PublicNode" },
      { url: "https://avax.meowrpc.com", name: "MeowRPC" },
      { url: "https://avalanche.blockpi.network/v1/rpc/public", name: "BlockPI" },
      { url: "https://rpc.ankr.com/avalanche", name: "Ankr" }
    ],
    color: "avalanche"
  },
  binance: {
    name: "Binance Chain",
    rpcs: [
      { url: "https://bsc-dataseed.binance.org", name: "Binance" },
      { url: "https://bsc-dataseed1.defibit.io", name: "Defibit" },
      { url: "https://bsc.meowrpc.com", name: "MeowRPC" },
      { url: "https://bsc.publicnode.com", name: "PublicNode" },
      { url: "https://binance.blockpi.network/v1/rpc/public", name: "BlockPI" }
    ],
    color: "binance"
  },
  base: {
    name: "Base",
    rpcs: [
      { url: "https://mainnet.base.org", name: "Base" },
      { url: "https://base.publicnode.com", name: "PublicNode" },
      { url: "https://base.llamarpc.com", name: "LlamaRPC" },
      { url: "https://base.meowrpc.com", name: "MeowRPC" },
      { url: "https://base.blockpi.network/v1/rpc/public", name: "BlockPI" }
    ],
    color: "base"
  },
  optimism: {
    name: "Optimism",
    rpcs: [
      { url: "https://mainnet.optimism.io", name: "Optimism" },
      { url: "https://optimism.publicnode.com", name: "PublicNode" },
      { url: "https://optimism.llamarpc.com", name: "LlamaRPC" },
      { url: "https://optimism.meowrpc.com", name: "MeowRPC" },
      { url: "https://optimism.blockpi.network/v1/rpc/public", name: "BlockPI" }
    ],
    color: "optimism"
  },
  arbitrum: {
    name: "Arbitrum",
    rpcs: [
      { url: "https://arb1.arbitrum.io/rpc", name: "Arbitrum" },
      { url: "https://arbitrum.publicnode.com", name: "PublicNode" },
      { url: "https://arbitrum.llamarpc.com", name: "LlamaRPC" },
      { url: "https://arbitrum.meowrpc.com", name: "MeowRPC" },
      { url: "https://arbitrum.blockpi.network/v1/rpc/public", name: "BlockPI" }
    ],
    color: "arbitrum"
  }
};

// Type definitions
export interface BlockData {
  height: string;
  timestamp: number;
  provider: string;
  endpoint: string;
  latency?: number; // Added latency field
}

export interface NetworkData {
  lastBlock: BlockData | null;
  blockHistory: Array<{
    timestamp: number;
    providers: {
      [key: string]: {
        height: string;
        endpoint: string;
        status: 'synced' | 'behind' | 'far-behind';
        blocksBehind: number;
      }
    }
  }>;
  providers: {
    [key: string]: BlockData;
  };
  isLoading: boolean;
  error: string | null;
  blockTimeMetrics: {
    blocksPerMinute: number;
    lastCalculated: number;
  };
}

// Function to fetch real blockchain data from RPC endpoints
export const fetchBlockchainData = async (network: string, rpcUrl: string): Promise<BlockData> => {
  const providerName = rpcUrl.includes("llama") ? "LlamaRPC" : 
                      rpcUrl.includes("flashbots") ? "Flashbots" :
                      rpcUrl.includes("polygon-rpc") ? "Polygon" :
                      rpcUrl.includes("avax") ? "Avalanche" :
                      rpcUrl.includes("ankr") ? "Ankr" :
                      rpcUrl.includes("defibit") ? "Defibit" :
                      rpcUrl.includes("binance") ? "Binance" :
                      rpcUrl.includes("publicnode") ? "PublicNode" :
                      rpcUrl.includes("meowrpc") ? "MeowRPC" :
                      rpcUrl.includes("edennetwork") ? "Eden Network" :
                      rpcUrl.includes("blockpi") ? "BlockPI" :
                      rpcUrl.includes("onfinality") ? "OnFinality" : "Unknown";
  
  try {
    const startTime = performance.now(); // Start time measurement
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
      // Add a timeout to prevent hanging requests
      signal: AbortSignal.timeout(5000),
    });

    const endTime = performance.now(); // End time measurement
    const latency = Math.round(endTime - startTime); // Calculate latency

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'RPC error');
    }

    // Convert hex block number to decimal string
    const blockHeight = data.result ? 
      BigInt(data.result).toString() : 
      "0";
      
    // Store latency in local storage for use by the latency test
    const blockHeightLatencyKey = `blockheight-latency-${network}`;
    try {
      let latencyData: Record<string, any> = {};
      const existingData = localStorage.getItem(blockHeightLatencyKey);
      
      if (existingData) {
        latencyData = JSON.parse(existingData);
      }
      
      // Update with the latest latency reading
      latencyData[providerName] = {
        latency,
        endpoint: rpcUrl,
        timestamp: Date.now()
      };
      
      localStorage.setItem(blockHeightLatencyKey, JSON.stringify(latencyData));
      
      // Dispatch a storage event for the latency test to pick up
      window.dispatchEvent(new StorageEvent('storage', {
        key: blockHeightLatencyKey,
        newValue: JSON.stringify(latencyData)
      }));
    } catch (e) {
      console.error('Error storing latency data:', e);
    }

    return {
      height: blockHeight,
      timestamp: Date.now(),
      provider: providerName,
      endpoint: rpcUrl,
      latency: latency // Store the latency
    };
  } catch (error) {
    console.error(`Error fetching block data from ${rpcUrl}:`, error);
    throw error;
  }
};

// Format large numbers with commas
export const formatNumber = (num: string): string => {
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Format time difference in seconds
export const formatTimeDiff = (diff: number): string => {
  if (diff < 60) {
    return `${diff}s ago`;
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}m ago`;
  } else {
    return `${Math.floor(diff / 3600)}h ago`;
  }
};
