import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ['nodemailer', 'pdf-lib', 'qrcode', 'archiver', 'sharp'],
  // Instrumentation hook — tourne au démarrage serveur (escalade auto)
  // Next.js 16 active instrumentation par défaut si src/instrumentation.ts existe
  typescript: {
    ignoreBuildErrors: true,
  },
  // Next.js 16: la clé `eslint.ignoreDuringBuilds` n'est plus supportée ici.
  // Pour ignorer le lint pendant le build, on passe --no-lint au CLI (voir Dockerfile).
  reactStrictMode: false,
  images: {
    formats: ['image/webp'],
    qualities: [75, 90],
  },
};

export default nextConfig;
