import React, { useCallback, useRef } from 'react';
import { IdentityRefreshContext } from '../../hooks/useIdentityRefresh';

interface IdentityRefreshProviderProps {
  children: React.ReactNode;
}

export const IdentityRefreshProvider: React.FC<IdentityRefreshProviderProps> = ({ children }) => {
  const refreshCallbacks = useRef<Map<string, () => void>>(new Map());

  const registerRefreshCallback = useCallback((tokenId: string, callback: () => void) => {
    refreshCallbacks.current.set(tokenId, callback);
  }, []);

  const unregisterRefreshCallback = useCallback((tokenId: string) => {
    refreshCallbacks.current.delete(tokenId);
  }, []);

  const refreshIdentity = useCallback((tokenId: string) => {
    const callback = refreshCallbacks.current.get(tokenId);
    if (callback) {
      callback();
    }
  }, []);

  return (
    <IdentityRefreshContext.Provider
      value={{
        refreshIdentity,
        registerRefreshCallback,
        unregisterRefreshCallback,
      }}
    >
      {children}
    </IdentityRefreshContext.Provider>
  );
};