import { useState, useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  walletType: 'stacks-connect' | 'reown' | null;
  setConnected: (connected: boolean) => void;
  setAddress: (address: string | null) => void;
  setWalletType: (type: 'stacks-connect' | 'reown' | null) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      isConnected: false,
      address: null,
      walletType: null,
      setConnected: (connected) => set({ isConnected: connected }),
      setAddress: (address) => set({ address }),
      setWalletType: (type) => set({ walletType: type }),
      reset: () => set({ isConnected: false, address: null, walletType: null }),
    }),
    { name: 'stacks-pledge-wallet' }
  )
);

export function useWallet() {
  const { 
    isConnected, 
    address, 
    walletType,
    setConnected, 
    setAddress, 
    setWalletType,
    reset 
  } = useWalletStore();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Note: Stacks Connect handles session persistence automatically

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const { showConnect, AppConfig, UserSession } = await import('@stacks/connect');
      const appConfig = new AppConfig(['store_write', 'publish_data']);
      const userSession = new UserSession({ appConfig });

      showConnect({
        appDetails: {
          name: 'StacksPledge',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: () => {
          const userData = userSession.loadUserData();
          if (userData) {
            setConnected(true);
            setAddress(userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet);
            setWalletType('stacks-connect');
            setIsConnecting(false);
          }
        },
        onCancel: () => {
          setIsConnecting(false);
        },
        userSession,
      });
    } catch (err: any) {
      console.error('Connect error:', err);
      setError(err.message || 'Failed to connect wallet');
      setIsConnecting(false);
    }
  }, [setConnected, setAddress, setWalletType]);

  const disconnect = useCallback(() => {
    try {
      reset();
      // Clear any local session data
      localStorage.removeItem('blockstack-session');
    } catch (err: any) {
      console.error('Disconnect error:', err);
      setError(err.message);
    }
  }, [reset]);

  const getBalance = useCallback(async (): Promise<string> => {
    if (!address) return '0';
    try {
      const response = await fetch(
        `https://api.mainnet.hiro.so/extended/v1/address/${address}/stx`
      );
      const data = await response.json();
      return data.balance || '0';
    } catch (err) {
      console.error('Error fetching balance:', err);
      return '0';
    }
  }, [address]);

  return {
    isConnected,
    isConnecting,
    address,
    walletType,
    error,
    connect,
    disconnect,
    getBalance,
  };
}
