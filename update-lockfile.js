// Script to update pnpm-lock.yaml with the correct checksum
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Updating pnpm-lock.yaml...');

try {
  // Backup the current lockfile
  if (fs.existsSync('pnpm-lock.yaml')) {
    fs.copyFileSync('pnpm-lock.yaml', 'pnpm-lock.yaml.backup');
    console.log('✅ Created backup at pnpm-lock.yaml.backup');
  }

  // Install with --no-frozen-lockfile to update the lockfile
  console.log('📦 Running pnpm install with --no-frozen-lockfile...');
  execSync('pnpm install --no-frozen-lockfile', { stdio: 'inherit' });

  console.log('✅ Successfully updated pnpm-lock.yaml');
  console.log('🚀 You can now commit the updated pnpm-lock.yaml file');
} catch (error) {
  console.error('❌ Error updating lockfile:', error.message);
  
  // Restore backup if something went wrong
  if (fs.existsSync('pnpm-lock.yaml.backup')) {
    fs.renameSync('pnpm-lock.yaml.backup', 'pnpm-lock.yaml');
    console.log('🔄 Restored original pnpm-lock.yaml from backup');
  }
  
  process.exit(1);
}
