import '@testing-library/jest-dom';
import { vi } from 'vitest';
// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() {
        this.root = null;
        this.rootMargin = '';
        this.thresholds = [];
    }
    disconnect() { }
    observe() { }
    unobserve() { }
    takeRecords() { return []; }
};
// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
};
// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
    return setTimeout(callback, 16);
};
global.cancelAnimationFrame = (id) => {
    clearTimeout(id);
};
