'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { ScrollAnimationConfig } from '../types';

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

export function ScrollTrigger({
  children,
  animation,
  timeline = 'root',
  range = [0, 1],
  threshold,
  onComplete,
  onUpdate,
  className,
  as: Component = 'div',
  ...props
}: ScrollTriggerProps) {
  const { elementRef, isSupported, isReducedMotion } = useScrollAnimation({
    element: null as any, // Will be set by ref
    animation,
    timeline,
    range,
    threshold,
    onComplete,
    onUpdate,
  });

  const ComponentElement = Component as any;

  return (
    <ComponentElement
      ref={elementRef}
      className={className}
      data-scroll-trigger
      data-supported={isSupported}
      data-reduced-motion={isReducedMotion}
      {...props}
    >
      {children}
    </ComponentElement>
  );
}