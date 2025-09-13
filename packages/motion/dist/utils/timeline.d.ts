import { ScrollTimelineOptions } from '../types';
/**
 * Creates a CSS scroll timeline with fallback support
 */
export declare function createScrollTimeline(options?: ScrollTimelineOptions): any;
/**
 * Applies CSS scroll-driven animation to an element
 */
export declare function applyScrollAnimation(element: HTMLElement, animationName: string, timeline?: 'root' | 'self' | 'nearest', range?: [number, number]): void;
/**
 * Removes scroll-driven animation from an element
 */
export declare function removeScrollAnimation(element: HTMLElement): void;
