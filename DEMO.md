# VibeCaaS Platform Demo

This repository contains a live demonstration of the VibeCaaS (Container as a Service) platform frontend. The demo showcases a modern, responsive web interface for managing containerized applications.

## 🚀 Live Demo

**Demo URL**: [https://vibecaas-demo.github.io](https://vibecaas-demo.github.io)

## ✨ Features Demonstrated

### 🎯 Core Functionality
- **Application Management**: Create, start, stop, and delete containerized applications
- **Real-time Status**: Live updates of application status and resource usage
- **Resource Monitoring**: CPU, memory, GPU, and storage usage tracking
- **Template System**: Pre-configured templates for popular frameworks

### 🎨 UI/UX Features
- **Modern Design**: Clean, professional interface with dark/light mode support
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Interactive Components**: Smooth animations and transitions
- **Real-time Updates**: Live data refresh without page reloads

### 🛠️ Technical Stack
- **Frontend**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom components
- **Icons**: Heroicons for consistent iconography
- **State Management**: React Query for server state
- **UI Components**: Headless UI for accessible components

## 🎮 Demo Scenarios

### 1. Application Dashboard
- View all your containerized applications in a grid layout
- See real-time status indicators (running, stopped, creating, etc.)
- Monitor resource usage across all applications

### 2. Create New Application
- Choose from pre-built templates (React, Next.js, Python, FastAPI, Go, Rust)
- Configure application settings (name, port, resources)
- Watch the creation process in real-time

### 3. Application Management
- Start/stop applications with a single click
- View application details and resource allocation
- Access applications via direct URLs when running

### 4. Resource Monitoring
- Real-time CPU, memory, GPU, and storage usage
- Visual indicators for resource consumption
- Historical usage patterns

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── demo/           # Demo page
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable UI components
│   │   ├── AppCard.tsx     # Application card component
│   │   ├── CreateAppModal.tsx # Application creation modal
│   │   ├── DashboardHeader.tsx # Header with navigation
│   │   └── ResourceUsage.tsx # Resource monitoring component
│   ├── services/           # API services
│   │   └── demoApi.ts      # Mock API for demo
│   └── types/              # TypeScript type definitions
└── public/                 # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/vibecaas-platform.git
   cd vibecaas-platform
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

1. **Build the static site**
   ```bash
   cd frontend
   npm run build
   ```

2. **Preview the build**
   ```bash
   npm run start
   ```

## 🎨 Customization

### Styling
The demo uses Tailwind CSS with custom components. Key styling files:
- `src/app/globals.css` - Global styles and custom components
- `tailwind.config.js` - Tailwind configuration

### Mock Data
Demo data is defined in `src/services/demoApi.ts`. You can modify:
- Application templates
- Resource usage data
- API response delays

### Components
All UI components are in `src/components/`. Each component is:
- Fully typed with TypeScript
- Responsive and accessible
- Reusable across the application

## 🔧 Configuration

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_NAME=VibeCaaS
```

### Next.js Configuration
The demo is configured for static export in `next.config.js`:
- Static export enabled
- Image optimization disabled for GitHub Pages
- Trailing slashes enabled

## 📱 Responsive Design

The demo is fully responsive and optimized for:
- **Desktop**: Full feature set with sidebar navigation
- **Tablet**: Adapted layout with collapsible navigation
- **Mobile**: Touch-optimized interface with bottom navigation

## 🌙 Dark Mode

The interface supports both light and dark modes:
- Automatic detection based on system preferences
- Manual toggle in the header
- Consistent theming across all components

## 🚀 Deployment

### GitHub Pages
The demo is automatically deployed to GitHub Pages using GitHub Actions:
- Builds on every push to main branch
- Deploys static files to `gh-pages` branch
- Custom domain support available

### Manual Deployment
1. Build the static site: `npm run build`
2. Deploy the `out` directory to your hosting provider
3. Configure your domain to point to the deployed files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Heroicons](https://heroicons.com/) for icons
- [Headless UI](https://headlessui.com/) for accessible components
- [React Query](https://tanstack.com/query) for state management

## 📞 Support

For questions or support, please:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

---

**Note**: This is a demonstration frontend. The backend services and container orchestration are not included in this demo.