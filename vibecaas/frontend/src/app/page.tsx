'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon, RocketLaunchIcon, CpuChipIcon, ShieldCheckIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/auth/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <RocketLaunchIcon className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">VibeCaaS</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/docs" className="text-gray-700 hover:text-indigo-600">
                Documentation
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-indigo-600">
                Pricing
              </Link>
              <Link href="/auth/login" className="text-gray-700 hover:text-indigo-600">
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Deploy Containers in Seconds
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            VibeCaaS is a powerful Container-as-a-Service platform that lets you deploy, manage, and scale
            containerized applications with GPU support, all without managing infrastructure.
          </p>
          <form onSubmit={handleGetStarted} className="flex justify-center max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-3 rounded-r-md hover:bg-indigo-700 flex items-center"
            >
              Get Started
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Deploy at Scale
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<RocketLaunchIcon className="h-8 w-8 text-indigo-600" />}
              title="Instant Deployment"
              description="Deploy your containers with a single click. No complex configurations needed."
            />
            <FeatureCard
              icon={<CpuChipIcon className="h-8 w-8 text-indigo-600" />}
              title="GPU Support"
              description="Access NVIDIA T4, V100, and A100 GPUs for AI/ML workloads."
            />
            <FeatureCard
              icon={<ShieldCheckIcon className="h-8 w-8 text-indigo-600" />}
              title="Enterprise Security"
              description="Built-in security with namespace isolation, RBAC, and encrypted secrets."
            />
            <FeatureCard
              icon={<ChartBarIcon className="h-8 w-8 text-indigo-600" />}
              title="Full Observability"
              description="Monitor your applications with integrated Prometheus and Grafana."
            />
          </div>
        </div>
      </div>

      {/* Pricing Preview */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Simple, Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              title="Free"
              price="$0"
              features={[
                '3 Applications',
                '0.5 CPU / 512MB RAM',
                '1GB Storage',
                'Community Support',
              ]}
            />
            <PricingCard
              title="Pro"
              price="$50"
              features={[
                '20 Applications',
                '2 CPU / 8GB RAM',
                '20GB Storage',
                'GPU Access (T4)',
                'Priority Support',
              ]}
              highlighted
            />
            <PricingCard
              title="Enterprise"
              price="Custom"
              features={[
                'Unlimited Applications',
                'Custom Resources',
                'Dedicated GPUs',
                'SLA Guarantee',
                '24/7 Support',
              ]}
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Deploy Your First Container?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of developers who trust VibeCaaS for their container deployments.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center bg-white text-indigo-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100"
          >
            Start Free Trial
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <RocketLaunchIcon className="h-6 w-6" />
              <span className="ml-2 text-lg font-semibold">VibeCaaS</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="hover:text-gray-300">Terms</Link>
              <Link href="/privacy" className="hover:text-gray-300">Privacy</Link>
              <Link href="/docs" className="hover:text-gray-300">Docs</Link>
              <Link href="/support" className="hover:text-gray-300">Support</Link>
            </div>
          </div>
          <div className="mt-4 text-center text-gray-400">
            © 2024 VibeCaaS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingCard({
  title,
  price,
  features,
  highlighted = false,
}: {
  title: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`p-8 rounded-lg ${
        highlighted
          ? 'bg-indigo-600 text-white ring-4 ring-indigo-600 ring-opacity-50'
          : 'bg-white border border-gray-200'
      }`}
    >
      <h3 className={`text-2xl font-bold mb-2 ${highlighted ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className={`text-3xl font-bold mb-6 ${highlighted ? 'text-white' : 'text-gray-900'}`}>
        {price}
        {price !== 'Custom' && <span className="text-lg font-normal">/month</span>}
      </p>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className={`h-5 w-5 mr-2 mt-0.5 ${highlighted ? 'text-white' : 'text-indigo-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className={highlighted ? 'text-white' : 'text-gray-600'}>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}