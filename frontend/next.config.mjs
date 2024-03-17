/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SERVER_PROTOCOL: process.env.SERVER_PROTOCOL || "http",
    SERVER_HOST: process.env.SERVER_HOST || "localhost",
    SERVER_PORT: process.env.SERVER_PORT || "3001",
  },
  // see https://github.com/vercel/next.js/issues/35822 for why this is false
  reactStrictMode: false,
};

export default nextConfig;
