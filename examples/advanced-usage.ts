/**
 * Advanced Usage Examples
 * 
 * This example shows how to use the enhanced DefiBrain SDK
 * with wallet integration, transaction helpers, and protocol-specific helpers.
 */

import {
  DefiBrainClient,
  WalletHelper,
  TransactionHelper,
  PendleHelper,
  AaveHelper,
} from '../src';

async function main() {
  // Initialize client
  const client = new DefiBrainClient({
    apiKey: process.env.DEFIBRAIN_API_KEY || 'test_free_key',
    apiUrl: process.env.DEFIBRAIN_API_URL || 'https://backend-production-a565a.up.railway.app/v1',
    chainId: 1, // Ethereum mainnet
    retryOptions: {
      maxRetries: 3,
      initialDelay: 1000,
    },
  });

  // ============================================
  // Example 1: Wallet Integration
  // ============================================
  console.log('\n=== Wallet Integration ===');
  
  const wallet = new WalletHelper();
  
  try {
    // Connect wallet
    const walletInfo = await wallet.connect();
    console.log(`Connected to: ${walletInfo.address}`);
    console.log(`Chain ID: ${walletInfo.chainId}`);
    
    // Get balance
    const balance = await wallet.getBalance();
    console.log(`Balance: ${balance} wei`);
    
    // Get token balance
    const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    const tokenBalance = await wallet.getTokenBalance(usdcAddress);
    console.log(`USDC Balance: ${tokenBalance}`);
    
    // Listen to account changes
    const cleanup = wallet.onAccountChange((address) => {
      console.log(`Account changed to: ${address}`);
    });
    
    // Later: cleanup();
  } catch (error: any) {
    console.error('Wallet error:', error.message);
  }

  // ============================================
  // Example 2: Transaction Helper
  // ============================================
  console.log('\n=== Transaction Helper ===');
  
  const walletInfo = await wallet.getWalletInfo();
  if (walletInfo && wallet.getProvider()) {
    const txHelper = new TransactionHelper(wallet.getProvider()!, wallet.getChainId());
    
    try {
      // Optimize yield and get transaction
      const yieldResult = await client.optimizeYield({
        asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        amount: '1000000', // 1 USDC
        strategy: 'max_yield',
      });
      
      if (yieldResult.transaction) {
        console.log('Transaction prepared:', yieldResult.transaction);
        
        // Estimate gas
        const gasEstimate = await txHelper.estimateGas(yieldResult.transaction);
        console.log(`Estimated gas: ${gasEstimate}`);
        
        // Sign and send (commented out for safety)
        // const txHash = await txHelper.signAndSend(yieldResult.transaction);
        // console.log(`Transaction sent: ${txHash}`);
        
        // Wait for confirmation (commented out for safety)
        // const receipt = await txHelper.waitForConfirmation(txHash);
        // console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
        
        // Or do it all in one call
        // const receipt = await txHelper.signSendAndWait(yieldResult.transaction);
        // console.log(`Transaction confirmed: ${receipt.transactionHash}`);
      }
    } catch (error: any) {
      console.error('Transaction error:', error.message);
    }
  }

  // ============================================
  // Example 3: Pendle Helper
  // ============================================
  console.log('\n=== Pendle Helper ===');
  
  const walletInfo2 = await wallet.getWalletInfo();
  if (walletInfo2 && wallet.getProvider()) {
    const txHelper = new TransactionHelper(wallet.getProvider()!, wallet.getChainId());
    const pendleHelper = new PendleHelper(client, txHelper);
    
    try {
      // Optimize yield with Pendle specifically
      const pendleResult = await pendleHelper.optimizeYieldWithPendle(
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        '1000000', // 1 USDC
        'max_yield'
      );
      
      console.log(`Best Pendle option: ${pendleResult.protocol}`);
      console.log(`Estimated APR: ${pendleResult.estimatedAPR}%`);
      
      // Get PT info (example)
      // const ptAddress = '0x...';
      // const ptInfo = await pendleHelper.getPTInfo(ptAddress);
      // console.log(`PT Maturity: ${ptInfo.maturityDate}`);
      
      // Swap PT to YT (example - commented for safety)
      // const swapResult = await pendleHelper.swapPTtoYT(ptAddress, '1000000', false);
      // console.log('Swap prepared:', swapResult);
      
    } catch (error: any) {
      console.error('Pendle error:', error.message);
    }
  }

  // ============================================
  // Example 4: Aave Helper
  // ============================================
  console.log('\n=== Aave Helper ===');
  
  const walletInfo3 = await wallet.getWalletInfo();
  if (walletInfo3 && wallet.getProvider()) {
    const txHelper = new TransactionHelper(wallet.getProvider()!, wallet.getChainId());
    const aaveHelper = new AaveHelper(client, txHelper);
    
    try {
      // Supply to Aave (example - commented for safety)
      // const supplyResult = await aaveHelper.supply(
      //   '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      //   '1000000', // 1 USDC
      //   false // Don't execute, just prepare
      // );
      // console.log('Supply prepared:', supplyResult);
      
      // Withdraw from Aave (example)
      // const withdrawResult = await aaveHelper.withdraw(
      //   '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      //   '1000000',
      //   false
      // );
      // console.log('Withdraw prepared:', withdrawResult);
      
    } catch (error: any) {
      console.error('Aave error:', error.message);
    }
  }

  // ============================================
  // Example 5: Complete Flow
  // ============================================
  console.log('\n=== Complete Flow Example ===');
  
  const walletInfo4 = await wallet.getWalletInfo();
  if (walletInfo4 && wallet.getProvider()) {
    const txHelper = new TransactionHelper(wallet.getProvider()!, wallet.getChainId());
    
    try {
      // 1. Optimize yield
      const result = await client.optimizeYield({
        asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        amount: '1000000',
        strategy: 'max_yield',
      });
      
      console.log(`Best protocol: ${result.protocol}`);
      console.log(`Estimated APR: ${result.estimatedAPR}%`);
      
      // 2. If user approves, execute transaction
      if (result.transaction) {
        // In a real app, you'd show this to the user first
        console.log('Transaction ready to execute');
        console.log(`To: ${result.transaction.to}`);
        console.log(`Gas estimate: ${result.estimatedGas}`);
        
        // User approves...
        // const txHash = await txHelper.signAndSend(result.transaction);
        // const receipt = await txHelper.waitForConfirmation(txHash);
        // console.log(`Transaction confirmed: ${receipt.transactionHash}`);
      }
    } catch (error: any) {
      console.error('Flow error:', error.message);
    }
  }
}

// Run examples
if (require.main === module) {
  main().catch(console.error);
}

