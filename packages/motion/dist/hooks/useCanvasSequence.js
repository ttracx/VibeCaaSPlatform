import { useEffect, useRef, useState, useCallback } from 'react';
import { detectReducedMotionPreference } from '../utils/support';
/**
 * Hook for canvas image sequence scrubbing (flipbook effect)
 */
export function useCanvasSequence(config) {
    const canvasRef = useRef(null);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isPlaying, setIsPlaying] = useState(config.autoplay ?? true);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isReducedMotion, setIsReducedMotion] = useState(false);
    const frameCount = config.frames.length;
    const frameRate = config.frameRate ?? 30;
    const frameDuration = 1000 / frameRate;
    const animationRef = useRef();
    const lastTimeRef = useRef(0);
    const imagesRef = useRef([]);
    // Load all frame images
    useEffect(() => {
        const loadImages = async () => {
            const images = await Promise.all(config.frames.map((src) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = src;
                });
            }));
            imagesRef.current = images;
            setIsLoaded(true);
        };
        loadImages().catch(console.error);
    }, [config.frames]);
    // Animation loop
    const animate = useCallback((timestamp) => {
        if (!isPlaying || !isLoaded || isReducedMotion)
            return;
        const canvas = canvasRef.current || config.canvas;
        if (!canvas || !imagesRef.current.length)
            return;
        const deltaTime = timestamp - lastTimeRef.current;
        if (deltaTime >= frameDuration) {
            const nextFrame = (currentFrame + 1) % frameCount;
            setCurrentFrame(nextFrame);
            // Draw current frame
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(imagesRef.current[nextFrame], 0, 0, canvas.width, canvas.height);
            }
            config.onFrameChange?.(nextFrame);
            if (nextFrame === 0 && !config.loop) {
                setIsPlaying(false);
                config.onComplete?.();
                return;
            }
            lastTimeRef.current = timestamp;
        }
        animationRef.current = requestAnimationFrame(animate);
    }, [isPlaying, isLoaded, isReducedMotion, currentFrame, frameCount, frameDuration, config]);
    // Start/stop animation
    useEffect(() => {
        if (isPlaying && isLoaded && !isReducedMotion) {
            animationRef.current = requestAnimationFrame(animate);
        }
        else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, isLoaded, isReducedMotion, animate]);
    // Handle scroll-based scrubbing
    const handleScroll = useCallback((progress) => {
        if (isReducedMotion || !isLoaded)
            return;
        const frameIndex = Math.floor(progress * (frameCount - 1));
        const clampedIndex = Math.max(0, Math.min(frameIndex, frameCount - 1));
        if (clampedIndex !== currentFrame) {
            setCurrentFrame(clampedIndex);
            const canvas = canvasRef.current || config.canvas;
            if (canvas && imagesRef.current[clampedIndex]) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(imagesRef.current[clampedIndex], 0, 0, canvas.width, canvas.height);
                }
            }
            config.onFrameChange?.(clampedIndex);
        }
    }, [isReducedMotion, isLoaded, frameCount, currentFrame, config]);
    // Check for reduced motion preference
    useEffect(() => {
        setIsReducedMotion(detectReducedMotionPreference());
    }, []);
    // Control methods
    const play = useCallback(() => setIsPlaying(true), []);
    const pause = useCallback(() => setIsPlaying(false), []);
    const reset = useCallback(() => {
        setCurrentFrame(0);
        setIsPlaying(config.autoplay ?? true);
    }, [config.autoplay]);
    return {
        canvasRef,
        currentFrame,
        isPlaying,
        isLoaded,
        isReducedMotion,
        play,
        pause,
        reset,
        handleScroll,
    };
}
