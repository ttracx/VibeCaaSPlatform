'use client';

import { Container, Section } from '@vibecaas/ui';
import { useScrollAnimation } from '@vibecaas/motion';
import { useEffect, useRef } from 'react';

const features = [
  {
    title: 'Monaco Editor Integration',
    description: 'Full-featured code editor with syntax highlighting, IntelliSense, and VSCode compatibility.',
    image: '/features/monaco-editor.jpg',
    alt: 'Monaco Editor Interface',
  },
  {
    title: 'Real-time Collaboration',
    description: 'See your teammates\' cursors, selections, and changes in real-time with Yjs-powered sync.',
    image: '/features/collaboration.jpg',
    alt: 'Real-time Collaboration Interface',
  },
  {
    title: 'AI-Powered Assistance',
    description: 'Get intelligent code suggestions, automated refactoring, and smart debugging with our AI agents.',
    image: '/features/ai-assistance.jpg',
    alt: 'AI Assistant Interface',
  },
  {
    title: 'One-Click Deployment',
    description: 'Deploy your applications instantly with our zero-configuration deployment pipeline.',
    image: '/features/deployment.jpg',
    alt: 'Deployment Dashboard',
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const featureRefs = features.map(() => useRef<HTMLDivElement>(null));

  useEffect(() => {
    featureRefs.forEach((ref, index) => {
      if (ref.current) {
        useScrollAnimation({
          element: ref.current,
          animation: 'slideInFromLeft',
          timeline: 'self',
          range: [0, 1],
          onUpdate: (progress) => {
            const element = ref.current;
            if (element) {
              const opacity = Math.min(1, progress * 2);
              const translateX = (1 - progress) * 100;
              element.style.opacity = opacity.toString();
              element.style.transform = `translateX(${translateX}px)`;
            }
          },
        });
      }
    });
  }, []);

  return (
    <Section className="py-20" background="white">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Everything you need to build, collaborate, and deploy AI applications at scale.
          </p>
        </div>

        <div className="space-y-24">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              ref={featureRefs[index]}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } items-center gap-12`}
              style={{ opacity: 0 }}
            >
              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  {feature.description}
                </p>
                <button className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                  Learn more →
                </button>
              </div>

              {/* Image */}
              <div className="flex-1">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <div className="text-4xl mb-2">🖼️</div>
                      <div className="text-sm">{feature.alt}</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}