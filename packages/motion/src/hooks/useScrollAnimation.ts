import { useEffect, useRef, useState } from 'react';
import { detectScrollTimelineSupport, detectReducedMotionPreference } from '../utils/support';
import { applyScrollAnimation, removeScrollAnimation } from '../utils/timeline';
import { createGSAPFallback } from '../utils/gsap-fallback';
import { ScrollAnimationConfig } from '../types';

/**
 * Hook for scroll-driven animations with CSS Scroll-Driven Animations and GSAP fallback
 */
export function useScrollAnimation(config: ScrollAnimationConfig) {
  const elementRef = useRef<HTMLElement>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [gsapTrigger, setGsapTrigger] = useState<any>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const element = elementRef.current || config.element;
    if (!element) return;

    const supportsScrollTimeline = detectScrollTimelineSupport();
    const prefersReducedMotion = detectReducedMotionPreference();
    
    setIsSupported(supportsScrollTimeline);
    setIsReducedMotion(prefersReducedMotion);

    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion) {
      return;
    }

    if (supportsScrollTimeline) {
      // Use CSS Scroll-Driven Animations
      applyScrollAnimation(
        element,
        config.animation,
        config.timeline || 'root',
        config.range || [0, 1]
      );
    } else {
      // Fallback to GSAP ScrollTrigger
      createGSAPFallback({
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          config.onUpdate?.(progress);
        },
        onComplete: config.onComplete,
      }).then(setGsapTrigger);
    }

    return () => {
      if (supportsScrollTimeline) {
        removeScrollAnimation(element);
      } else if (gsapTrigger) {
        gsapTrigger.kill();
      }
    };
  }, [config.animation, config.timeline, config.range, config.onUpdate, config.onComplete]);

  return {
    elementRef,
    isSupported,
    isReducedMotion,
    gsapTrigger,
  };
}