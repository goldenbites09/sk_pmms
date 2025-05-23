// Debug script to help identify build issues
const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Starting build debug process...');
console.log('📦 Node version:', process.version);
console.log('🔧 Environment:', process.env.NODE_ENV);

try {
  console.log('📋 Listing package.json dependencies:');
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  console.log(JSON.stringify(packageJson.dependencies, null, 2));
  
  console.log('\n🔄 Running Next.js build with verbose logging...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('\n✅ Build completed successfully!');
} catch (error) {
  console.error('\n❌ Build failed with error:', error.message);
  process.exit(1);
}
