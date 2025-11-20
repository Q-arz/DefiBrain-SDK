/**
 * Transaction Helper - Utilities for signing and sending transactions
 * 
 * Simple, powerful helpers for blockchain transactions
 */

import { WalletProvider } from './types';

export interface TransactionRequest {
  to: string;
  data: string;
  value?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: number;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  gasUsed: string;
  status: number;
  logs: any[];
}


/**
 * Transaction Helper - Sign and send transactions easily
 */
export class TransactionHelper {
  private provider: WalletProvider;
  private chainId: number;

  constructor(provider: WalletProvider, chainId: number = 1) {
    this.provider = provider;
    this.chainId = chainId;
  }

  /**
   * Sign and send a transaction
   * Simple one-liner to execute transactions
   */
  async signAndSend(tx: TransactionRequest): Promise<string> {
    try {
      // Get current account
      const accounts = await this.provider.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet connected. Please connect your wallet first.');
      }

      // Prepare transaction
      const transaction = {
        to: tx.to,
        data: tx.data,
        value: tx.value || '0x0',
        gas: tx.gasLimit || undefined,
        gasPrice: tx.gasPrice || undefined,
        maxFeePerGas: tx.maxFeePerGas || undefined,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas || undefined,
        nonce: tx.nonce || undefined,
      };

      // Remove undefined values
      Object.keys(transaction).forEach(key => {
        if (transaction[key as keyof typeof transaction] === undefined) {
          delete transaction[key as keyof typeof transaction];
        }
      });

      // Send transaction
      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [transaction],
      });

      return txHash;
    } catch (error: any) {
      throw new Error(`Transaction failed: ${error.message || error}`);
    }
  }

  /**
   * Wait for transaction confirmation
   * Simple way to wait for a transaction to be mined
   */
  async waitForConfirmation(
    txHash: string,
    confirmations: number = 1,
    timeout: number = 300000 // 5 minutes
  ): Promise<TransactionReceipt> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const receipt = await this.provider.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        });

        if (receipt && receipt.blockNumber) {
          // Check confirmations
          const currentBlock = await this.provider.request({
            method: 'eth_blockNumber',
          });
          const currentBlockNum = parseInt(currentBlock, 16);
          const receiptBlockNum = parseInt(receipt.blockNumber, 16);
          const confirmationsCount = currentBlockNum - receiptBlockNum;

          if (confirmationsCount >= confirmations) {
            return {
              transactionHash: receipt.transactionHash,
              blockNumber: receiptBlockNum,
              blockHash: receipt.blockHash,
              gasUsed: receipt.gasUsed,
              status: parseInt(receipt.status, 16),
              logs: receipt.logs || [],
            };
          }
        }
      } catch (error) {
        // Continue waiting
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error(`Transaction confirmation timeout after ${timeout}ms`);
  }

  /**
   * Sign and send, then wait for confirmation
   * Complete transaction flow in one call
   */
  async signSendAndWait(
    tx: TransactionRequest,
    confirmations: number = 1
  ): Promise<TransactionReceipt> {
    const txHash = await this.signAndSend(tx);
    return await this.waitForConfirmation(txHash, confirmations);
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(tx: TransactionRequest): Promise<string> {
    try {
      const gasEstimate = await this.provider.request({
        method: 'eth_estimateGas',
        params: [{
          to: tx.to,
          data: tx.data,
          value: tx.value || '0x0',
        }],
      });

      return gasEstimate;
    } catch (error: any) {
      throw new Error(`Gas estimation failed: ${error.message || error}`);
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.request({
        method: 'eth_gasPrice',
      });
      return gasPrice;
    } catch (error: any) {
      throw new Error(`Failed to get gas price: ${error.message || error}`);
    }
  }
}

