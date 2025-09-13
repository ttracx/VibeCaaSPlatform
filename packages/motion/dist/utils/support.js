/**
 * Detects if CSS Scroll-Driven Animations are supported
 */
export function detectScrollTimelineSupport() {
    if (typeof window === 'undefined')
        return false;
    return ('CSS' in window &&
        'supports' in window.CSS &&
        window.CSS.supports('animation-timeline', 'scroll()'));
}
/**
 * Detects if IntersectionObserver is supported
 */
export function detectIntersectionObserverSupport() {
    if (typeof window === 'undefined')
        return false;
    return 'IntersectionObserver' in window;
}
/**
 * Detects if ResizeObserver is supported
 */
export function detectResizeObserverSupport() {
    if (typeof window === 'undefined')
        return false;
    return 'ResizeObserver' in window;
}
/**
 * Detects if the user prefers reduced motion
 */
export function detectReducedMotionPreference() {
    if (typeof window === 'undefined')
        return false;
    if (!window.matchMedia)
        return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
/**
 * Detects if GSAP is available
 */
export function detectGSAPSupport() {
    if (typeof window === 'undefined')
        return false;
    try {
        // Try to access GSAP from various possible locations
        return !!window.gsap || !!window.GSAP;
    }
    catch {
        return false;
    }
}
