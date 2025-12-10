#!/usr/bin/env node

/**
 * Auto-update frontend Amplify config after backend deployment
 * 
 * Usage:
 *   AMPLIFY_APP_ID=xxx npm run update:frontend
 *   or
 *   node scripts/update-frontend-config.js YOUR_APP_ID
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BACKEND_DIR = path.join(__dirname, '..');
const FRONTEND_DIR = path.join(BACKEND_DIR, '..', 'newtodo');
const CONFIG_DIR = path.join(FRONTEND_DIR, 'lib', 'config');

// Get App ID from environment or argument
const APP_ID = process.env.AMPLIFY_APP_ID || process.argv[2];

if (!APP_ID) {
    console.error('❌ Error: Amplify App ID required');
    console.error('Usage: AMPLIFY_APP_ID=xxx npm run update:frontend');
    console.error('   or: node scripts/update-frontend-config.js YOUR_APP_ID');
    process.exit(1);
}

console.log('🔄 Updating frontend production config...');
console.log(`📦 App ID: ${APP_ID}`);

// Check if frontend directory exists
if (!fs.existsSync(FRONTEND_DIR)) {
    console.error(`❌ Error: Frontend directory not found at ${FRONTEND_DIR}`);
    process.exit(1);
}

try {
    // Generate production outputs
    console.log('📥 Generating Amplify outputs...');
    execSync(
        `npx ampx generate outputs --app-id ${APP_ID} --branch main --format dart --out-dir ${CONFIG_DIR}`,
        { cwd: BACKEND_DIR, stdio: 'inherit' }
    );

    // Rename to prod config
    const generatedFile = path.join(CONFIG_DIR, 'amplify_outputs.dart');
    const prodFile = path.join(CONFIG_DIR, 'amplify_outputs_prod.dart');

    if (fs.existsSync(generatedFile)) {
        fs.renameSync(generatedFile, prodFile);
        console.log('✅ Production config updated successfully!');
        console.log(`📄 File: ${prodFile}`);
    } else {
        console.error('❌ Error: Config file was not generated');
        process.exit(1);
    }

    // Check if we should commit
    if (fs.existsSync(path.join(FRONTEND_DIR, '.git'))) {
        console.log('\n💡 Tip: Commit and push the changes:');
        console.log(`   cd ${FRONTEND_DIR}`);
        console.log('   git add lib/config/amplify_outputs_prod.dart');
        console.log('   git commit -m "chore: update production Amplify config"');
        console.log('   git push');
    }

    console.log('\n🎉 Done! Frontend is ready to use production config.');
    console.log(`Run: cd ${FRONTEND_DIR} && flutter run --dart-define=ENVIRONMENT=prod`);

} catch (error) {
    console.error('❌ Error updating frontend config:', error.message);
    process.exit(1);
}
