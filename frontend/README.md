# VibeCaaS Frontend

A modern, feature-rich frontend for the VibeCaaS (Vibe as a Service) platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🚀 **AI-Powered Development**: Integrated AI agents for code generation and debugging
- 🌐 **Domain Management**: Search, purchase, and manage domains
- 💻 **MicroVM Dashboard**: Deploy and manage micro virtual machines
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 🔄 **Real-time Updates**: WebSocket integration for live updates
- 📊 **Resource Monitoring**: Track CPU, memory, and storage usage
- 🔐 **Secure Authentication**: GitHub OAuth integration
- 💳 **Payment Processing**: Stripe integration for subscriptions

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ttracx/VibeCaaSPlatform.git
cd VibeCaaSPlatform/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Edit `.env.local` with your configuration values.

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm run start
```

## Project Structure

```
frontend/
├── app/                    # Next.js 14 app directory
│   ├── dashboard/         # Dashboard pages
│   ├── demo/             # Demo pages
│   ├── domains/          # Domain management
│   ├── microvms/         # MicroVM management
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── ...              # Feature components
├── src/                 # Additional source files
│   ├── components/      # Additional components
│   ├── services/        # API services
│   └── types/           # TypeScript types
├── lib/                 # Utility functions
├── public/              # Static assets
└── styles/              # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:e2e` - Run E2E tests with Cypress

## Technologies Used

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: TanStack Query (React Query)
- **Icons**: Lucide React, Heroicons
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Date Handling**: date-fns
- **Markdown**: react-markdown
- **Code Editor**: Monaco Editor
- **Real-time**: Socket.io, Yjs
- **Payments**: Stripe

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_WS_URL`: WebSocket server URL
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `STRIPE_PUBLIC_KEY`: Stripe public key
- `GITHUB_CLIENT_ID`: GitHub OAuth client ID

## API Integration

The frontend connects to the VibeCaaS backend API. Ensure the backend is running at the URL specified in `NEXT_PUBLIC_API_URL`.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Set environment variables
4. Deploy

### Docker

```bash
docker build -t vibecaas-frontend .
docker run -p 3000:3000 vibecaas-frontend
```

### Manual Deployment

1. Build the application: `npm run build`
2. Copy the `.next`, `public`, and `package.json` to your server
3. Install production dependencies: `npm install --production`
4. Start the server: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub or contact the maintainers.

## Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- shadcn for the beautiful UI components
- All contributors and open source projects used