/**
 * DefiBrain SDK - Public Open Source Client
 * 
 * This SDK makes HTTP calls to the DefiBrain Backend API.
 * The SDK is open source, but the backend contains proprietary optimization logic.
 */

import { retry, RetryOptions } from './utils/RetryHelper';
import { Interface, AbiCoder } from 'ethers';
import { getDefaultRouterAddress } from './config';
import { DeFiRouterABI } from './abis';
import type { TransactionRequest } from './utils/TransactionHelper';

export type ExecutionMode = "direct" | "managed";

export interface DefiBrainConfig {
  apiKey: string;
  apiUrl?: string;
  chainId?: number;
  retryOptions?: RetryOptions;
  mode?: ExecutionMode; // "direct" = direct to protocols, "managed" = through DeFiRouter contract
  routerAddress?: string; // Required when mode is "managed"
}

export interface OptimizeYieldRequest {
  asset: string;
  amount: string;
  strategy?: "max_yield" | "min_risk" | "balanced" | "low_gas";
  minAPR?: number;
  maxRisk?: "low" | "medium" | "high";
}

export interface OptimizeYieldResponse {
  protocol: string;
  action: string;
  params: Record<string, any>;
  estimatedAPR: number;
  estimatedGas: string;
  riskLevel: "low" | "medium" | "high";
  confidence: number;
  transaction?: {
    to: string;
    data: string;
    value?: string;
  };
}

export interface FindSwapRequest {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  slippage?: number;
  preferProtocol?: string;
  /**
   * Optional 1inch API key.
   * If provided, the backend will try to use 1inch for this request.
   * If omitted, 1inch will be skipped and fallbacks (Uniswap, Curve, etc.) will be used.
   */
  oneInchApiKey?: string;
}

export interface FindSwapResponse {
  protocol: string;
  route: {
    fromToken: string;
    toToken: string;
    amount: string;
    estimatedAmount: string;
    protocols: string[];
  };
  estimatedGas: string;
  transaction?: {
    to: string;
    data: string;
    value?: string;
  };
}

export interface ExecuteActionRequest<TParams = Record<string, any>> {
  protocol: string;
  action: string;
  params: TParams;
}

export interface ExecuteActionResponse {
  protocol: string;
  action: string;
  status?: "pending" | "confirmed" | "failed";
  /**
   * Optional transaction hash if the backend already executed something on-chain
   * (in most SDK flows this will be undefined and the dApp signs the tx).
   */
  transactionHash?: string;
  /**
   * Optional transaction payload to be signed by the user.
   */
  transaction?: TransactionRequest;
  /**
   * Allow backend to attach extra fields without breaking typings.
   */
  [key: string]: any;
}

export interface ExecuteBatchRequest<TParams = Record<string, any>> {
  actions: Array<{
    protocol: string;
    action: string;
    params: TParams;
  }>;
}

export interface ExecuteBatchResponse {
  status: "pending" | "confirmed" | "failed";
  /**
   * Transaction payload for the batch (to be signed by the user).
   */
  transaction?: TransactionRequest;
  /**
   * Optional transaction hash if the batch was already executed server‑side.
   */
  transactionHash?: string;
  results?: Array<{
    protocol: string;
    action: string;
    success: boolean;
    [key: string]: any;
  }>;
}

export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "down";
  version: string;
  protocols: string[];
  uptime: number;
}

export class DefiBrainClient {
  private apiKey: string;
  private apiUrl: string;
  private chainId: number;
  private retryOptions: RetryOptions;
  private mode: ExecutionMode;
  private routerAddress?: string;

  constructor(config: DefiBrainConfig) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl || "https://backend-production-a565a.up.railway.app/v1";
    this.chainId = config.chainId || 1;
    this.retryOptions = config.retryOptions || {};
    this.mode = config.mode || "direct";
    
    // Use provided routerAddress or default for chain
    this.routerAddress = config.routerAddress || getDefaultRouterAddress(this.chainId);

