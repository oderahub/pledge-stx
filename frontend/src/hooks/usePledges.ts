import { useState, useCallback } from 'react';
import { create } from 'zustand';
import toast from 'react-hot-toast';
import { Pledge, fetchAllPledges, createPledge as createPledgeContract, vouchForPledge as vouchContract, completePledge as completeContract, hasVouched } from '../lib/stacks';
import { useWallet } from './useWallet';

interface PledgesState {
  pledges: Pledge[];
  loading: boolean;
  setPledges: (pledges: Pledge[]) => void;
  setLoading: (loading: boolean) => void;
  updatePledge: (id: number, updates: Partial<Pledge>) => void;
}

export const usePledgesStore = create<PledgesState>((set) => ({
  pledges: [],
  loading: false,
  setPledges: (pledges) => set({ pledges }),
  setLoading: (loading) => set({ loading }),
  updatePledge: (id, updates) => set((state) => ({
    pledges: state.pledges.map((p) => p.id === id ? { ...p, ...updates } : p),
  })),
}));

export function usePledges() {
  const { pledges, loading, setPledges, setLoading, updatePledge } = usePledgesStore();
  const { address, isConnected } = useWallet();
  
  const [creating, setCreating] = useState(false);
  const [vouching, setVouching] = useState<number | null>(null);
  const [completing, setCompleting] = useState<number | null>(null);

  const fetchPledges = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllPledges(50);
      setPledges(data);
    } catch (error) {
      console.error('Error fetching pledges:', error);
      toast.error('Failed to fetch pledges');
    } finally {
      setLoading(false);
    }
  }, [setPledges, setLoading]);

  const createPledge = useCallback(async (message: string, category: string) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setCreating(true);
    const toastId = toast.loading('Creating pledge...');

    try {
      const txId = await createPledgeContract(message, category, address);
      toast.success('Pledge created! Waiting for confirmation...', { id: toastId });
      return txId;
    } catch (error: any) {
      console.error('Error creating pledge:', error);
      toast.error(error.message || 'Failed to create pledge', { id: toastId });
      return null;
    } finally {
      setCreating(false);
    }
  }, [isConnected, address]);

  const vouchForPledge = useCallback(async (pledgeId: number) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return false;
    }

    const alreadyVouched = await hasVouched(pledgeId, address);
    if (alreadyVouched) {
      toast.error('You have already vouched for this pledge');
      return false;
    }

    setVouching(pledgeId);
    const toastId = toast.loading('Vouching for pledge...');

    try {
      await vouchContract(pledgeId, address);
      toast.success('Vouch submitted!', { id: toastId });
      updatePledge(pledgeId, { 
        vouches: (pledges.find(p => p.id === pledgeId)?.vouches || 0) + 1 
      });
      return true;
    } catch (error: any) {
      console.error('Error vouching:', error);
      toast.error(error.message || 'Failed to vouch', { id: toastId });
      return false;
    } finally {
      setVouching(null);
    }
  }, [isConnected, address, updatePledge, pledges]);

  const completePledge = useCallback(async (pledgeId: number) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return false;
    }

    const pledge = pledges.find(p => p.id === pledgeId);
    if (!pledge) {
      toast.error('Pledge not found');
      return false;
    }

    if (pledge.creator !== address) {
      toast.error('Only the creator can complete this pledge');
      return false;
    }

    setCompleting(pledgeId);
    const toastId = toast.loading('Completing pledge...');

    try {
      await completeContract(pledgeId, address);
      toast.success('Pledge completed!', { id: toastId });
      updatePledge(pledgeId, { completed: true, completedAt: Math.floor(Date.now() / 1000) });
      return true;
    } catch (error: any) {
      console.error('Error completing pledge:', error);
      toast.error(error.message || 'Failed to complete', { id: toastId });
      return false;
    } finally {
      setCompleting(null);
    }
  }, [isConnected, address, pledges, updatePledge]);

  return {
    pledges,
    loading,
    creating,
    vouching,
    completing,
    fetchPledges,
    createPledge,
    vouchForPledge,
    completePledge,
  };
}
