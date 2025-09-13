/// <reference types="react" />
import { CanvasSequenceConfig } from '../types';
/**
 * Hook for canvas image sequence scrubbing (flipbook effect)
 */
export declare function useCanvasSequence(config: CanvasSequenceConfig): {
    canvasRef: import("react").RefObject<HTMLCanvasElement>;
    currentFrame: number;
    isPlaying: boolean;
    isLoaded: boolean;
    isReducedMotion: boolean;
    play: () => void;
    pause: () => void;
    reset: () => void;
    handleScroll: (progress: number) => void;
};
