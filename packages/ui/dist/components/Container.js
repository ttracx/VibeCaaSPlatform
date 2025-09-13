import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '../lib/utils';
export const Container = forwardRef(({ className, size = 'lg', children, ...props }, ref) => {
    const sizes = {
        sm: 'max-w-3xl',
        md: 'max-w-4xl',
        lg: 'max-w-7xl',
        xl: 'max-w-8xl',
        full: 'max-w-none',
    };
    return (_jsx("div", { ref: ref, className: cn('mx-auto px-4 sm:px-6 lg:px-8', sizes[size], className), ...props, children: children }));
});
Container.displayName = 'Container';
