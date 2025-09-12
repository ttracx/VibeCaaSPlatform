# GitHub Integration for VibeCaaS

This document describes the GitHub integration feature that allows users to deploy applications directly from their GitHub repositories.

## Features

### 1. GitHub OAuth Authentication
- Secure OAuth 2.0 authentication with GitHub
- Popup-based authentication flow
- Manual authentication fallback for popup blockers
- Access token management

### 2. Repository Selection
- Browse user's GitHub repositories
- Search and filter repositories
- Display repository metadata (language, stars, forks, last updated)
- Support for both public and private repositories

### 3. Repository Analysis
- Automatic detection of programming language
- Dockerfile detection and analysis
- Configuration file parsing (package.json, requirements.txt, go.mod)
- Automatic port and resource suggestions
- Environment variable extraction

### 4. Smart Deployment Configuration
- Auto-populate application settings based on repository analysis
- Support for multiple programming languages:
  - JavaScript/TypeScript (Node.js)
  - Python (Flask/FastAPI)
  - Go
  - Rust
- Docker image generation for repositories with Dockerfiles
- Fallback to base images for repositories without Dockerfiles

## Backend Implementation

### GitHub Service (`/backend/src/services/GitHubService.ts`)
- OAuth URL generation
- Token exchange
- Repository fetching and analysis
- Dockerfile detection and parsing
- Configuration file analysis

### API Routes (`/backend/src/routes/github.ts`)
- `GET /github/auth/url` - Get GitHub OAuth URL
- `POST /github/auth/callback` - Exchange code for access token
- `GET /github/repositories` - Get user repositories
- `GET /github/repositories/:owner/:repo` - Get repository details
- `POST /github/repositories/analyze` - Analyze repository for deployment

### Dependencies
- `@octokit/rest` - GitHub API client
- `@octokit/auth-oauth-app` - OAuth authentication

## Frontend Implementation

### Components
- `GitHubAuth` - OAuth authentication component
- `GitHubRepositorySelector` - Repository selection interface
- `CreateAppModal` - Updated with GitHub integration

### Services
- `githubApi.ts` - Frontend API service for GitHub operations

### Types
- `GitHubRepository` - Repository data structure
- `RepositoryAnalysis` - Analysis results
- `CreateAppFromGitHubRequest` - GitHub deployment request

## Setup Instructions

### 1. GitHub OAuth App Setup
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App with:
   - Application name: VibeCaaS
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3001/auth/github/callback`
3. Copy the Client ID and Client Secret

### 2. Environment Configuration
Create a `.env` file in the backend directory:

```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:3001/auth/github/callback
```

### 3. Install Dependencies
```bash
cd backend
npm install
```

### 4. Start the Application
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## Usage

### 1. Create New Application
1. Click "Create New App" on the dashboard
2. Select "Deploy from GitHub" option
3. Click "Connect GitHub Account" to authenticate
4. Select a repository from the list
5. Review the auto-populated configuration
6. Click "Create Application"

### 2. Repository Analysis
The system automatically analyzes selected repositories to:
- Detect the programming language
- Check for Dockerfile presence
- Parse configuration files
- Suggest appropriate ports and resources
- Extract environment variables

### 3. Supported Repository Types
- **With Dockerfile**: Uses the existing Dockerfile for containerization
- **Without Dockerfile**: Generates appropriate base image based on detected language
- **Multi-language**: Analyzes primary language and suggests configuration

## Security Considerations

- OAuth tokens are not stored permanently
- Repository access is limited to authenticated user's repositories
- Private repository access requires appropriate GitHub permissions
- All API calls are rate-limited and authenticated

## Error Handling

- Network connectivity issues
- GitHub API rate limiting
- Invalid or expired tokens
- Repository access permissions
- Analysis failures with fallback to manual configuration

## Future Enhancements

- Support for more programming languages
- Custom Dockerfile templates
- Branch selection for deployment
- Automatic CI/CD pipeline generation
- Repository webhook integration
- Multi-repository deployment
- Custom build commands
- Environment-specific configurations