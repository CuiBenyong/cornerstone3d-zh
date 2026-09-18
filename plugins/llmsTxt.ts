import fs from 'fs/promises'
import path from 'path'
import type { Plugin } from '@docusaurus/types'

/**
 * 构建结束后生成 /llms.txt。
 *
 * ## 这个文件是做什么的
 *
 * llms.txt 是一个面向大模型的站点地图约定（llmstxt.org）。普通 sitemap.xml 只有 URL，
 * AI 系统要判断某个页面讲什么必须逐个抓取；llms.txt 用 Markdown 把"有哪些页面、
 * 每页讲什么"一次讲清楚，让 AI 在检索阶段就能定位到正确的页面。
 *
 * ## 为什么从构建产物里读，而不是从 docs 目录读
 *
 * 直接读 docs/*.md 的 frontmatter 看起来更直接，但那样就得自己复刻 Docusaurus
 * 的 slug 规则——目录名的数字前缀要剥掉、id 字段会覆盖文件名、index 文件对应目录根路径。
 * 这套规则重写一遍必然和上游产生偏差，而且 Docusaurus 升级时会悄悄失效。
 *
 * 构建产物里的 HTML 文件路径就是真实 URL，title 和 description 也已经是最终结果，
 * 不存在推导错误的可能。代价是这个插件必须在 postBuild 阶段运行，
 * 只在 `yarn build` 时生成，`yarn start` 的开发服务器上访问不到 llms.txt。
 */

/** 分区顺序与标题。未列出的路径会归到"其他"。 */
const SECTIONS: { prefix: string; title: string }[] = [
  { prefix: '/docs/getting-started', title: '快速开始' },
  { prefix: '/docs/tutorials', title: '教程' },
  { prefix: '/docs/concepts', title: '核心概念' },
  { prefix: '/docs/how-to-guides', title: '操作指南' },
  { prefix: '/docs/migration-guides', title: '迁移指南' },
  { prefix: '/docs/contribute', title: '参与贡献' },
]

type PageEntry = {
  url: string
  title: string
  description: string
}

function decodeEntities(input: string): string {
  return input
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    // & 必须最后处理，否则会把上面几个实体的 & 提前解掉
    .replace(/&amp;/g, '&')
}

function extractTitle(html: string): string {
  const match = /<title[^>]*>([^<]*)<\/title>/i.exec(html)
  if (!match) {
    return ''
  }
  // Docusaurus 的 title 形如「页面标题 | 站点标题」，这里只要页面标题部分。
  return decodeEntities(match[1]).split('|')[0].trim()
}

function extractDescription(html: string): string {
  const match =
    /<meta\s+[^>]*name="description"[^>]*content="([^"]*)"/i.exec(html) ??
    /<meta\s+[^>]*content="([^"]*)"[^>]*name="description"/i.exec(html)
  return match ? decodeEntities(match[1]).trim() : ''
}

async function collectHtmlFiles(dir: string, out: string[] = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // assets 目录下是打包产物，没有页面
      if (entry.name === 'assets' || entry.name === 'img') {
        continue
      }
      await collectHtmlFiles(full, out)
    } else if (entry.name === 'index.html') {
      out.push(full)
    }
  }
  return out
}

export default function llmsTxtPlugin(): Plugin<void> {
  return {
    name: 'llms-txt',

    async postBuild({ outDir, siteConfig }) {
      const siteUrl = siteConfig.url.replace(/\/$/, '')
      const files = await collectHtmlFiles(outDir)

      const pages: PageEntry[] = []
      for (const file of files) {
        const relative = path.relative(outDir, file)
        const urlPath = `/${path.dirname(relative)}`.replace(/\/\.$/, '/')

        // 404 页面和搜索页不需要出现在给 AI 的索引里
        if (urlPath.includes('/404') || urlPath.includes('/search')) {
          continue
        }

        const html = await fs.readFile(file, 'utf8')
        const title = extractTitle(html)
        if (!title) {
          continue
        }

        pages.push({
          url: `${siteUrl}${urlPath === '/' ? '/' : urlPath}`,
          title,
          description: extractDescription(html),
        })
      }

      const grouped = new Map<string, PageEntry[]>()
      const others: PageEntry[] = []

      for (const page of pages) {
        const pathname = page.url.slice(siteUrl.length)
        if (pathname === '/') {
          continue
        }
        const section = SECTIONS.find((s) => pathname.startsWith(s.prefix))
        if (section) {
          const list = grouped.get(section.title) ?? []
          list.push(page)
          grouped.set(section.title, list)
        } else {
          others.push(page)
        }
      }

      const lines: string[] = [
        `# ${siteConfig.title}`,
        '',
        `> ${siteConfig.tagline}`,
        '',
        '本站是 Cornerstone3D 官方英文文档（https://www.cornerstonejs.org）的中文翻译。',
        'Cornerstone3D 是用于在浏览器中构建医学影像应用的 JavaScript 库，',
        '涵盖 DICOM 影像加载与解析、GPU 加速渲染、视口与体数据管理、影像标注与分割。',
        '',
      ]

      const sortByUrl = (a: PageEntry, b: PageEntry) =>
        a.url.localeCompare(b.url)

      for (const { title } of SECTIONS) {
        const list = grouped.get(title)
        if (!list?.length) {
          continue
        }
        lines.push(`## ${title}`, '')
        for (const page of list.sort(sortByUrl)) {
          lines.push(
            page.description
              ? `- [${page.title}](${page.url}): ${page.description}`
              : `- [${page.title}](${page.url})`,
          )
        }
        lines.push('')
      }

      if (others.length) {
        lines.push('## 其他', '')
        for (const page of others.sort(sortByUrl)) {
          lines.push(
            page.description
              ? `- [${page.title}](${page.url}): ${page.description}`
              : `- [${page.title}](${page.url})`,
          )
        }
        lines.push('')
      }

      await fs.writeFile(
        path.join(outDir, 'llms.txt'),
        lines.join('\n'),
        'utf8',
      )
    },
  }
}
