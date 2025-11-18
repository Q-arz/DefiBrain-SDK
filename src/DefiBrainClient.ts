/**
 * DefiBrain SDK - Public Open Source Client
 * 
 * This SDK makes HTTP calls to the DefiBrain Backend API.
 * The SDK is open source, but the backend contains proprietary optimization logic.
 */

export interface DefiBrainConfig {
  apiKey: string;
  apiUrl?: string;
  chainId?: number;
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

export interface ExecuteActionRequest {
  protocol: string;
  action: string;
  params: Record<string, any>;
}

export interface ExecuteActionResponse {
  transactionHash: string;
  protocol: string;
  action: string;
  status: "pending" | "confirmed" | "failed";
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

  constructor(config: DefiBrainConfig) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl || "https://backend-production-a565a.up.railway.app/v1";
    this.chainId = config.chainId || 1;
  }

  /**
   * Optimize yield for an asset
   * Automatically finds the best protocol and strategy
   */
  async optimizeYield(
    request: OptimizeYieldRequest
  ): Promise<OptimizeYieldResponse> {
    const response = await this.fetch("/optimize-yield", {
      method: "POST",
      body: JSON.stringify({
        ...request,
        chainId: this.chainId,
      }),
    });

    if (!response.ok) {
      const error: any = await response.json();
      throw new Error(error.error?.message || error.message || "Failed to optimize yield");
    }

    return await response.json() as OptimizeYieldResponse;
  }

  /**
   * Find optimal swap route
   */
  async findOptimalSwap(
    request: FindSwapRequest
  ): Promise<FindSwapResponse> {
    const response = await this.fetch("/swap/optimal", {
      method: "POST",
      body: JSON.stringify({
        ...request,
        chainId: this.chainId,
      }),
    });

    if (!response.ok) {
      const error: any = await response.json();
      throw new Error(error.error?.message || error.message || "Failed to find optimal swap");
    }

    return await response.json() as FindSwapResponse;
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
      }),
    });

    if (!response.ok) {
      const error: any = await response.json();
      throw new Error(error.error?.message || error.message || "Failed to execute action");
    }

    return await response.json() as ExecuteActionResponse;
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
}

