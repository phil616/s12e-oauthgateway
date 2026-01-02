/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['jose'],
  // Configure runtime for specific routes
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig
