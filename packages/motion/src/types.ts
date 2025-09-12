export interface ScrollAnimationConfig {
  element: HTMLElement;
  animation: string;
  timeline?: 'root' | 'self' | 'nearest';
  range?: [number, number];
  threshold?: number;
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
}

export interface CanvasSequenceConfig {
  canvas: HTMLCanvasElement;
  frames: string[];
  frameRate?: number;
  loop?: boolean;
  autoplay?: boolean;
  onFrameChange?: (frameIndex: number) => void;
  onComplete?: () => void;
}

export interface ScrollTimelineOptions {
  source?: HTMLElement;
  orientation?: 'block' | 'inline' | 'horizontal' | 'vertical';
  scrollOffsets?: [number, number];
}

export interface GSAPFallbackConfig {
  trigger: string | HTMLElement;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean | string;
  onUpdate?: (self: any) => void;
  onComplete?: () => void;
}