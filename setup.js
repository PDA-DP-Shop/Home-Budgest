#!/usr/bin/env node

/**
 * HomeBudget Setup Script
 * This script helps you configure Firebase credentials safely
 */

const fs = require('fs');
const path = require('path');

console.log('🏠 HomeBudget Setup Script');
console.log('==========================\n');

// Check if config.local.js already exists
const configPath = path.join(__dirname, 'config.local.js');
const configExists = fs.existsSync(configPath);

if (configExists) {
    console.log('⚠️  config.local.js already exists!');
    console.log('This file contains your Firebase credentials and should not be committed to Git.\n');
    
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            createConfigFile();
        } else {
            console.log('Setup cancelled. Your existing config.local.js will be preserved.');
        }
        rl.close();
    });
} else {
    createConfigFile();
}

function createConfigFile() {
    console.log('📝 Creating Firebase configuration template...\n');
    
    const configTemplate = `// Local Firebase Configuration - DO NOT COMMIT THIS FILE TO GITHUB
// Fill in your Firebase credentials below

const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig };
} else {
    // For browser usage
    window.firebaseConfig = firebaseConfig;
}`;

    try {
        fs.writeFileSync(configPath, configTemplate);
        console.log('✅ config.local.js created successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
        console.log('2. Create a new project or select existing one');
        console.log('3. Go to Project Settings > General');
        console.log('4. Scroll down to "Your apps" section');
        console.log('5. Click "Add app" > Web app');
        console.log('6. Copy the configuration object');
        console.log('7. Replace the placeholder values in config.local.js');
        console.log('8. Start your local server and test the app');
        console.log('\n🔒 Security reminder:');
        console.log('- config.local.js is already in .gitignore');
        console.log('- Never commit this file to version control');
        console.log('- Keep your Firebase credentials secure');
        
    } catch (error) {
        console.error('❌ Error creating config file:', error.message);
        process.exit(1);
    }
}

// Check .gitignore
const gitignorePath = path.join(__dirname, '.gitignore');
if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignoreContent.includes('config.local.js')) {
        console.log('\n⚠️  Warning: config.local.js is not in .gitignore');
        console.log('Adding it now...');
        
        try {
            fs.appendFileSync(gitignorePath, '\n# Local Firebase Configuration\nconfig.local.js\n');
            console.log('✅ Added config.local.js to .gitignore');
        } catch (error) {
            console.error('❌ Error updating .gitignore:', error.message);
        }
    } else {
        console.log('✅ config.local.js is properly ignored in .gitignore');
    }
} else {
    console.log('\n⚠️  .gitignore file not found. Creating one...');
    
    const gitignoreContent = `# Firebase Configuration Files (Sensitive)
config.local.js
firebase-config.js
.env
.env.local
.env.production

# Firebase Cache
.firebase/
firebase-debug.log
firestore-debug.log
ui-debug.log

# Node modules (if using npm)
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/`;
    
    try {
        fs.writeFileSync(gitignorePath, gitignoreContent);
        console.log('✅ .gitignore created successfully');
    } catch (error) {
        console.error('❌ Error creating .gitignore:', error.message);
    }
}

console.log('\n🎉 Setup complete! Happy budgeting! 🏠💰'); 