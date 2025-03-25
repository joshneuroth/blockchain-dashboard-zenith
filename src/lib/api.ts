// Networks and their RPC endpoints
export const NETWORKS = {
  ethereum: {
    name: "Ethereum",
    rpcs: [
      { url: "https://eth.llamarpc.com", name: "LlamaRPC" },
      { url: "https://rpc.flashbots.net", name: "Flashbots" }
    ],
    color: "ethereum"
  },
  polygon: {
    name: "Polygon",
    rpcs: [
      { url: "https://polygon.llamarpc.com", name: "LlamaRPC" },
      { url: "https://polygon-rpc.com", name: "Polygon" }
    ],
    color: "polygon"
  },
  avalanche: {
    name: "Avalanche",
    rpcs: [
      { url: "https://api.avax.network/ext/bc/C/rpc", name: "Avalanche" },
      { url: "https://rpc.ankr.com/avalanche", name: "Ankr" }
    ],
    color: "avalanche"
  },
  solana: {
    name: "Solana",
    rpcs: [
      { url: "https://api.mainnet-beta.solana.com", name: "Solana" },
      { url: "https://solana-api.projectserum.com", name: "Serum" }
    ],
    color: "solana"
  },
  binance: {
    name: "Binance Chain",
    rpcs: [
      { url: "https://bsc-dataseed.binance.org", name: "Binance" },
      { url: "https://bsc-dataseed1.defibit.io", name: "Defibit" }
    ],
    color: "binance"
  }
};

// Type definitions
export interface BlockData {
  height: string;
  timestamp: number;
  provider: string;
}

export interface NetworkData {
  lastBlock: BlockData | null;
  blockHistory: Array<{
    height: string;
    timestamp: number;
    timeDiff: number;
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
                      rpcUrl.includes("solana-api") ? "Serum" :
                      rpcUrl.includes("solana") ? "Solana" :
                      rpcUrl.includes("defibit") ? "Defibit" :
                      rpcUrl.includes("binance") ? "Binance" : "Unknown";
  
  try {
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
    });

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

    return {
      height: blockHeight,
      timestamp: Date.now(),
      provider: providerName
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
