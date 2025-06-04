const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(process.cwd(), 'certs');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

// Generate private key and certificate
const command = `openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ${path.join(certsDir, 'localhost.key')} -out ${path.join(certsDir, 'localhost.crt')} -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"`;

try {
  execSync(command, { stdio: 'inherit' });
  console.log('✅ Self-signed certificate generated successfully!');
  console.log('Certificate location:', path.join(certsDir, 'localhost.crt'));
  console.log('Private key location:', path.join(certsDir, 'localhost.key'));
} catch (error) {
  console.error('❌ Error generating certificate:', error.message);
  process.exit(1);
} 