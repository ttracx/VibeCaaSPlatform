"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const GitHubService_1 = require("../services/GitHubService");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
const repositoryAnalysisSchema = joi_1.default.object({
    owner: joi_1.default.string().required(),
    repo: joi_1.default.string().required(),
    branch: joi_1.default.string().optional()
});
router.get('/auth/url', async (req, res, next) => {
    try {
        const authUrl = await GitHubService_1.GitHubService.getOAuthUrl();
        res.json({ authUrl });
    }
    catch (error) {
        next(error);
    }
});
router.post('/auth/callback', async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }
        const accessToken = await GitHubService_1.GitHubService.exchangeCodeForToken(code);
        res.json({
            accessToken,
            message: 'Successfully authenticated with GitHub'
        });
    }
    catch (error) {
        logger_1.logger.error('GitHub OAuth callback error:', error);
        next(error);
    }
});
router.get('/repositories', async (req, res, next) => {
    try {
        const { accessToken } = req.query;
        if (!accessToken || typeof accessToken !== 'string') {
            return res.status(400).json({ error: 'Access token is required' });
        }
        const repositories = await GitHubService_1.GitHubService.getUserRepositories(accessToken);
        res.json(repositories);
    }
    catch (error) {
        logger_1.logger.error('Failed to fetch repositories:', error);
        next(error);
    }
});
router.get('/repositories/:owner/:repo', async (req, res, next) => {
    try {
        const { accessToken } = req.query;
        const { owner, repo } = req.params;
        if (!accessToken || typeof accessToken !== 'string') {
            return res.status(400).json({ error: 'Access token is required' });
        }
        const repository = await GitHubService_1.GitHubService.getRepositoryDetails(accessToken, owner, repo);
        res.json(repository);
    }
    catch (error) {
        logger_1.logger.error(`Failed to fetch repository ${owner}/${repo}:`, error);
        next(error);
    }
});
router.post('/repositories/analyze', async (req, res, next) => {
    try {
        const { error, value } = repositoryAnalysisSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { accessToken } = req.query;
        if (!accessToken || typeof accessToken !== 'string') {
            return res.status(400).json({ error: 'Access token is required' });
        }
        const { owner, repo, branch } = value;
        const analysis = await GitHubService_1.GitHubService.analyzeRepository(accessToken, owner, repo, branch);
        res.json(analysis);
    }
    catch (error) {
        logger_1.logger.error(`Failed to analyze repository ${req.body.owner}/${req.body.repo}:`, error);
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=github.js.map