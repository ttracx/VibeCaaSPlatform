# VibeCaaS - Collaborative AI Development Platform

A cutting-edge marketing site and IDE platform built with Next.js 14, featuring Apple-style scroll interactions, real-time collaboration, and AR experiences.

## 🚀 Features

### Marketing Site
- **Hero Section**: Sticky canvas with image sequence scrubbing (120 WebP frames)
- **Scroll Animations**: CSS Scroll-Driven Animations with GSAP fallback
- **AR Experience**: iOS Quick Look (USDZ) and model-viewer (GLB) support
- **Responsive Design**: Mobile-first with accessibility features
- **Performance**: Lighthouse score ≥ 90 across all categories

### IDE Shell
- **Monaco Editor**: Full-featured code editor with VSCode compatibility
- **Real-time Collaboration**: Yjs-powered multi-user editing
- **AI Agents**: Intelligent code assistance and tool calling
- **One-click Deployment**: Instant deployment to cloud platforms
- **Terminal Integration**: Built-in terminal with live output

### Shared Packages
- **@vibecaas/ui**: Reusable UI components with TypeScript
- **@vibecaas/motion**: Animation utilities with CSS and GSAP support
- **@vibecaas/agents**: AI agent integration and WebSocket communication

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VibeCaaS Platform                        │
├─────────────────────────────────────────────────────────────────┤
│  Marketing Site (Next.js 14)  │  IDE Shell (Next.js 14)        │
│  - Hero with Canvas Sequence  │  - Monaco Editor Integration    │
│  - AR Experience (iOS/Web)    │  - Yjs Real-time Collaboration  │
│  - Scroll Animations          │  - AI Agent Integration         │
│  - Responsive Design          │  - One-click Deployment         │
└─────────────────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────────┤
│                    Shared Packages                              │
├─────────────────────────────────────────────────────────────────┤
│  @vibecaas/ui        │  @vibecaas/motion    │  @vibecaas/agents  │
│  - Button Component  │  - Scroll Animations │  - AI Agent SDK    │
│  - Container         │  - Canvas Sequence   │  - Tool Calls      │
│  - Section           │  - GSAP Fallback     │  - Streaming       │
│  - Typography        │  - Motion Detection  │  - WebSocket       │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with Next.js 14 (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for advanced animations

### Animation
- **CSS Scroll-Driven Animations** (primary)
- **GSAP ScrollTrigger** (fallback)
- **Canvas API** for image sequences
- **Web Animations API** for performance

### Collaboration
- **Yjs** for real-time collaboration
- **WebSocket** for live communication
- **Monaco Editor** for code editing

### Testing
- **Vitest** for unit testing
- **Playwright** for E2E testing
- **Lighthouse CI** for performance testing

### Infrastructure
- **Turborepo** for monorepo management
- **pnpm** for package management
- **GitHub Actions** for CI/CD
- **Vercel** for deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/vibecaas/vibecaas-platform.git
cd vibecaas-platform

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### Available Scripts

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm build            # Build all packages and apps
pnpm lint             # Lint all packages and apps
pnpm type-check       # Type check all packages and apps

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm lighthouse       # Run Lighthouse CI

# Individual apps
cd apps/marketing && pnpm dev     # Marketing site only
cd apps/ide && pnpm dev           # IDE shell only
```

## 📱 Apps

### Marketing Site (`/apps/marketing`)
- **URL**: http://localhost:3000
- **Features**: Hero section, AR experience, scroll animations
- **Routes**:
  - `/` - Homepage with hero section
  - `/launch` - IDE shell

### IDE Shell (`/apps/ide`)
- **URL**: http://localhost:3001
- **Features**: Monaco editor, real-time collaboration, AI agents
- **Routes**:
  - `/` - IDE interface

## 📦 Packages

### @vibecaas/ui
Shared UI components and design system.

```tsx
import { Button, Container, Section } from '@vibecaas/ui';

function MyComponent() {
  return (
    <Section>
      <Container>
        <Button variant="primary">Click me</Button>
      </Container>
    </Section>
  );
}
```

### @vibecaas/motion
Animation utilities with CSS and GSAP support.

```tsx
import { useScrollAnimation, ScrollTrigger } from '@vibecaas/motion';

function AnimatedComponent() {
  const { elementRef } = useScrollAnimation({
    element: null,
    animation: 'fadeInUp',
    timeline: 'self',
  });

  return (
    <ScrollTrigger animation="slideInLeft">
      <div ref={elementRef}>Animated content</div>
    </ScrollTrigger>
  );
}
```

### @vibecaas/agents
AI agent integration and WebSocket communication.

```tsx
import { useAgent } from '@vibecaas/agents';

function AgentComponent() {
  const { sendMessage, messages } = useAgent('code-assistant');

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (#0ea5e9 to #0284c7)
- **Accent**: Purple gradient (#d946ef to #c026d3)
- **Neutral**: Gray scale (#f9fafb to #111827)

### Typography
- **Headings**: Inter (font-weight: 300-900)
- **Body**: Inter (font-weight: 400-600)
- **Code**: JetBrains Mono (font-weight: 300-700)

### Spacing
- **Base unit**: 4px
- **Scale**: 0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64

## 🔧 Configuration

### Environment Variables

```bash
# Marketing app
NEXT_PUBLIC_CDN_BASE_URL=https://cdn.vibecaas.com
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# IDE app
NEXT_PUBLIC_WS_URL=wss://api.vibecaas.com/ws
NEXT_PUBLIC_AGENT_API_URL=https://api.vibecaas.com/agents

# API routes
CDN_BUCKET=vibecaas-assets
CDN_ACCESS_KEY=your-access-key
CDN_SECRET_KEY=your-secret-key
```

### Tailwind Configuration

The project uses a custom Tailwind configuration with:
- Custom color palette
- Extended font families
- Custom animations
- Responsive breakpoints

## 🧪 Testing

### Unit Tests
```bash
# Run all unit tests
pnpm test

# Run tests for specific package
cd packages/motion && pnpm test

# Run tests in watch mode
pnpm test --watch
```

### E2E Tests
```bash
# Run all E2E tests
pnpm test:e2e

# Run tests in headed mode
pnpm test:e2e --headed

# Run tests in debug mode
pnpm test:e2e --debug
```

### Performance Testing
```bash
# Run Lighthouse CI
pnpm lighthouse

# Run specific Lighthouse tests
cd apps/marketing && npx lhci autorun
```

## 📊 Performance Targets

### Core Web Vitals
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.02

### Lighthouse Scores
- **Performance**: ≥ 90
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 90
- **SEO**: ≥ 90

### Bundle Size
- **Marketing JS**: < 180KB (gzipped)
- **IDE JS**: < 500KB (gzipped)

## ♿ Accessibility

### Features
- **WCAG 2.1 AA** compliance
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Reduced motion** support
- **High contrast** mode support

### Testing
```bash
# Run accessibility tests
pnpm test:e2e --grep "accessibility"

# Run Lighthouse accessibility audit
pnpm lighthouse --only-categories=accessibility
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod

# Deploy specific app
cd apps/marketing && vercel --prod
```

### Docker
```bash
# Build Docker image
docker build -t vibecaas-platform .

# Run container
docker run -p 3000:3000 vibecaas-platform
```

### Manual Deployment
```bash
# Build all apps
pnpm build

# Start production servers
pnpm start
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent formatting
- **Conventional Commits**: Standardized commit messages

### Testing Requirements
- **Unit tests**: > 80% coverage
- **E2E tests**: All critical paths
- **Accessibility tests**: WCAG compliance
- **Performance tests**: Lighthouse targets

## 📚 Documentation

- [Ecosystem Map](./docs/ecosystem_map.md) - Complete system overview
- [MVP Catalog](./docs/mvp_catalog.md) - Feature inventory
- [Development Queue](./docs/development_queue.md) - Sprint planning

## 🐛 Troubleshooting

### Common Issues

#### Canvas Sequence Not Loading
```bash
# Check if frames exist
ls apps/marketing/public/seq/hero/

# Regenerate frames
node scripts/generate-frames.js
```

#### GSAP Fallback Not Working
```bash
# Check browser support
console.log(window.CSS?.supports('animation-timeline', 'scroll()'));

# Verify GSAP installation
pnpm list gsap
```

#### Performance Issues
```bash
# Analyze bundle size
cd apps/marketing && npx @next/bundle-analyzer

# Check Lighthouse scores
pnpm lighthouse
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Tailwind CSS** team for the utility-first CSS
- **GSAP** team for the powerful animation library
- **Monaco Editor** team for the code editor
- **Yjs** team for real-time collaboration

---

Built with ❤️ by the VibeCaaS team