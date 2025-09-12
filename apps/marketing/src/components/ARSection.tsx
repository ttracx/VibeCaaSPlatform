'use client';

import { Container, Section } from '@vibecaas/ui';
import { useScrollAnimation } from '@vibecaas/motion';
import { useEffect, useRef, useState } from 'react';

export function ARSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isARSupported, setIsARSupported] = useState(false);

  useEffect(() => {
    // Detect iOS device
    const userAgent = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Check for AR support
    const checkARSupport = async () => {
      if ('xr' in navigator) {
        try {
          const isSupported = await (navigator as any).xr.isSessionSupported('immersive-ar');
          setIsARSupported(isSupported);
        } catch (error) {
          console.log('AR not supported:', error);
        }
      }
    };

    checkARSupport();
  }, []);

  const handleARButtonClick = () => {
    if (isIOS) {
      // For iOS, trigger Quick Look
      const link = document.createElement('a');
      link.href = '/models/vibecaas-demo.usdz';
      link.rel = 'ar';
      link.click();
    } else {
      // For other platforms, open model viewer
      const modelViewer = document.querySelector('model-viewer');
      if (modelViewer) {
        (modelViewer as any).cameraOrbit = '0deg 75deg 1.5m';
        (modelViewer as any).cameraTarget = '0m 0m 0m';
      }
    }
  };

  return (
    <Section className="py-20" background="primary">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Experience in AR
          </h2>
          <p className="text-lg text-primary-100 max-w-3xl mx-auto">
            See VibeCaaS in action with our interactive AR experience. 
            Available on iOS devices and modern browsers.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* AR Model Container */}
          <div className="relative bg-white rounded-2xl p-8 shadow-2xl">
            <div className="aspect-square max-w-md mx-auto">
              {isIOS ? (
                // iOS Quick Look placeholder
                <div className="w-full h-full bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📱</div>
                    <div className="text-gray-600 mb-4">iOS Quick Look Ready</div>
                    <div className="text-sm text-gray-500">
                      Tap the AR button to view in AR
                    </div>
                  </div>
                </div>
              ) : (
                // Model Viewer for other platforms
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🖥️</div>
                    <div className="text-gray-600 mb-4">3D Model Viewer</div>
                    <div className="text-sm text-gray-500">
                      Interactive 3D model loading...
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AR Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleARButtonClick}
                className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                disabled={!isARSupported && !isIOS}
              >
                <span className="mr-2">
                  {isIOS ? '👁️' : '🔍'}
                </span>
                {isIOS ? 'View in AR' : 'View 3D Model'}
              </button>
              
              {!isARSupported && !isIOS && (
                <p className="text-sm text-gray-500 mt-2">
                  AR not supported on this device
                </p>
              )}
            </div>
          </div>

          {/* Features List */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center text-white">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">iOS Quick Look</h3>
              <p className="text-primary-100">
                Native AR experience on iPhone and iPad
              </p>
            </div>
            <div className="text-center text-white">
              <div className="text-3xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold mb-2">Web AR</h3>
              <p className="text-primary-100">
                Cross-platform AR in modern browsers
              </p>
            </div>
            <div className="text-center text-white">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Interactive</h3>
              <p className="text-primary-100">
                Touch and explore our platform in 3D
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}