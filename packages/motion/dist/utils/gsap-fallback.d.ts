import { GSAPFallbackConfig } from '../types';
/**
 * Creates GSAP ScrollTrigger fallback for unsupported browsers
 */
export declare function createGSAPFallback(config: GSAPFallbackConfig): Promise<ScrollTrigger | null>;
/**
 * Creates a GSAP timeline for scroll-driven animations
 */
export declare function createGSAPTimeline(config: GSAPFallbackConfig): Promise<gsap.core.Omit<gsap.core.Timeline, "then"> | null>;
/**
 * Applies GSAP animation to elements
 */
export declare function applyGSAPAnimation(elements: string | HTMLElement | HTMLElement[], animation: any, config: GSAPFallbackConfig): Promise<gsap.core.Omit<gsap.core.Tween, "then"> | null>;
