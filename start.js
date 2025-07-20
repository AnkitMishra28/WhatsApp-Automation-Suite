const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting WhatsApp Form Collector...\n');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing server dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Server dependencies installed successfully!\n');
  } catch (error) {
    console.error('❌ Failed to install server dependencies');
    process.exit(1);
  }
}

// Check if client/node_modules exists
if (!fs.existsSync('client/node_modules')) {
  console.log('📦 Installing client dependencies...');
  try {
    execSync('npm install', { cwd: 'client', stdio: 'inherit' });
    console.log('✅ Client dependencies installed successfully!\n');
  } catch (error) {
    console.error('❌ Failed to install client dependencies');
    process.exit(1);
  }
}

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('⚙️  Creating .env file from template...');
  try {
    fs.copyFileSync('env.example', '.env');
    console.log('✅ .env file created! Please configure your WhatsApp settings.\n');
  } catch (error) {
    console.error('❌ Failed to create .env file');
    process.exit(1);
  }
}

console.log('🎯 Setup complete! Now you can start the application:\n');
console.log('📱 For development (recommended):');
console.log('   npm run dev:full');
console.log('   This will start both server and React development server\n');
console.log('📱 For production:');
console.log('   npm run build:prod');
console.log('   This will build the React app and start the production server\n');
console.log('🔧 API will be available at: http://localhost:5000/api');
console.log('🌐 Frontend will be available at: http://localhost:3000 (development) or http://localhost:5000 (production)\n');

console.log('💡 Quick start:');
console.log('   npm run dev:full\n'); 