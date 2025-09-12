'use client';

import { Container, Section } from '@vibecaas/ui';
import { Button } from '@vibecaas/ui';

export function CTASection() {
  return (
    <Section className="py-20" background="gray">
      <Container>
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Ready to Build the Future?
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Join thousands of developers who are already building amazing AI applications 
            with VibeCaaS. Start your journey today with our free tier.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Schedule Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600 mb-2">Free Forever</div>
              <div className="text-sm text-gray-600">No credit card required</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600 mb-2">5 Minutes</div>
              <div className="text-sm text-gray-600">To get your first app running</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600 mb-2">24/7 Support</div>
              <div className="text-sm text-gray-600">Always here to help</div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}