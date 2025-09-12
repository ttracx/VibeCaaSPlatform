'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { detectScrollTimelineSupport, detectReducedMotionPreference } from '../utils/support';

interface MotionContextValue {
  isScrollTimelineSupported: boolean;
  isReducedMotion: boolean;
  isGSAPAvailable: boolean;
}

const MotionContext = createContext<MotionContextValue | null>(null);

interface MotionProviderProps {
  children: ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  const [isScrollTimelineSupported, setIsScrollTimelineSupported] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isGSAPAvailable, setIsGSAPAvailable] = useState(false);

  useEffect(() => {
    // Check support on client side
    setIsScrollTimelineSupported(detectScrollTimelineSupport());
    setIsReducedMotion(detectReducedMotionPreference());
    
    // Check for GSAP availability
    const checkGSAP = async () => {
      try {
        await import('gsap');
        setIsGSAPAvailable(true);
      } catch {
        setIsGSAPAvailable(false);
      }
    };
    
    checkGSAP();

    // Listen for changes in reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value: MotionContextValue = {
    isScrollTimelineSupported,
    isReducedMotion,
    isGSAPAvailable,
  };

  return (
    <MotionContext.Provider value={value}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotion() {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error('useMotion must be used within a MotionProvider');
  }
  return context;
}