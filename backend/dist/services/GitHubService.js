"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubService = void 0;
const rest_1 = require("@octokit/rest");
const auth_oauth_app_1 = require("@octokit/auth-oauth-app");
const logger_1 = require("../utils/logger");
class GitHubService {
    static initialize() {
        const githubAppId = process.env.GITHUB_APP_ID;
        const githubClientId = process.env.GITHUB_CLIENT_ID;
        const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
        const githubPrivateKey = process.env.GITHUB_PRIVATE_KEY;
        if (!githubClientId || !githubClientSecret) {
            logger_1.logger.warn('GitHub OAuth credentials not configured');
            return;
        }
        this.octokit = new rest_1.Octokit({
            authStrategy: auth_oauth_app_1.createOAuthAppAuth,
            auth: {
                clientType: 'oauth-app',
                clientId: githubClientId,
                clientSecret: githubClientSecret,
            },
        });
    }
    static async getUserRepositories(accessToken) {
        try {
            const octokit = new rest_1.Octokit({
                auth: accessToken,
            });
            const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
                per_page: 100,
                sort: 'updated',
                type: 'all',
            });
            return repos.map(repo => ({
                id: repo.id,
                name: repo.name,
                fullName: repo.full_name,
                description: repo.description,
                private: repo.private,
                htmlUrl: repo.html_url,
                cloneUrl: repo.clone_url,
                defaultBranch: repo.default_branch,
                language: repo.language,
                updatedAt: repo.updated_at,
                stargazersCount: repo.stargazers_count,
                forksCount: repo.forks_count,
            }));
        }
        catch (error) {
            logger_1.logger.error('Failed to fetch user repositories:', error);
            throw new Error('Failed to fetch repositories');
        }
    }
    static async getRepositoryDetails(accessToken, owner, repo) {
        try {
            const octokit = new rest_1.Octokit({
                auth: accessToken,
            });
            const { data } = await octokit.rest.repos.get({
                owner,
                repo,
            });
            return {
                id: data.id,
                name: data.name,
                fullName: data.full_name,
                description: data.description,
                private: data.private,
                htmlUrl: data.html_url,
                cloneUrl: data.clone_url,
                defaultBranch: data.default_branch,
                language: data.language,
                updatedAt: data.updated_at,
                stargazersCount: data.stargazers_count,
                forksCount: data.forks_count,
            };
        }
        catch (error) {
            logger_1.logger.error(`Failed to fetch repository details for ${owner}/${repo}:`, error);
            throw new Error('Failed to fetch repository details');
        }
    }
    static async analyzeRepository(accessToken, owner, repo, branch) {
        try {
            const octokit = new rest_1.Octokit({
                auth: accessToken,
            });
            const defaultBranch = branch || (await this.getRepositoryDetails(accessToken, owner, repo)).defaultBranch;
            let hasDockerfile = false;
            let dockerfilePath = 'Dockerfile';
            let dockerfileContent = '';
            try {
                const { data: dockerfileData } = await octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path: 'Dockerfile',
                    ref: defaultBranch,
                });
                if (dockerfileData && 'content' in dockerfileData) {
                    hasDockerfile = true;
                    dockerfileContent = Buffer.from(dockerfileData.content, 'base64').toString();
                }
            }
            catch (error) {
                const dockerfileNames = ['Dockerfile.dev', 'Dockerfile.prod', 'docker/Dockerfile'];
                for (const dockerfileName of dockerfileNames) {
                    try {
                        const { data: dockerfileData } = await octokit.rest.repos.getContent({
                            owner,
                            repo,
                            path: dockerfileName,
                            ref: defaultBranch,
                        });
                        if (dockerfileData && 'content' in dockerfileData) {
                            hasDockerfile = true;
                            dockerfilePath = dockerfileName;
                            dockerfileContent = Buffer.from(dockerfileData.content, 'base64').toString();
                            break;
                        }
                    }
                    catch (e) {
                    }
                }
            }
            let detectedLanguage = null;
            let buildCommand;
            let startCommand;
            const environmentVariables = {};
            try {
                const { data: packageJsonData } = await octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path: 'package.json',
                    ref: defaultBranch,
                });
                if (packageJsonData && 'content' in packageJsonData) {
                    const packageJson = JSON.parse(Buffer.from(packageJsonData.content, 'base64').toString());
                    detectedLanguage = 'JavaScript';
                    if (packageJson.scripts) {
                        buildCommand = packageJson.scripts.build;
                        startCommand = packageJson.scripts.start;
                    }
                    if (packageJson.engines?.node) {
                        environmentVariables.NODE_VERSION = packageJson.engines.node;
                    }
                }
            }
            catch (error) {
            }
            try {
                const { data: requirementsData } = await octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path: 'requirements.txt',
                    ref: defaultBranch,
                });
                if (requirementsData && 'content' in requirementsData) {
                    detectedLanguage = 'Python';
                    environmentVariables.PYTHON_VERSION = '3.11';
                }
            }
            catch (error) {
            }
            try {
                const { data: goModData } = await octokit.rest.repos.getContent({
                    owner,
                    repo,
                    path: 'go.mod',
                    ref: defaultBranch,
                });
                if (goModData && 'content' in goModData) {
                    detectedLanguage = 'Go';
                    environmentVariables.GO_VERSION = '1.21';
                }
            }
            catch (error) {
            }
            let suggestedPort = 3000;
            let suggestedResources = { cpu: '500m', memory: '512Mi' };
            if (detectedLanguage === 'Python') {
                suggestedPort = 8000;
                suggestedResources = { cpu: '500m', memory: '512Mi' };
            }
            else if (detectedLanguage === 'Go') {
                suggestedPort = 8080;
                suggestedResources = { cpu: '250m', memory: '256Mi' };
            }
            else if (detectedLanguage === 'JavaScript') {
                suggestedPort = 3000;
                suggestedResources = { cpu: '500m', memory: '512Mi' };
            }
            return {
                hasDockerfile,
                dockerfilePath,
                dockerfileContent,
                detectedLanguage,
                suggestedPort,
                suggestedResources,
                buildCommand,
                startCommand,
                environmentVariables,
            };
        }
        catch (error) {
            logger_1.logger.error(`Failed to analyze repository ${owner}/${repo}:`, error);
            throw new Error('Failed to analyze repository');
        }
    }
    static async getOAuthUrl() {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3001/auth/github/callback';
        if (!clientId) {
            throw new Error('GitHub OAuth not configured');
        }
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: 'repo,read:user',
            state: Math.random().toString(36).substring(7),
        });
        return `https://github.com/login/oauth/authorize?${params.toString()}`;
    }
    static async exchangeCodeForToken(code) {
        try {
            const response = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code,
                }),
            });
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error_description || data.error);
            }
            return data.access_token;
        }
        catch (error) {
            logger_1.logger.error('Failed to exchange code for token:', error);
            throw new Error('Failed to authenticate with GitHub');
        }
    }
}
exports.GitHubService = GitHubService;
//# sourceMappingURL=GitHubService.js.map