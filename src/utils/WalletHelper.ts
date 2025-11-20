/**
 * Wallet Helper - Utilities for wallet connection and management
 * 
 * Simple helpers for connecting wallets and getting balances
 */

import { WalletProvider } from './types';

export interface WalletInfo {
  address: string;
  chainId: number;
  isConnected: boolean;
  provider: string;
}

/**
 * Wallet Helper - Connect and manage wallets easily
 */
export class WalletHelper {
  private provider: WalletProvider | null = null;
  private chainId: number = 1;

  /**
   * Connect to MetaMask or injected wallet
   */
  async connect(): Promise<WalletInfo> {
    try {
      // Check if MetaMask is installed (browser environment)
      const windowObj = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' && (globalThis as any).window ? (globalThis as any).window : null);
      if (windowObj && (windowObj as any).ethereum) {
        this.provider = (windowObj as any).ethereum as WalletProvider;
      } else {
        throw new Error('No wallet found. Please install MetaMask or another Web3 wallet.');
      }

      // Request account access
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      // Get chain ID
      const chainIdHex = await this.provider.request({ method: 'eth_chainId' });
      this.chainId = parseInt(chainIdHex, 16);

      return {
        address: accounts[0],
        chainId: this.chainId,
        isConnected: true,
        provider: this.provider.isMetaMask ? 'MetaMask' : 'Injected',
      };
    } catch (error: any) {
      throw new Error(`Wallet connection failed: ${error.message || error}`);
    }
  }

  /**
   * Get current wallet info without requesting connection
   */
  async getWalletInfo(): Promise<WalletInfo | null> {
    try {
      const windowObj = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' && (globalThis as any).window ? (globalThis as any).window : null);
      if (!windowObj || !(windowObj as any).ethereum) {
        return null;
      }

      this.provider = (windowObj as any).ethereum as WalletProvider;
      const accounts = await this.provider.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        return null;
      }

      const chainIdHex = await this.provider.request({ method: 'eth_chainId' });
      this.chainId = parseInt(chainIdHex, 16);

      return {
        address: accounts[0],
        chainId: this.chainId,
        isConnected: true,
        provider: this.provider.isMetaMask ? 'MetaMask' : 'Injected',
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get balance of an address
   */
  async getBalance(address?: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Wallet not connected. Call connect() first.');
    }

    try {
      const targetAddress = address || (await this.getWalletInfo())?.address;
      if (!targetAddress) {
        throw new Error('No address provided and wallet not connected');
      }

      const balance = await this.provider.request({
        method: 'eth_getBalance',
        params: [targetAddress, 'latest'],
      });

      return balance;
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message || error}`);
    }
  }

  /**
   * Get ERC20 token balance
   */
  async getTokenBalance(tokenAddress: string, address?: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Wallet not connected. Call connect() first.');
    }

    try {
      const targetAddress = address || (await this.getWalletInfo())?.address;
      if (!targetAddress) {
        throw new Error('No address provided and wallet not connected');
      }

      // ERC20 balanceOf(address) function signature
      const balanceOfSignature = '0x70a08231';
      const addressParam = targetAddress.slice(2).padStart(64, '0');
      const data = balanceOfSignature + addressParam;

      const balance = await this.provider.request({
        method: 'eth_call',
        params: [
          {
            to: tokenAddress,
            data: data,
          },
          'latest',
        ],
      });

      return balance;
    } catch (error: any) {
      throw new Error(`Failed to get token balance: ${error.message || error}`);
    }
  }

  /**
   * Switch to a different network
   */
  async switchNetwork(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new Error('Wallet not connected. Call connect() first.');
    }

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      this.chainId = chainId;
    } catch (error: any) {
      // If chain doesn't exist, try to add it
      if (error.code === 4902) {
        throw new Error(`Network ${chainId} not found. Please add it to your wallet.`);
      }
      throw new Error(`Failed to switch network: ${error.message || error}`);
    }
  }

  /**
   * Listen to wallet account changes
   */
  onAccountChange(callback: (address: string) => void): () => void {
    if (!this.provider || !this.provider.on) {
      return () => {};
    }

    const handler = (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        callback(accounts[0]);
      }
    };

    this.provider.on('accountsChanged', handler);

    // Return cleanup function
    return () => {
      if (this.provider?.removeListener) {
        this.provider.removeListener('accountsChanged', handler);
      }
    };
  }

  /**
   * Listen to network changes
   */
  onNetworkChange(callback: (chainId: number) => void): () => void {
    if (!this.provider || !this.provider.on) {
      return () => {};
    }

    const handler = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      this.chainId = chainId;
      callback(chainId);
    };

    this.provider.on('chainChanged', handler);

    // Return cleanup function
    return () => {
      if (this.provider?.removeListener) {
        this.provider.removeListener('chainChanged', handler);
      }
    };
  }

  /**
   * Get the provider instance
   */
  getProvider(): WalletProvider | null {
    return this.provider;
  }

  /**
   * Get current chain ID
   */
  getChainId(): number {
    return this.chainId;
  }
}

