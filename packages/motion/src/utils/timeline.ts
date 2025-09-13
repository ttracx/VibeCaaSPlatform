import { ScrollTimelineOptions } from '../types';

/**
 * Creates a CSS scroll timeline with fallback support
 */
export function createScrollTimeline(options: ScrollTimelineOptions = {}) {
  const { source, orientation = 'block', scrollOffsets = [0, 1] } = options;
  
  if (typeof window === 'undefined') return null;
  
  try {
    // Create scroll timeline using the new API
    const timeline = new (window as any).ScrollTimeline({
      source: source || document.scrollingElement,
      orientation,
      scrollOffsets: scrollOffsets.map(offset => 
        new (window as any).CSSNumericValue(offset)
      ),
    });
    
    return timeline;
  } catch (error) {
    console.warn('ScrollTimeline not supported, falling back to GSAP');
    return null;
  }
}

/**
 * Applies CSS scroll-driven animation to an element
 */
export function applyScrollAnimation(
  element: HTMLElement,
  animationName: string,
  timeline: 'root' | 'self' | 'nearest' = 'root',
  range: [number, number] = [0, 1]
) {
  if (typeof window === 'undefined') return;
  
  const timelineValue = timeline === 'root' ? 'scroll()' : `scroll(${timeline})`;
  
  element.style.animationName = animationName;
  // @ts-ignore - CSS Scroll-Driven Animations are not yet in TypeScript definitions
  element.style.animationTimeline = timelineValue;
  // @ts-ignore - CSS Scroll-Driven Animations are not yet in TypeScript definitions
  element.style.animationRange = `${range[0] * 100}% ${range[1] * 100}%`;
  element.style.animationFillMode = 'both';
}

/**
 * Removes scroll-driven animation from an element
 */
export function removeScrollAnimation(element: HTMLElement) {
  if (typeof window === 'undefined') return;
  
  element.style.animationName = '';
  // @ts-ignore - CSS Scroll-Driven Animations are not yet in TypeScript definitions
  element.style.animationTimeline = '';
  // @ts-ignore - CSS Scroll-Driven Animations are not yet in TypeScript definitions
  element.style.animationRange = '';
  element.style.animationFillMode = '';
}