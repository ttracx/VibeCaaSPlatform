'use client';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
export function ScrollTrigger({ children, animation, timeline = 'root', range = [0, 1], threshold, onComplete, onUpdate, className, as: Component = 'div', ...props }) {
    const { elementRef, isSupported, isReducedMotion } = useScrollAnimation({
        element: null,
        animation,
        timeline,
        range,
        threshold,
        onComplete,
        onUpdate,
    });
    return (<Component ref={elementRef} className={className} data-scroll-trigger data-supported={isSupported} data-reduced-motion={isReducedMotion} {...props}>
      {children}
    </Component>);
}
