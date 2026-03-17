import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState } from
'react';
import { storefrontApi, BootstrapResponse } from './api';
import { useTranslation } from './i18n';

interface StorefrontContextType {
  bootstrap: BootstrapResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(
  undefined,
);

export function StorefrontProvider({ children }: {children: ReactNode;}) {
  const { locale } = useTranslation();
  const [bootstrap, setBootstrap] = useState<BootstrapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await storefrontApi.bootstrap(locale);
      setBootstrap(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [locale]);

  return (
    <StorefrontContext.Provider
      value={{
        bootstrap,
        isLoading,
        error,
        refresh: load
      }}>
      
      {children}
    </StorefrontContext.Provider>);

}

export function useStorefront() {
  const context = useContext(StorefrontContext);

  if (!context) {
    throw new Error('useStorefront must be used within StorefrontProvider');
  }

  return context;
}
