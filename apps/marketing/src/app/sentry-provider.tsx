'use client';

import { ReactNode } from 'react';

interface SentryProviderProps {
  children: ReactNode;
}

export function SentryProvider({ children }: SentryProviderProps) {
  // Sentry will be initialized via next.config.js
  // This is a placeholder for any client-side Sentry configuration
  return <>{children}</>;
}