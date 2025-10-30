/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "inventorymanagement7425.s3.us-west-2.amazonaws.com",
        port: "",
        pathname: "/**", 
      },
    ],
  },
};

export default nextConfig;