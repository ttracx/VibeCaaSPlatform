/**
 * Detects if CSS Scroll-Driven Animations are supported
 */
export function detectScrollTimelineSupport(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'CSS' in window &&
    'supports' in window.CSS &&
    window.CSS.supports('animation-timeline', 'scroll()')
  );
}

/**
 * Detects if IntersectionObserver is supported
 */
export function detectIntersectionObserverSupport(): boolean {
  if (typeof window === 'undefined') return false;
  
  return 'IntersectionObserver' in window;
}

/**
 * Detects if ResizeObserver is supported
 */
export function detectResizeObserverSupport(): boolean {
  if (typeof window === 'undefined') return false;
  
  return 'ResizeObserver' in window;
}

/**
 * Detects if the user prefers reduced motion
 */
export function detectReducedMotionPreference(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Detects if GSAP is available
 */
export function detectGSAPSupport(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Try to access GSAP from various possible locations
    return !!(window as any).gsap || !!(window as any).GSAP;
  } catch {
    return false;
  }
}