const { spawn } = require('child_process');
const ngrok = require('ngrok');

async function startTunnel() {
  try {
    // Start Next.js development server
    const nextProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    // Wait for Next.js to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Start ngrok tunnel
    const url = await ngrok.connect({
      addr: 3000,
      proto: 'http'
    });

    console.log('\n🚀 Your app is now available at:');
    console.log(`🌐 Public URL: ${url}`);
    console.log('\n⚠️  Note: The URL will change each time you restart ngrok');
    console.log('📝 To use a fixed URL, sign up for a free ngrok account at https://ngrok.com\n');

    // Handle process termination
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down...');
      await ngrok.kill();
      nextProcess.kill();
      process.exit();
    });

  } catch (error) {
    console.error('❌ Error starting tunnel:', error.message);
    process.exit(1);
  }
}

startTunnel(); 