'use client';
import { jsx as _jsx } from "react/jsx-runtime";
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
    const ComponentElement = Component;
    return (_jsx(ComponentElement, { ref: elementRef, className: className, "data-scroll-trigger": true, "data-supported": isSupported, "data-reduced-motion": isReducedMotion, ...props, children: children }));
}
