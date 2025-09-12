# GitHub Pages Setup for VibeCaaS Demo

## 🎯 Overview

This document outlines the complete setup for deploying the VibeCaaS frontend demo to GitHub Pages. The demo showcases a modern, responsive container management platform with interactive features.

## 🚀 Quick Start

### 1. Build the Demo
```bash
cd frontend
npm install --legacy-peer-deps
npm run build
```

### 2. Test Locally
```bash
npm run serve-demo
# Demo available at http://localhost:8080
```

### 3. Deploy to GitHub Pages
The demo is automatically deployed via GitHub Actions when you push to the main branch.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── demo/           # Demo page with mock data
│   │   └── page.tsx        # Redirects to demo
│   ├── components/         # Reusable UI components
│   │   ├── AppCard.tsx     # Application card
│   │   ├── CreateAppModal.tsx # App creation modal
│   │   ├── DashboardHeader.tsx # Header component
│   │   └── ResourceUsage.tsx # Resource monitoring
│   ├── services/
│   │   ├── api.ts          # Real API service
│   │   └── demoApi.ts      # Mock API for demo
│   └── types/
│       └── app.ts          # TypeScript definitions
├── out/                    # Static build output
├── next.config.js          # Next.js configuration
└── package.json            # Dependencies and scripts
```

## 🎨 Demo Features

### Interactive Components
- **Application Dashboard**: Grid view of containerized applications
- **Resource Monitoring**: Real-time CPU, memory, GPU, and storage usage
- **Application Management**: Start, stop, delete applications
- **Creation Workflow**: Template-based app creation with configuration

### Mock Data
The demo includes realistic mock data:
- 6 sample applications with different statuses
- Resource usage statistics
- Real-time status updates
- Template configurations for popular frameworks

### Responsive Design
- Mobile-first approach
- Dark/light mode support
- Touch-optimized interface
- Accessible components

## 🔧 Configuration

### Next.js Configuration
```javascript
// next.config.js
const nextConfig = {
  output: 'export',           // Static export for GitHub Pages
  trailingSlash: true,        // Required for GitHub Pages
  images: {
    unoptimized: true,        // Disable image optimization
  },
  // ... other config
}
```

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_NAME=VibeCaaS
```

## 🚀 Deployment

### GitHub Actions Workflow
The demo is automatically deployed using the workflow in `.github/workflows/deploy-demo.yml`:

1. **Trigger**: Push to main branch
2. **Build**: Install dependencies and build static site
3. **Deploy**: Deploy to GitHub Pages using `peaceiris/actions-gh-pages`

### Manual Deployment
If you need to deploy manually:

1. Build the project: `npm run build`
2. Copy the `out` directory to your hosting provider
3. Configure your domain to point to the static files

## 📱 Demo Scenarios

### 1. Application Management
- View all applications in a responsive grid
- See real-time status indicators
- Start/stop applications with visual feedback
- Delete applications with confirmation

### 2. Resource Monitoring
- Real-time resource usage charts
- CPU, memory, GPU, and storage metrics
- Cost tracking and billing information
- Historical usage patterns

### 3. Application Creation
- Choose from pre-built templates
- Configure application settings
- Set resource requirements
- Environment variable configuration

### 4. Responsive Design
- Test on different screen sizes
- Touch interactions on mobile
- Keyboard navigation support
- Dark/light mode toggle

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build

# Serve built demo
npm run serve-demo
```

### Adding New Features
1. Create components in `src/components/`
2. Add mock data in `src/services/demoApi.ts`
3. Update types in `src/types/app.ts`
4. Test with `npm run build`

## 🎯 Customization

### Styling
- Global styles: `src/app/globals.css`
- Tailwind config: `tailwind.config.js`
- Component styles: Inline with Tailwind classes

### Mock Data
- Applications: `mockApps` array in `demoApi.ts`
- Resource usage: `mockUsage` object
- API responses: Simulated with delays

### Templates
- Application templates: `templates` array in `CreateAppModal.tsx`
- Resource configurations: CPU, memory, GPU options
- Environment variables: Framework-specific settings

## 🔍 Testing

### Build Verification
```bash
npm run build
# Check for TypeScript errors
# Verify static files are generated
```

### Local Testing
```bash
npm run serve-demo
# Test all interactive features
# Verify responsive design
# Check browser compatibility
```

## 📊 Performance

### Bundle Size
- Main bundle: ~82kB
- Demo page: ~126kB total
- Optimized for static hosting

### Loading Performance
- Static file serving
- No server-side rendering
- Optimized images and assets

## 🚨 Troubleshooting

### Common Issues

1. **Build Errors**
   - Check TypeScript errors
   - Verify all imports are correct
   - Ensure mock data matches types

2. **Deployment Issues**
   - Verify GitHub Actions workflow
   - Check repository permissions
   - Ensure `out` directory is generated

3. **Runtime Errors**
   - Check browser console
   - Verify mock API responses
   - Test with different browsers

### Debug Commands
```bash
# Check build output
ls -la out/

# Verify static files
file out/index.html

# Test local serving
npm run serve-demo
```

## 📚 Documentation

- **Main README**: `/README.md` - Project overview
- **Demo README**: `/DEMO.md` - Demo-specific documentation
- **Component Docs**: Inline JSDoc comments
- **Type Definitions**: `src/types/app.ts`

## 🎉 Success Criteria

The demo is successful when:
- ✅ Builds without errors
- ✅ Serves static files correctly
- ✅ All interactive features work
- ✅ Responsive design functions properly
- ✅ Mock data displays correctly
- ✅ GitHub Pages deployment works

## 🔗 Links

- **Demo URL**: https://vibecaas-demo.github.io
- **Repository**: GitHub repository URL
- **Documentation**: Project documentation
- **Issues**: GitHub Issues for bug reports

---

**Note**: This is a demonstration frontend. The backend services and container orchestration are not included in this demo.