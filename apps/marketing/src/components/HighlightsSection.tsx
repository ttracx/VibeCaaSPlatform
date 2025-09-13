'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useScrollAnimation } from '@vibecaas/motion';
import { Container, Section } from '@vibecaas/ui';

const highlights = [
  {
    id: 'real-time-collaboration',
    title: 'Real-time Collaboration',
    description: 'Work together seamlessly with live cursors, instant sync, and conflict-free editing.',
    icon: '👥',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'ai-agents',
    title: 'Intelligent AI Agents',
    description: 'Deploy autonomous agents that understand your codebase and help you build faster.',
    icon: '🤖',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'instant-deployment',
    title: 'Instant Deployment',
    description: 'Deploy your applications with a single click. No configuration, no complexity.',
    icon: '🚀',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'global-scale',
    title: 'Global Scale',
    description: 'Built for scale with edge computing and global CDN for lightning-fast performance.',
    icon: '🌍',
    color: 'from-orange-500 to-red-500',
  },
];

export function HighlightsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // Create scroll animations for each highlight
  const highlightRef1 = useRef<HTMLDivElement>(null);
  const highlightRef2 = useRef<HTMLDivElement>(null);
  const highlightRef3 = useRef<HTMLDivElement>(null);
  const highlightRef4 = useRef<HTMLDivElement>(null);
  
  const highlightRefs = useMemo(() => [
    highlightRef1,
    highlightRef2,
    highlightRef3,
    highlightRef4,
  ], []);

  useEffect(() => {
    highlightRefs.forEach((ref, index) => {
      if (ref.current) {
        // Apply scroll animation directly without using the hook
        const element = ref.current;
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const progress = entry.intersectionRatio;
              const opacity = Math.min(1, progress * 2);
              const translateY = (1 - progress) * 50;
              element.style.opacity = opacity.toString();
              element.style.transform = `translateY(${translateY}px)`;
            });
          },
          { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] }
        );
        observer.observe(element);
        
        return () => observer.disconnect();
      }
    });
  }, [highlightRefs]);

  return (
    <Section ref={sectionRef} className="relative" background="gray">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Why Choose VibeCaaS?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Experience the next generation of collaborative development with our 
            cutting-edge platform designed for modern teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((highlight, index) => (
            <div
              key={highlight.id}
              ref={highlightRefs[index]}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              style={{ opacity: 0 }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${highlight.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className="text-4xl mb-4">{highlight.icon}</div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {highlight.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {highlight.description}
              </p>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-200 transition-colors duration-300" />
            </div>
          ))}
        </div>

        {/* Scroll Progress Indicator */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-sm">Scroll to see more features</span>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
          </div>
        </div>
      </Container>
    </Section>
  );
}