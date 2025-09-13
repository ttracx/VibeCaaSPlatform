import { describe, it, expect, beforeEach, vi } from 'vitest';
import { detectScrollTimelineSupport, detectIntersectionObserverSupport, detectResizeObserverSupport, detectReducedMotionPreference, detectGSAPSupport, } from '../utils/support';
describe('Support Detection', () => {
    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();
    });
    describe('detectScrollTimelineSupport', () => {
        it('should return false when CSS.supports is not available', () => {
            // @ts-ignore
            delete window.CSS;
            expect(detectScrollTimelineSupport()).toBe(false);
        });
        it('should return false when CSS.supports is available but scroll timeline is not supported', () => {
            // @ts-ignore
            window.CSS = {
                supports: vi.fn().mockReturnValue(false),
            };
            expect(detectScrollTimelineSupport()).toBe(false);
        });
        it('should return true when scroll timeline is supported', () => {
            // @ts-ignore
            window.CSS = {
                supports: vi.fn().mockReturnValue(true),
            };
            expect(detectScrollTimelineSupport()).toBe(true);
        });
    });
    describe('detectIntersectionObserverSupport', () => {
        it('should return false when IntersectionObserver is not available', () => {
            // @ts-ignore
            delete window.IntersectionObserver;
            expect(detectIntersectionObserverSupport()).toBe(false);
        });
        it('should return true when IntersectionObserver is available', () => {
            // @ts-ignore
            window.IntersectionObserver = class {
            };
            expect(detectIntersectionObserverSupport()).toBe(true);
        });
    });
    describe('detectResizeObserverSupport', () => {
        it('should return false when ResizeObserver is not available', () => {
            // @ts-ignore
            delete window.ResizeObserver;
            expect(detectResizeObserverSupport()).toBe(false);
        });
        it('should return true when ResizeObserver is available', () => {
            // @ts-ignore
            window.ResizeObserver = class {
            };
            expect(detectResizeObserverSupport()).toBe(true);
        });
    });
    describe('detectReducedMotionPreference', () => {
        it('should return false when matchMedia is not available', () => {
            const originalMatchMedia = window.matchMedia;
            // @ts-ignore
            delete window.matchMedia;
            expect(detectReducedMotionPreference()).toBe(false);
            // Restore for other tests
            window.matchMedia = originalMatchMedia;
        });
        it('should return true when user prefers reduced motion', () => {
            // @ts-ignore
            window.matchMedia = vi.fn().mockReturnValue({
                matches: true,
            });
            expect(detectReducedMotionPreference()).toBe(true);
        });
        it('should return false when user does not prefer reduced motion', () => {
            // @ts-ignore
            window.matchMedia = vi.fn().mockReturnValue({
                matches: false,
            });
            expect(detectReducedMotionPreference()).toBe(false);
        });
    });
    describe('detectGSAPSupport', () => {
        it('should return false when GSAP is not available', () => {
            // @ts-ignore
            delete window.gsap;
            // @ts-ignore
            delete window.GSAP;
            expect(detectGSAPSupport()).toBe(false);
        });
        it('should return true when gsap is available', () => {
            // @ts-ignore
            window.gsap = {};
            expect(detectGSAPSupport()).toBe(true);
        });
        it('should return true when GSAP is available', () => {
            // @ts-ignore
            window.GSAP = {};
            expect(detectGSAPSupport()).toBe(true);
        });
    });
});
