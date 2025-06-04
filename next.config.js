const fs = require('fs');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["mongodb"],

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // Add HTTPS configuration for development only if certificates exist
  server: (() => {
    const certPath = path.join(process.cwd(), 'certs', 'localhost.crt');
    const keyPath = path.join(process.cwd(), 'certs', 'localhost.key');
    
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      return {
        https: {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        },
      };
    }
    return {};
  })(),
}

module.exports = nextConfig
