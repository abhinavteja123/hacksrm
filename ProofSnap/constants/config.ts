// ═══════════════════════════════════════════════════════════
//  ProofSnap — App Configuration
//  Separated from Colors.ts for clarity
// ═══════════════════════════════════════════════════════════

// ──── Backend API ────
export const API_BASE_URL: string = 'https://hacksrm-pi.vercel.app';

// ──── Supabase Cloud ────
export const SUPABASE_URL: string = 'https://qfeknedjhjmdinwmqbru.supabase.co';
export const SUPABASE_ANON_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmZWtuZWRqaGptZGlud21xYnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNDA2NjYsImV4cCI6MjA4NzYxNjY2Nn0.q3Sdo_y_P7Yqyckf1HMcCrytbVosOybR4-yWnlZAR30';

// ──── DataHaven Blockchain ────
// Substrate-based L1 with full EVM compatibility, secured by EigenLayer
// Testnet is free — get MOCK tokens from the faucet
export const DATAHAVEN_RPC: string = 'https://services.datahaven-testnet.network/testnet';
export const DATAHAVEN_WSS: string = 'wss://services.datahaven-testnet.network/testnet';
export const DATAHAVEN_CHAIN_ID: number = 55931;
export const DATAHAVEN_EXPLORER: string = 'https://datahaven-testnet.calderaexplorer.xyz';
export const DATAHAVEN_MSP_URL: string = 'https://deo-dh-backend.testnet.datahaven-infra.network/';
export const DATAHAVEN_FAUCET: string = 'https://apps.datahaven.xyz/faucet';
export const BLOCK_EXPLORER: string = DATAHAVEN_EXPLORER;

// ──── Smart Contract ────
// Deploy contracts/MediaProof.sol on DataHaven Testnet via Remix IDE
// Then paste the deployed address here
export const CONTRACT_ADDRESS: string = '0x0000000000000000000000000000000000000000';
