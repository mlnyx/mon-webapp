import type { NextConfig } from "next";

// GitHub Pages 정적 배포 설정.
// 프로젝트 페이지는 https://<user>.github.io/mon-webapp/ 경로라 basePath 필요.
const repo = "mon-webapp";

const nextConfig: NextConfig = {
  output: "export",
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
