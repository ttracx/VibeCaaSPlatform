export interface GitHubRepository {
    id: number;
    name: string;
    fullName: string;
    description: string | null;
    private: boolean;
    htmlUrl: string;
    cloneUrl: string;
    defaultBranch: string;
    language: string | null;
    updatedAt: string;
    stargazersCount: number;
    forksCount: number;
}
export interface RepositoryAnalysis {
    hasDockerfile: boolean;
    dockerfilePath?: string;
    dockerfileContent?: string;
    detectedLanguage: string | null;
    suggestedPort: number;
    suggestedResources: {
        cpu: string;
        memory: string;
    };
    buildCommand?: string;
    startCommand?: string;
    environmentVariables: Record<string, string>;
}
export declare class GitHubService {
    private static octokit;
    static initialize(): void;
    static getUserRepositories(accessToken: string): Promise<GitHubRepository[]>;
    static getRepositoryDetails(accessToken: string, owner: string, repo: string): Promise<GitHubRepository>;
    static analyzeRepository(accessToken: string, owner: string, repo: string, branch?: string): Promise<RepositoryAnalysis>;
    static getOAuthUrl(): Promise<string>;
    static exchangeCodeForToken(code: string): Promise<string>;
}
//# sourceMappingURL=GitHubService.d.ts.map