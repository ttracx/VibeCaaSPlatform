import { ReactNode } from 'react';
interface ScrollTriggerProps {
    children: ReactNode;
    animation: string;
    timeline?: 'root' | 'self' | 'nearest';
    range?: [number, number];
    threshold?: number;
    onComplete?: () => void;
    onUpdate?: (progress: number) => void;
    className?: string;
    as?: keyof React.JSX.IntrinsicElements;
}
export declare function ScrollTrigger({ children, animation, timeline, range, threshold, onComplete, onUpdate, className, as: Component, ...props }: ScrollTriggerProps): import("react/jsx-runtime").JSX.Element;
export {};
