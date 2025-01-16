import { writeFileSync } from 'fs';

// 定义网站的 URL 列表
const urls = [
    'https://yanmengsss.xyz/home',
    'https://yanmengsss.xyz/hiresphere',
    'https://yanmengsss.xyz/login'
];

// 将 URL 列表转换为字符串，每个 URL 占一行
const sitemapContent = urls.join('\n');

// 写入文件
writeFileSync('public/Sitemap.txt', sitemapContent);

console.log('Sitemap.txt has been generated successfully!'); 