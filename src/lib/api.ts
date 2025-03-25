
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
}

// Mock function to fetch blockchain data (in a real app this would make actual RPC calls)
export const fetchBlockchainData = async (network: string, rpcUrl: string): Promise<BlockData> => {
  // In a real implementation, this would make an actual fetch to the blockchain RPC
  // For this demo, we'll simulate responses with random but realistic data
  
  // Simulate network request delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Randomly generate a block height (would be fetched from blockchain in real app)
  const baseHeight = 17897000;
  const randomOffset = Math.floor(Math.random() * 1000);
  const height = (baseHeight + randomOffset).toString();
  
  // Get current timestamp
  const timestamp = Date.now();
  
  // Extract provider name from URL
  const provider = rpcUrl.includes("llama") ? "LlamaRPC" : 
                  rpcUrl.includes("flashbots") ? "Flashbots" :
                  rpcUrl.includes("polygon-rpc") ? "Polygon" :
                  rpcUrl.includes("avax") ? "Avalanche" :
                  rpcUrl.includes("ankr") ? "Ankr" :
                  rpcUrl.includes("solana-api") ? "Serum" :
                  rpcUrl.includes("solana") ? "Solana" :
                  rpcUrl.includes("defibit") ? "Defibit" :
                  rpcUrl.includes("binance") ? "Binance" : "Unknown";
  
  // Simulate occasional errors
  if (Math.random() < 0.05) {
    throw new Error(`Failed to fetch data from ${provider}`);
  }
  
  return {
    height,
    timestamp,
    provider
  };
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
