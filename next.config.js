/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables are now managed centrally via src/lib/config.ts
  // This provides better validation and type safety
  output: 'standalone'
}

module.exports = nextConfig