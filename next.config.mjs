/** @type {import('next').NextConfig} */
const suffix = process.env.BASE44_PUBLIC_HOST_SUFFIX;

const nextConfig = {
  // Next.js gates dev assets and HMR by Origin. The preview origin is
  // https://3000-<suffix>, so allow that host (and keep localhost for plain local runs).
  allowedDevOrigins: [
    ...(suffix ? [`3000-${suffix}`, `*.${suffix}`] : []),
    'localhost',
    '127.0.0.1',
  ],
};

export default nextConfig;
