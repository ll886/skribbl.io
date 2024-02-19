/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        SERVER_PROTOCOL: "http",
        SERVER_HOST: "localhost",
        SERVER_PORT: "3001",
        CLIENT_PROTOCOL: process.env.CLIENT_PROTOCOL,
        CLIENT_HOST: process.env.CLIENT_HOST,
        CLIENT_PORT: process.env.CLIENT_PORT,
      },
};

export default nextConfig;
