// ═══════════════════════════════════════════════════════════
//  ProofSnap — App Configuration
//  Separated from Colors.ts for clarity
// ═══════════════════════════════════════════════════════════

// ──── Backend API ────
// Your deployed Express.js server URL (use Render.com free tier)
// Set to '' to use fully simulated results (offline mode)
export const API_BASE_URL: string = 'https://proofsnap-api.onrender.com';

// ──── Supabase Cloud ────
// Free tier: supabase.com → New Project → Settings → API
// Leave as placeholders to disable cloud features (app works fully offline)
export const SUPABASE_URL: string = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY: string = 'your-anon-key';

// ──── DataHaven Blockchain ────
// Substrate-based L1 with full EVM compatibility, secured by EigenLayer
// Testnet is free — get MOCK tokens from the faucet
export const DATAHAVEN_RPC: string = 'https://services.datahaven-testnet.network/testnet';
export const DATAHAVEN_WSS: string = 'wss://services.datahaven-testnet.network/testnet';
export const DATAHAVEN_CHAIN_ID: number = 55931;
export const DATAHAVEN_EXPLORER: string = 'https://datahaven-testnet.explorer.caldera.xyz';
export const DATAHAVEN_MSP_URL: string = 'https://deo-dh-backend.testnet.datahaven-infra.network/';
export const DATAHAVEN_FAUCET: string = 'https://apps.datahaven.xyz/faucet';
export const BLOCK_EXPLORER: string = DATAHAVEN_EXPLORER;

// ──── Smart Contract ────
// Deploy contracts/MediaProof.sol on DataHaven Testnet via Remix IDE
// Then paste the deployed address here
export const CONTRACT_ADDRESS: string = '0x0000000000000000000000000000000000000000';
