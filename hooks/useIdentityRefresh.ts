import { createContext, useContext } from 'react';

interface IdentityRefreshContextType {
  refreshIdentity: (tokenId: string) => void;
  registerRefreshCallback: (tokenId: string, callback: () => void) => void;
  unregisterRefreshCallback: (tokenId: string) => void;
}

export const IdentityRefreshContext = createContext<IdentityRefreshContextType | null>(null);

export const useIdentityRefresh = () => {
  const context = useContext(IdentityRefreshContext);
  if (!context) {
    throw new Error('useIdentityRefresh must be used within an IdentityRefreshProvider');
  }
  return context;
};