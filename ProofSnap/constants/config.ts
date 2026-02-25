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
// DataHaven testnet explorer (Blockscout-based)
export const DATAHAVEN_EXPLORER: string = 'https://testnet.dhscan.io';
export const DATAHAVEN_MSP_URL: string = 'https://deo-dh-backend.testnet.datahaven-infra.network/';
export const DATAHAVEN_FAUCET: string = 'https://apps.datahaven.xyz/faucet';
export const BLOCK_EXPLORER: string = DATAHAVEN_EXPLORER;

// ──── Smart Contract ────
// Deploy contracts/MediaProof.sol on DataHaven Testnet via Remix IDE
// Then paste the deployed address here
export const CONTRACT_ADDRESS: string = '0xb248fD8EDc735f60bC4B060d26dfAc07eEc95bC4';

// ──── Funded Wallet ────
// Private key (64-char hex) of the wallet that deployed the contract & has MOCK tokens.
// Leave as empty string to use a device-generated random wallet instead.
// The WALLET ADDRESS (0x...) is NOT the private key — they are different values.
// NEVER commit a real mainnet private key — this is testnet only.
export const WALLET_PRIVATE_KEY: string = '5b78406c244c17efac22957797c61ad061e517b7a338a63a97ad8e96604a45f1';
