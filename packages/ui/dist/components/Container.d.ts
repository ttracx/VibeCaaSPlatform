import { HTMLAttributes } from 'react';
interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
export declare const Container: import("react").ForwardRefExoticComponent<ContainerProps & import("react").RefAttributes<HTMLDivElement>>;
export {};
