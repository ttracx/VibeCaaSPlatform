import { HTMLAttributes } from 'react';
interface SectionProps extends HTMLAttributes<HTMLElement> {
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    background?: 'white' | 'gray' | 'primary' | 'transparent';
}
export declare const Section: import("react").ForwardRefExoticComponent<SectionProps & import("react").RefAttributes<HTMLElement>>;
export {};
