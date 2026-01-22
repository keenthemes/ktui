#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const npmrcPath = path.join(__dirname, '..', '.npmrc');

// Backup package.json publishConfig
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const publishConfigBackup = packageJson.publishConfig;

// Backup .npmrc if it exists
let npmrcBackup = null;
let npmrcExists = false;
if (fs.existsSync(npmrcPath)) {
  npmrcExists = true;
  npmrcBackup = fs.readFileSync(npmrcPath, 'utf8');
}

try {
  // Remove publishConfig from package.json temporarily
  delete packageJson.publishConfig;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t') + '\n');

  // Temporarily comment out scope registry in .npmrc
  if (npmrcExists && npmrcBackup) {
    const npmrcContent = npmrcBackup
      .split('\n')
      .map(line => {
        // Comment out scope registry lines
        if (line.trim().startsWith('@keenthemes:registry')) {
          return '#' + line;
        }
        return line;
      })
      .join('\n');
    fs.writeFileSync(npmrcPath, npmrcContent);
  }

  // Publish to npmjs.org with explicit registry override
  console.log('Publishing to npmjs.org...');
  const otp = process.argv[2] ? `--otp=${process.argv[2]}` : '';
  const publishCommand = `npm publish --registry https://registry.npmjs.org/ --access public ${otp}`.trim();
  execSync(publishCommand, {
    stdio: 'inherit'
  });
  console.log('✓ Successfully published to npmjs.org');
} catch (error) {
  console.error('✗ Failed to publish to npmjs.org');
  throw error;
} finally {
  // Restore package.json publishConfig
  const restoredPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  restoredPackageJson.publishConfig = publishConfigBackup;
  fs.writeFileSync(packageJsonPath, JSON.stringify(restoredPackageJson, null, '\t') + '\n');
  console.log('✓ Restored publishConfig');

  // Restore .npmrc
  if (npmrcExists && npmrcBackup) {
    fs.writeFileSync(npmrcPath, npmrcBackup);
    console.log('✓ Restored .npmrc');
  }
}
