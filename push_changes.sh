#!/bin/bash

# Script to push all changes to main
echo "Adding all changes..."
git add .

echo "Committing changes..."
git commit -m "Add Firecracker MicroVMs and Domain Management features

- Added MicroVM models, schemas, services, and API routes
- Added Domain management with Name.com integration
- Updated frontend with new components and pages
- Added Next.js middleware for auth-gated routes
- Updated GitHub landing page and demo page
- Added comprehensive platform features showcase"

echo "Pushing to main..."
git push origin main

echo "Done!"
