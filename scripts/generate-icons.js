const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../assets/images/icon.svg');
const outputDir = path.join(__dirname, '../assets/images');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);
  
  // Generate main icon (1024x1024)
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, 'icon.png'));
  console.log('Generated icon.png');
  
  // Generate adaptive icon (1024x1024)
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, 'adaptive-icon.png'));
  console.log('Generated adaptive-icon.png');
  
  // Generate splash icon (smaller, centered)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'splash-icon.png'));
  console.log('Generated splash-icon.png');
  
  // Generate favicon
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(outputDir, 'favicon.png'));
  console.log('Generated favicon.png');
  
  console.log('All icons generated!');
}

generateIcons().catch(console.error);
