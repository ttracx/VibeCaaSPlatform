'use client';

import { ReactNode, useEffect } from 'react';
import { SentryProvider } from './sentry-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Initialize any global providers here
    if (typeof window !== 'undefined') {
      // Web Vitals monitoring
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }, []);

  return (
    <SentryProvider>
      {children}
    </SentryProvider>
  );
}