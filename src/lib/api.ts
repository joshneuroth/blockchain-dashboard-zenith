
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
  }
};

// Type definitions
export interface BlockData {
  height: string;
  timestamp: number;
  provider: string;
  endpoint: string;
  blockTime?: number;
  transactionCount?: number;
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
        blockTime?: number;
        transactionCount?: number;
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
    // Get latest block number
    const blockNumberResponse = await fetch(rpcUrl, {
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
      signal: AbortSignal.timeout(5000),
    });

    if (!blockNumberResponse.ok) {
      throw new Error(`HTTP error! status: ${blockNumberResponse.status}`);
    }

    const blockNumberData = await blockNumberResponse.json();
    
    if (blockNumberData.error) {
      throw new Error(blockNumberData.error.message || 'RPC error');
    }

    // Convert hex block number to decimal string
    const blockHeight = blockNumberData.result ? 
      BigInt(blockNumberData.result).toString() : 
      "0";
      
    // Get block details for the latest block
    const blockDetailsResponse = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: [blockNumberData.result, false],
        id: 2,
      }),
      signal: AbortSignal.timeout(5000),
    });
    
    let blockTime = null;
    let transactionCount = 0;
    
    if (blockDetailsResponse.ok) {
      const blockDetailsData = await blockDetailsResponse.json();
      if (blockDetailsData.result) {
        // Extract timestamp (in seconds) and convert to milliseconds
        blockTime = blockDetailsData.result.timestamp ? 
          parseInt(blockDetailsData.result.timestamp, 16) * 1000 : 
          null;
          
        // Get transaction count
        transactionCount = blockDetailsData.result.transactions ? 
          blockDetailsData.result.transactions.length : 
          0;
      }
    }

    return {
      height: blockHeight,
      timestamp: Date.now(),
      provider: providerName,
      endpoint: rpcUrl,
      blockTime,
      transactionCount
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
