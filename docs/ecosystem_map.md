# VibeCaaS Ecosystem Map

## Overview
This document provides a comprehensive map of the VibeCaaS ecosystem, including all applications, packages, and infrastructure components.

## Architecture

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
│
├─────────────────────────────────────────────────────────────────┤
│                    Infrastructure                               │
├─────────────────────────────────────────────────────────────────┤
│  CDN & Storage      │  API Routes          │  Monitoring        │
│  - Asset Pipeline   │  - Presigned URLs    │  - Web Vitals      │
│  - Image Sequence   │  - Rate Limiting     │  - Sentry          │
│  - 3D Models        │  - Validation        │  - Performance     │
└─────────────────────────────────────────────────────────────────┘
```

## Applications

### Marketing Site (`/apps/marketing`)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Features**:
  - Hero section with canvas image sequence scrubbing
  - CSS Scroll-Driven Animations with GSAP fallback
  - AR section with iOS Quick Look and model-viewer
  - Responsive design with accessibility features
  - SEO optimization and performance monitoring

### IDE Shell (`/apps/ide`)
- **Framework**: Next.js 14 with App Router
- **Editor**: Monaco Editor integration
- **Collaboration**: Yjs for real-time editing
- **Features**:
  - Multi-user real-time collaboration
  - AI agent integration
  - One-click deployment
  - Terminal integration
  - File explorer

## Packages

### UI Package (`@vibecaas/ui`)
- **Purpose**: Shared UI components and design system
- **Components**:
  - Button (multiple variants)
  - Container (responsive layouts)
  - Section (content sections)
  - Typography utilities
- **Features**:
  - TypeScript support
  - Tailwind CSS integration
  - Accessibility compliance

### Motion Package (`@vibecaas/motion`)
- **Purpose**: Animation and motion utilities
- **Features**:
  - CSS Scroll-Driven Animations
  - GSAP ScrollTrigger fallback
  - Canvas sequence scrubbing
  - Motion preference detection
  - Performance optimization

### Agents Package (`@vibecaas/agents`)
- **Purpose**: AI agent integration and tool calling
- **Features**:
  - WebSocket-based communication
  - Streaming tool calls
  - Real-time collaboration
  - Agent management
  - Error handling

## Infrastructure

### CDN & Storage
- **Asset Pipeline**: Automated image optimization
- **Image Sequence**: 120 WebP frames for hero animation
- **3D Models**: USDZ (iOS) and GLB (Web) formats
- **Performance**: Edge caching and compression

### API Routes
- **Presigned URLs**: Secure asset upload/download
- **Rate Limiting**: Request throttling and abuse prevention
- **Validation**: Zod schema validation
- **Security**: Input sanitization and CORS

### Monitoring
- **Web Vitals**: Core Web Vitals tracking
- **Sentry**: Error monitoring and performance
- **Lighthouse CI**: Automated performance testing
- **Analytics**: User behavior and engagement

## Development Workflow

### Local Development
1. **Setup**: `pnpm install`
2. **Development**: `pnpm dev`
3. **Testing**: `pnpm test`
4. **E2E Testing**: `pnpm test:e2e`
5. **Lighthouse**: `pnpm lighthouse`

### CI/CD Pipeline
1. **Build**: Type checking, linting, compilation
2. **Test**: Unit tests, integration tests
3. **E2E**: Playwright end-to-end tests
4. **Lighthouse**: Performance and accessibility audits
5. **Deploy**: Automated deployment to staging/production

## Technology Stack

### Frontend
- **React 18**: UI framework
- **Next.js 14**: Full-stack framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Framer Motion**: Advanced animations

### Animation
- **CSS Scroll-Driven Animations**: Primary motion system
- **GSAP**: Fallback for unsupported browsers
- **Canvas API**: Image sequence scrubbing
- **Web Animations API**: Performance optimization

### Collaboration
- **Yjs**: Real-time collaboration
- **WebSocket**: Live communication
- **Monaco Editor**: Code editing
- **Presence**: User awareness

### Testing
- **Vitest**: Unit testing
- **Playwright**: E2E testing
- **Testing Library**: Component testing
- **Lighthouse CI**: Performance testing

### Infrastructure
- **Turborepo**: Monorepo management
- **pnpm**: Package management
- **GitHub Actions**: CI/CD
- **Vercel**: Deployment platform

## Performance Targets

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
- **Images**: WebP/AVIF optimization

## Security Considerations

### API Security
- Rate limiting and throttling
- Input validation with Zod
- CORS configuration
- Secure headers

### Asset Security
- Presigned URLs with expiration
- Content type validation
- File size limits
- CDN security headers

### Client Security
- XSS prevention
- CSRF protection
- Secure cookie handling
- Content Security Policy

## Accessibility Features

### Motion
- Respects `prefers-reduced-motion`
- Fallback animations
- Keyboard navigation
- Screen reader support

### Visual
- High contrast ratios
- Focus indicators
- Semantic HTML
- ARIA landmarks

### Performance
- Lazy loading
- Progressive enhancement
- Graceful degradation
- Error boundaries