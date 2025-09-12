# VibeCaaS Demo Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Modern GitHub Actions (Recommended)
The main workflow uses the modern GitHub Pages deployment method:

**File**: `.github/workflows/deploy-demo.yml`

**Features**:
- Uses official GitHub Pages actions
- More reliable than third-party actions
- Better error handling
- Automatic artifact management

**How to use**:
1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Check the Actions tab for status

### Option 2: Branch-based Deployment (Alternative)
If the modern method has issues, use the branch-based approach:

**File**: `.github/workflows/deploy-demo-branch.yml`

**Features**:
- Deploys to `gh-pages` branch
- Uses `peaceiris/actions-gh-pages@v3`
- More traditional approach
- Can be easier to troubleshoot

**How to use**:
1. Rename `deploy-demo-branch.yml` to `deploy-demo.yml`
2. Rename the current `deploy-demo.yml` to `deploy-demo-modern.yml`
3. Push to `main` branch

### Option 3: Manual Deployment
For testing or if automated deployment fails:

**Script**: `deploy-to-gh-pages.sh`

```bash
# Run from project root
./deploy-to-gh-pages.sh
```

**Manual steps**:
1. Build: `cd frontend && npm run build`
2. Push to gh-pages branch:
   ```bash
   git subtree push --prefix frontend/out origin gh-pages
   ```

## 🔧 Troubleshooting

### Common Issues

#### 1. Git Process Failed
**Error**: `The process '/usr/bin/git' failed with exit code`

**Solutions**:
- Use the modern GitHub Actions workflow (Option 1)
- Check repository permissions
- Ensure `GITHUB_TOKEN` has proper permissions

#### 2. Build Failures
**Error**: Build step fails

**Solutions**:
- Check Node.js version compatibility
- Verify all dependencies are installed
- Run `npm install --legacy-peer-deps`

#### 3. Pages Not Loading
**Error**: 404 or blank page

**Solutions**:
- Verify `.nojekyll` file exists
- Check file paths in HTML
- Ensure all static assets are included

### Debug Commands

```bash
# Test build locally
cd frontend
npm install --legacy-peer-deps
npm run build
npm run serve-demo

# Check build output
ls -la out/
file out/index.html

# Verify required files
test -f out/.nojekyll
test -f out/404.html
test -f out/index.html
```

## 📁 Required Files

Your build output should include:

```
out/
├── .nojekyll              # Disable Jekyll processing
├── index.html             # Landing page
├── 404.html               # Custom 404 page
├── demo/
│   └── index.html         # Demo application
└── _next/
    └── static/            # Next.js assets
        ├── chunks/        # JavaScript chunks
        ├── css/           # CSS files
        └── media/         # Media assets
```

## 🎯 GitHub Pages Configuration

### Repository Settings
1. Go to Settings > Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` (for branch-based) or `GitHub Actions` (for modern)
4. Folder: `/ (root)`

### Environment Variables
No environment variables needed for the demo (uses mock data).

## 🚀 Deployment Process

### Automatic Deployment
1. Push code to `main` branch
2. GitHub Actions triggers automatically
3. Build completes in ~2-3 minutes
4. Pages available at: `https://username.github.io/repository-name`

### Manual Deployment
1. Run `./deploy-to-gh-pages.sh`
2. Follow the instructions in the output
3. Push to `gh-pages` branch manually

## 📊 Monitoring

### GitHub Actions
- Check the Actions tab for build status
- Review logs for any errors
- Monitor deployment frequency

### GitHub Pages
- Check Pages settings for configuration
- Verify custom domain (if configured)
- Test the live URL

## 🔄 Switching Between Methods

### From Modern to Branch-based
1. Rename `deploy-demo.yml` to `deploy-demo-modern.yml`
2. Rename `deploy-demo-branch.yml` to `deploy-demo.yml`
3. Commit and push changes

### From Branch-based to Modern
1. Rename `deploy-demo.yml` to `deploy-demo-branch.yml`
2. Rename `deploy-demo-modern.yml` to `deploy-demo.yml`
3. Commit and push changes

## 🎉 Success Criteria

Deployment is successful when:
- ✅ Build completes without errors
- ✅ All required files are present in `out/`
- ✅ Demo loads at the correct URL
- ✅ All interactive features work
- ✅ 404 pages redirect properly
- ✅ Mobile responsiveness works

## 📞 Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Verify the build output locally
3. Test with the manual deployment script
4. Review this guide for troubleshooting steps

---

**Last Updated**: September 12, 2024
**Status**: ✅ Multiple deployment options available