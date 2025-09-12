'use client';

import { useEffect, useRef, useState } from 'react';
import { useCanvasSequence } from '@vibecaas/motion';
import { Button } from '@vibecaas/ui';
import { Container, Section } from '@vibecaas/ui';

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Generate placeholder frame URLs (120 frames)
  const frameUrls = Array.from({ length: 120 }, (_, i) => 
    `/seq/hero/frame-${String(i).padStart(3, '0')}.webp`
  );

  const {
    currentFrame,
    isPlaying,
    isLoaded: sequenceLoaded,
    handleScroll,
  } = useCanvasSequence({
    canvas: canvasRef.current!,
    frames: frameUrls,
    frameRate: 30,
    loop: true,
    autoplay: false, // Will be controlled by scroll
    onFrameChange: (frameIndex) => {
      // Optional: handle frame changes
    },
  });

  // Handle scroll-based scrubbing
  useEffect(() => {
    const handleScrollEvent = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollProgress = scrollTop / (documentHeight - windowHeight);
      
      handleScroll(scrollProgress);
    };

    window.addEventListener('scroll', handleScrollEvent, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollEvent);
  }, [handleScroll]);

  // Set up canvas dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <Section className="relative min-h-screen overflow-hidden" background="transparent">
      {/* Background Canvas */}
      <div className="fixed inset-0 z-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
          }}
        />
        
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center min-h-screen">
        <Container className="text-center">
          <div className="max-w-4xl mx-auto">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6">
              <span className="block text-gray-900">Build the Future of</span>
              <span className="block text-gradient">AI Development</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Collaborate in real-time with intelligent agents, deploy instantly, 
              and scale your AI applications with our cutting-edge platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="w-full sm:w-auto">
                Start Building Free
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
                <div className="text-sm text-gray-600">Active Developers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">50ms</div>
                <div className="text-sm text-gray-600">Global Latency</div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center text-gray-400">
          <span className="text-sm mb-2">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </div>
    </Section>
  );
}