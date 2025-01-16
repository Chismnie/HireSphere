// scripts/generate-sitemap.js
import { writeFileSync } from "fs";
import { fileURLToPath } from 'url';
import { dirname, resolve } from "path";

// 获取 __dirname 的等效值
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const domain = "https://yanmengsss.xyz";
// 定义你的路由
const routes = [
  {
    path: "/home",
    priority: 1,
    changefreq: "weekly",
  },
  {
    path: "/login",
    priority: 0.8,
    changefreq: "weekly",
  },
  // 添加更多路由
];

function generateSitemap() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${routes
        .map(
          (route) => `
        <url>
          <loc>${domain}${route.path}</loc>
          <changefreq>${route.changefreq}</changefreq>
          <priority>${route.priority}</priority>
          <lastmod>${new Date().toISOString()}</lastmod>
        </url>
      `
        )
        .join("")}
    </urlset>`;

  writeFileSync(resolve(__dirname, "../dist/sitemap.xml"), sitemap);
  console.log("Sitemap generated successfully!");
}

generateSitemap();
