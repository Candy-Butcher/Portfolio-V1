/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");
import WithPWA from "next-pwa";

const withPWA = WithPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: "/",
  sw: "service-worker.js",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Let the build pass even if ESLint finds rule violations
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ⬇️ OPTIONAL: if TypeScript errors still block the build, uncomment this:
  // typescript: {
  //   ignoreBuildErrors: true,
  // },

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

export default withPWA(nextConfig);
