'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { detectScrollTimelineSupport, detectReducedMotionPreference } from '../utils/support';
const MotionContext = createContext(null);
export function MotionProvider({ children }) {
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
            }
            catch {
                setIsGSAPAvailable(false);
            }
        };
        checkGSAP();
        // Listen for changes in reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleChange = (e) => {
            setIsReducedMotion(e.matches);
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    const value = {
        isScrollTimelineSupported,
        isReducedMotion,
        isGSAPAvailable,
    };
    return (<MotionContext.Provider value={value}>
      {children}
    </MotionContext.Provider>);
}
export function useMotion() {
    const context = useContext(MotionContext);
    if (!context) {
        throw new Error('useMotion must be used within a MotionProvider');
    }
    return context;
}
