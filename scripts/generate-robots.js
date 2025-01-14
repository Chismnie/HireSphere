// scripts/generate-robots.ts
import { writeFileSync } from "fs";
import { fileURLToPath } from 'url';
import { dirname, resolve } from "path";

// 获取 __dirname 的等效值
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://yanmengsss.xyz/sitemap.xml`;

writeFileSync(resolve(__dirname, "../dist/robots.txt"), robotsTxt);
console.log("Robots.txt generated successfully!");
