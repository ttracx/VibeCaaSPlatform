import { GSAPFallbackConfig } from '../types';

/**
 * Creates GSAP ScrollTrigger fallback for unsupported browsers
 */
export async function createGSAPFallback(config: GSAPFallbackConfig) {
  if (typeof window === 'undefined') return null;
  
  try {
    // Dynamically import GSAP and ScrollTrigger
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Create ScrollTrigger instance
    const trigger = ScrollTrigger.create({
      trigger: config.trigger,
      start: config.start || 'top bottom',
      end: config.end || 'bottom top',
      scrub: config.scrub || 1,
      pin: config.pin || false,
      onUpdate: config.onUpdate,
    });
    
    return trigger;
  } catch (error) {
    console.error('Failed to load GSAP fallback:', error);
    return null;
  }
}

/**
 * Creates a GSAP timeline for scroll-driven animations
 */
export async function createGSAPTimeline(config: GSAPFallbackConfig) {
  if (typeof window === 'undefined') return null;
  
  try {
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    
    gsap.registerPlugin(ScrollTrigger);
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: config.trigger,
        start: config.start || 'top bottom',
        end: config.end || 'bottom top',
        scrub: config.scrub || 1,
        pin: config.pin || false,
        onUpdate: config.onUpdate,
      },
    });
    
    return tl;
  } catch (error) {
    console.error('Failed to create GSAP timeline:', error);
    return null;
  }
}

/**
 * Applies GSAP animation to elements
 */
export async function applyGSAPAnimation(
  elements: string | HTMLElement | HTMLElement[],
  animation: any,
  config: GSAPFallbackConfig
) {
  if (typeof window === 'undefined') return null;
  
  try {
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    
    gsap.registerPlugin(ScrollTrigger);
    
    return gsap.to(elements, {
      ...animation,
      scrollTrigger: {
        trigger: config.trigger,
        start: config.start || 'top bottom',
        end: config.end || 'bottom top',
        scrub: config.scrub || 1,
        pin: config.pin || false,
        onUpdate: config.onUpdate,
      },
    });
  } catch (error) {
    console.error('Failed to apply GSAP animation:', error);
    return null;
  }
}