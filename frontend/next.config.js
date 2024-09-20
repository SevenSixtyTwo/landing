/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
      unoptimized: true,
    },
  }
  
  module.exports = {
    typescript: {
      ignoreBuildErrors: true,
    },
    distDir: 'out'
  }