import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  serverExternalPackages: ["jspdf", "pdf-parse", "mammoth", "word-extractor"],
};

export default nextConfig;
