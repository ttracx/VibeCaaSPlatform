import { ReactNode } from 'react';
interface MotionContextValue {
    isScrollTimelineSupported: boolean;
    isReducedMotion: boolean;
    isGSAPAvailable: boolean;
}
interface MotionProviderProps {
    children: ReactNode;
}
export declare function MotionProvider({ children }: MotionProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useMotion(): MotionContextValue;
export {};
