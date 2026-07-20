import withPWA from "@ducanh2912/next-pwa";

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  sw: "sw.js",
  scope: "/",
});

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

export default withPWAConfig(nextConfig);
