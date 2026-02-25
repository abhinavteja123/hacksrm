import { ethers } from 'ethers';
import * as SecureStore from 'expo-secure-store';
import { DATAHAVEN_RPC, CONTRACT_ADDRESS } from '@/constants/config';
import { MEDIA_PROOF_ABI } from '@/constants/abi';

const WALLET_KEY = 'proofsnap_eth_wallet';

let provider: ethers.JsonRpcProvider | null = null;

function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(DATAHAVEN_RPC);
  }
  return provider;
}

// Generate or retrieve Ethereum wallet
export async function getOrCreateWallet(): Promise<ethers.Wallet> {
  let mnemonic = await SecureStore.getItemAsync(WALLET_KEY);

  if (!mnemonic) {
    const wallet = ethers.Wallet.createRandom();
    mnemonic = wallet.mnemonic?.phrase ?? '';
    await SecureStore.setItemAsync(WALLET_KEY, mnemonic);
  }

  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  return wallet.connect(getProvider()) as unknown as ethers.Wallet;
}

// Get wallet address
export async function getWalletAddress(): Promise<string> {
  const wallet = await getOrCreateWallet();
  return wallet.address;
}

// Get wallet balance
export async function getWalletBalance(): Promise<string> {
  try {
    const wallet = await getOrCreateWallet();
    const balance = await getProvider().getBalance(wallet.address);
    return ethers.formatEther(balance);
  } catch {
    return '0.0';
  }
}

// Anchor a proof on-chain
export async function anchorProof(
  fileHash: string,
  edSignature: string,
  edPublicKey: string
): Promise<{ txHash: string; blockNumber: number } | null> {
  try {
    // If contract address is not set, simulate
    if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      // Simulate blockchain anchoring for demo
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const fakeTxHash = '0x' + Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      return { txHash: fakeTxHash, blockNumber: Math.floor(Math.random() * 1000000) + 5000000 };
    }

    const wallet = await getOrCreateWallet();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, MEDIA_PROOF_ABI, wallet);

    const hashBytes = fileHash.startsWith('0x') ? fileHash : '0x' + fileHash;
    const tx = await contract.anchorProof(hashBytes, edSignature, edPublicKey);
    const receipt = await tx.wait();

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.warn('Blockchain anchoring failed:', error);
    // Return null so the pipeline knows anchoring genuinely failed
    return null;
  }
}

// Verify a proof on-chain
export async function verifyOnChainProof(
  fileHash: string
): Promise<{ exists: boolean; signer?: string; timestamp?: number } | null> {
  try {
    if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      return { exists: true, signer: '0xDemo', timestamp: Date.now() };
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, MEDIA_PROOF_ABI, getProvider());
    const hashBytes = fileHash.startsWith('0x') ? fileHash : '0x' + fileHash;
    const proof = await contract.getProof(hashBytes);

    return {
      exists: proof.exists,
      signer: proof.signer,
      timestamp: Number(proof.timestamp),
    };
  } catch {
    return null;
  }
}
