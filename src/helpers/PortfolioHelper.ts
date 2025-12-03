/**
 * Portfolio Helper - Lectura de posiciones agregadas usando el backend + on-chain
 *
 * Nota: hoy no existe un endpoint dedicado de "portfolio" en el backend,
 * así que este helper es deliberadamente minimal y se centra en utilidades
 * que podemos construir encima de los endpoints existentes.
 */

import { DefiBrainClient } from '../DefiBrainClient';
import { WalletHelper } from '../utils/WalletHelper';
import { validateAddress } from '../utils/ValidationHelper';

export interface TokenBalance {
  token: string;
  balance: string;
}

export interface ProtocolExposure {
  protocol: string;
  assets: TokenBalance[];
}

export class PortfolioHelper {
  private client: DefiBrainClient;
  private walletHelper: WalletHelper;

  constructor(client: DefiBrainClient, walletHelper: WalletHelper) {
    this.client = client;
    this.walletHelper = walletHelper;
  }

  /**
   * Obtiene el balance agregado de una lista de tokens para la cuenta conectada.
   * Esto usa sólo la wallet (no el backend), pero es útil para mostrar balances
   * rápidos en el frontend.
   */
  async getTokenBalances(tokens: string[]): Promise<TokenBalance[]> {
    const info = await this.walletHelper.getWalletInfo();
    if (!info) {
      throw new Error('Wallet not connected');
    }

    const results: TokenBalance[] = [];

    for (const token of tokens) {
      validateAddress(token, 'Token');
      const balance = await this.walletHelper.getTokenBalance(token);
      results.push({ token, balance });
    }

    return results;
  }

  /**
   * Devuelve una vista muy simple de exposición por protocolo basada en llamadas
   * a optimizeYield/executeAction históricas no está disponible todavía.
   *
   * Por ahora dejamos el hook/documentación listo para cuando el backend exponga
   * un endpoint de portfolio real.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getProtocolExposure(_account: string): Promise<ProtocolExposure[]> {
    throw new Error(
      'Protocol exposure helper is not implemented yet. ' +
      'Requires backend support for portfolio endpoints.'
    );
  }
}


