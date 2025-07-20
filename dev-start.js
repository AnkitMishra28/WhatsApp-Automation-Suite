const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting WhatsApp Form Collector in development mode...\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('⚠️  .env file not found. Creating from template...');
  try {
    fs.copyFileSync('env.example', '.env');
    console.log('✅ .env file created! Please configure your WhatsApp settings.\n');
  } catch (error) {
    console.error('❌ Failed to create .env file');
    process.exit(1);
  }
}

// Start the server
console.log('🔧 Starting server on port 5000...');
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Wait a bit for server to start, then start client
setTimeout(() => {
  console.log('\n🌐 Starting React development server on port 3000...');
  const client = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true,
    cwd: './client'
  });

  client.on('error', (error) => {
    console.error('❌ Failed to start React client:', error);
  });
}, 3000);

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill();
  process.exit(0);
});

console.log('\n📱 Application will be available at:');
console.log('   Frontend: http://localhost:3000');
console.log('   API: http://localhost:5000/api');
console.log('\n💡 Press Ctrl+C to stop both servers\n'); 