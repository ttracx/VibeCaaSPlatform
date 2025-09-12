const fs = require('fs');
const path = require('path');

// Create a simple script to generate placeholder WebP frames
// In a real implementation, these would be actual animation frames

const outputDir = path.join(__dirname, '../apps/marketing/public/seq/hero');

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate 120 placeholder frames
for (let i = 0; i < 120; i++) {
  const frameNumber = String(i).padStart(3, '0');
  const fileName = `frame-${frameNumber}.webp`;
  const filePath = path.join(outputDir, fileName);
  
  // Create a simple placeholder file (in reality, these would be WebP images)
  const placeholderContent = `<!-- Placeholder frame ${i} -->`;
  fs.writeFileSync(filePath, placeholderContent);
}

console.log(`Generated 120 placeholder frames in ${outputDir}`);