    // Validate managed mode
    if (this.mode === "managed" && !this.routerAddress) {
      throw new Error(
        `routerAddress is required when mode is 'managed'. ` +
        `No default router address found for chainId ${this.chainId}. ` +
        `Please provide routerAddress in config.`
      );
    }
  }

  /**
   * Optimize yield for an asset
   * Automatically finds the best protocol and strategy
   */
  async optimizeYield(
    request: OptimizeYieldRequest
  ): Promise<OptimizeYieldResponse> {
    return await retry(async () => {
      const response = await this.fetch("/optimize-yield", {
        method: "POST",
        body: JSON.stringify({
          ...request,
          chainId: this.chainId,
          // In 0.1.x optimizeYield is effectively treated as direct mode:
          // mode/routerAddress are sent only for forward compatibility.
          mode: this.mode,
          routerAddress: this.routerAddress,
        }),
      });

      if (!response.ok) {
        const error: any = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || error.message || "Failed to optimize yield");
      }

      const result = await response.json() as OptimizeYieldResponse;
      // In 0.1.x we do not rewrite the transaction for managed mode here.
      return result;
    }, this.retryOptions);
  }

  /**
   * Find optimal swap route
   */
  async findOptimalSwap(
    request: FindSwapRequest
  ): Promise<FindSwapResponse> {
    return await retry(async () => {
      const response = await this.fetch("/swap/optimal", {
        method: "POST",
        body: JSON.stringify({
          ...request,
          chainId: this.chainId,
        }),
      });

      if (!response.ok) {
        const error: any = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || error.message || "Failed to find optimal swap");
      }

      return await response.json() as FindSwapResponse;
    }, this.retryOptions);
  }

  /**
   * Execute an action on a specific protocol
   */
  async executeAction(
    request: ExecuteActionRequest
  ): Promise<ExecuteActionResponse> {
    const response = await this.fetch("/execute", {
      method: "POST",
      body: JSON.stringify({
        ...request,
        chainId: this.chainId,
        mode: this.mode,
        routerAddress: this.routerAddress,
      }),
    });

    if (!response.ok) {
      const error: any = await response.json();
      throw new Error(error.error?.message || error.message || "Failed to execute action");
    }

    return await response.json() as ExecuteActionResponse;
  }

  /**
   * Execute batch of actions in a single transaction (FASE 6)
   * Only works in managed mode
   */
  async executeBatch(
    request: ExecuteBatchRequest
  ): Promise<ExecuteBatchResponse> {
    if (this.mode !== "managed" || !this.routerAddress) {
      throw new Error("Batch execution requires managed mode with routerAddress");
    }

    const response = await this.fetch("/execute-batch", {
      method: "POST",
      body: JSON.stringify({
        ...request,
        chainId: this.chainId,
        mode: this.mode,
        routerAddress: this.routerAddress,
      }),
    });

    if (!response.ok) {
      const error: any = await response.json();
      throw new Error(error.error?.message || error.message || "Failed to execute batch");
    }

    const result = await response.json() as ExecuteBatchResponse;
    
    // If managed mode, transaction already points to router
    return result;
  }

  /**
   * Get available protocols for an action
   */
  async getAvailableProtocols(action: string): Promise<string[]> {
    const response = await this.fetch(
      `/protocols/available?action=${action}&chainId=${this.chainId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      const error: any = await response.json();
      throw new Error(error.error?.message || error.message || "Failed to get protocols");
    }

    const data: any = await response.json();
    return data.protocols as string[];
  }

  /**
   * Get health status of the API
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await this.fetch("/health", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Health check failed");
    }

    return await response.json() as HealthCheckResponse;
  }

  /**
   * Get user's API usage statistics
   */
  async getUsageStats(): Promise<{
    callsToday: number;
    callsThisMonth: number;
    limit: number;
    resetDate: string;
  }> {
    const response = await this.fetch("/usage", {
      method: "GET",
    });

    if (!response.ok) {
      const error: any = await response.json();
      throw new Error(error.error?.message || error.message || "Failed to get usage stats");
    }

    const data: any = await response.json();
    return {
      callsToday: data.stats?.callsToday || data.stats?.requestsToday || 0,
      callsThisMonth: data.stats?.callsThisMonth || data.stats?.requestsThisMonth || 0,
      limit: data.stats?.limit || 100,
      resetDate: data.stats?.resetDate || new Date().toISOString(),
    };
  }

  /**
   * Internal fetch method with authentication
   */
  private async fetch(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  /**
   * Get chain ID
   */
  getChainId(): number {
    return this.chainId;
  }

  /**
   * Set chain ID
   */
  setChainId(chainId: number): void {
    this.chainId = chainId;
  }

  /**
   * Get execution mode
   */
  getMode(): ExecutionMode {
    return this.mode;
  }

  /**
   * Set execution mode
   */
  setMode(mode: ExecutionMode, routerAddress?: string): void {
    if (mode === "managed" && !routerAddress) {
      throw new Error("routerAddress is required when mode is 'managed'");
    }
    this.mode = mode;
    this.routerAddress = routerAddress;
  }

  /**
   * Build transaction data for managed mode (through DeFiRouter)
   */
  private buildManagedTransaction(
    protocol: string,
    action: string,
    params: Record<string, any>
  ): { to: string; data: string; value?: string } {
    if (!this.routerAddress) {
      throw new Error("routerAddress is required for managed mode");
    }

    // Encode params to bytes
    // This is a simplified version - in production, you'd use proper ABI encoding
    const paramsBytes = this.encodeParams(params);

    // Encode the executeAction call to DeFiRouter using the actual ABI
    const iface = new Interface(DeFiRouterABI);
    const data = iface.encodeFunctionData("executeAction", [protocol, action, paramsBytes]);

    return {
      to: this.routerAddress,
      data: data,
      value: "0",
    };
  }

  /**
   * Encode params to bytes (simplified - in production use proper ABI encoding)
   */
  private encodeParams(params: Record<string, any>): string {
    // For now, return empty bytes or use a simple encoding
    // In production, this should properly encode based on the action type
    try {
      const coder = AbiCoder.defaultAbiCoder();
      // This is a placeholder - actual encoding depends on the action
      // We encode the JSON string as bytes for now
      const jsonString = JSON.stringify(params);
      // Convert string to bytes using ethers
      const { toUtf8Bytes } = require("ethers");
      const bytes = toUtf8Bytes(jsonString);
      return coder.encode(["bytes"], [bytes]);
    } catch {
      return "0x";
    }
  }
}

