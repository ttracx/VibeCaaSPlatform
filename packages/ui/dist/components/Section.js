import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '../lib/utils';
export const Section = forwardRef(({ className, padding = 'lg', background = 'white', children, ...props }, ref) => {
    const paddings = {
        none: '',
        sm: 'py-8 sm:py-12',
        md: 'py-12 sm:py-16',
        lg: 'py-16 sm:py-20 lg:py-24',
        xl: 'py-20 sm:py-24 lg:py-32',
    };
    const backgrounds = {
        white: 'bg-white',
        gray: 'bg-gray-50',
        primary: 'bg-primary-50',
        transparent: 'bg-transparent',
    };
    return (_jsx("section", { ref: ref, className: cn(paddings[padding], backgrounds[background], className), ...props, children: children }));
});
Section.displayName = 'Section';
