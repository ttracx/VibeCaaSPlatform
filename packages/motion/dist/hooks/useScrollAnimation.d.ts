/// <reference types="react" />
import { ScrollAnimationConfig } from '../types';
/**
 * Hook for scroll-driven animations with CSS Scroll-Driven Animations and GSAP fallback
 */
export declare function useScrollAnimation(config: ScrollAnimationConfig): {
    elementRef: import("react").RefObject<HTMLElement>;
    isSupported: boolean;
    isReducedMotion: boolean;
    gsapTrigger: any;
};
