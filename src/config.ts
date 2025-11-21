/**
 * DefiBrain SDK Configuration
 * 
 * Default router addresses by network
 */

export const ROUTER_ADDRESSES: Record<number, string> = {
  // Mainnet
  1: "", // To be set after mainnet deployment
  
  // Sepolia Testnet
  11155111: "0xFa907c9ca64B72420f04AFFa4e70619991C6c6e2",
  
  // Arbitrum
  42161: "", // To be set after deployment
  
  // Polygon
  137: "", // To be set after deployment
};

/**
 * Get default router address for a chain
 */
export function getDefaultRouterAddress(chainId: number): string | undefined {
  return ROUTER_ADDRESSES[chainId];
}

