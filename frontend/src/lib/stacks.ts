import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
  stringAsciiCV,
  uintCV,
  principalCV,
  cvToJSON,
  callReadOnlyFunction,
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

// Configuration
export const CONFIG = {
  network: import.meta.env.VITE_NETWORK || 'mainnet',
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || 'SP...',
  contractName: import.meta.env.VITE_CONTRACT_NAME || 'stacks-pledge',
};

export const getNetwork = () => {
  return CONFIG.network === 'mainnet' 
    ? new StacksMainnet() 
    : new StacksTestnet();
};

// Fee constants (must match contract)
export const FEES = {
  PLEDGE_FEE: 1000,
  VOUCH_FEE: 500,
  COMPLETE_FEE: 500,
};

// Types
export interface Pledge {
  id: number;
  creator: string;
  message: string;
  vouches: number;
  completed: boolean;
  createdAt: number;
  completedAt: number | null;
  category: string;
}

export interface UserStats {
  pledgesCreated: number;
  pledgesCompleted: number;
  vouchesGiven: number;
  vouchesReceived: number;
  totalFeesPaid: number;
}

// Contract call functions
export async function createPledge(
  message: string,
  category: string,
  senderAddress: string
): Promise<string> {
  const network = getNetwork();
  
  const txOptions = {
    contractAddress: CONFIG.contractAddress,
    contractName: CONFIG.contractName,
    functionName: 'create-pledge',
    functionArgs: [
      stringUtf8CV(message),
      stringAsciiCV(category.substring(0, 32)),
    ],
    senderAddress,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 200000n, // 0.2 STX fee
  };

  const transaction = await makeContractCall(txOptions as any);
  const result = await broadcastTransaction(transaction, network);
  return result.txid;
}

export async function vouchForPledge(
  pledgeId: number,
  senderAddress: string
): Promise<string> {
  const network = getNetwork();
  
  const txOptions = {
    contractAddress: CONFIG.contractAddress,
    contractName: CONFIG.contractName,
    functionName: 'vouch-for-pledge',
    functionArgs: [uintCV(pledgeId)],
    senderAddress,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 150000n, // 0.15 STX fee
  };

  const transaction = await makeContractCall(txOptions as any);
  const result = await broadcastTransaction(transaction, network);
  return result.txid;
}

export async function completePledge(
  pledgeId: number,
  senderAddress: string
): Promise<string> {
  const network = getNetwork();
  
  const txOptions = {
    contractAddress: CONFIG.contractAddress,
    contractName: CONFIG.contractName,
    functionName: 'complete-pledge',
    functionArgs: [uintCV(pledgeId)],
    senderAddress,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 150000n, // 0.15 STX fee
  };

  const transaction = await makeContractCall(txOptions as any);
  const result = await broadcastTransaction(transaction, network);
  return result.txid;
}

// Read-only functions
export async function getPledge(pledgeId: number): Promise<Pledge | null> {
  const network = getNetwork();
  
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONFIG.contractAddress,
      contractName: CONFIG.contractName,
      functionName: 'get-pledge',
      functionArgs: [uintCV(pledgeId)],
      network,
      senderAddress: CONFIG.contractAddress,
    });

    const json = cvToJSON(result);
    if (json.value === null) return null;

    return {
      id: pledgeId,
      creator: json.value.creator.value,
      message: json.value.message.value,
      vouches: parseInt(json.value.vouches.value),
      completed: json.value.completed.value,
      createdAt: parseInt(json.value['created-at'].value),
      completedAt: json.value['completed-at']?.value?.value || null,
      category: json.value.category.value,
    };
  } catch (error) {
    console.error('Error fetching pledge:', error);
    return null;
  }
}

export async function getPledgeCount(): Promise<number> {
  const network = getNetwork();
  
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONFIG.contractAddress,
      contractName: CONFIG.contractName,
      functionName: 'get-pledge-count',
      functionArgs: [],
      network,
      senderAddress: CONFIG.contractAddress,
    });

    const json = cvToJSON(result);
    return parseInt(json.value);
  } catch (error) {
    console.error('Error fetching pledge count:', error);
    return 0;
  }
}

export async function hasVouched(pledgeId: number, voucher: string): Promise<boolean> {
  const network = getNetwork();
  
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONFIG.contractAddress,
      contractName: CONFIG.contractName,
      functionName: 'has-vouched',
      functionArgs: [uintCV(pledgeId), principalCV(voucher)],
      network,
      senderAddress: CONFIG.contractAddress,
    });

    const json = cvToJSON(result);
    return json.value;
  } catch (error) {
    console.error('Error checking vouch status:', error);
    return false;
  }
}

export async function fetchAllPledges(limit: number = 50): Promise<Pledge[]> {
  const count = await getPledgeCount();
  const pledges: Pledge[] = [];
  const start = Math.max(1, count - limit + 1);
  
  for (let i = count; i >= start; i--) {
    const pledge = await getPledge(i);
    if (pledge) pledges.push(pledge);
  }
  
  return pledges;
}

// Utility functions
export function formatSTX(microSTX: number): string {
  return (microSTX / 1_000_000).toFixed(6);
}

export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
