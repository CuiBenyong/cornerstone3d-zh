import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'
import { NETWORK_SITES } from './src/config/siteNetwork'
import llmsTxtPlugin from './plugins/llmsTxt'

// 这个代码运行在 Node.js 环境中 - 请不要在这里使用客户端代码（浏览器 API，JSX 等）

const SITE_URL = 'https://cornerstone3d-zh.front-end-js.top'

const SITE_DESCRIPTION =
  'Cornerstone3D 官方文档的完整中文翻译。Cornerstone3D 是用于 Web 端医学影像可视化的 JavaScript 库，支持 DICOM 解析、GPU 加速渲染、多平面重建、影像标注与分割。'

/** 从站点网络配置生成 footer 链接，避免 URL 和文案在两处重复维护。 */
const networkFooterItems = NETWORK_SITES.map((site) => ({
  label: `${site.name} · ${site.tagline}`,
  href: site.url,
}))

/**
 * 站点级结构化数据。
 *
 * author.sameAs 把同一作者名下的几个站点关联起来。这是站点互链在结构化数据
 * 层面的对应物：页面上的链接告诉读者这些站点相关，sameAs 则告诉搜索引擎
 * 它们属于同一个作者实体。
 */
const siteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Cornerstone3D 中文文档',
  alternateName: 'cornerstone3d-zh',
  url: SITE_URL,
  inLanguage: 'zh-Hans',
  description: SITE_DESCRIPTION,
  author: {
    '@type': 'Person',
    name: '玄一',
    url: 'https://front-end-js.top',
    sameAs: [
      'https://blog.front-end-js.top',
      'https://course.front-end-js.top',
      'https://github.com/CuiBenyong',
    ],
  },
  about: {
    '@type': 'SoftwareSourceCode',
    name: 'Cornerstone3D',
    codeRepository: 'https://github.com/cornerstonejs/cornerstone3D',
    programmingLanguage: 'TypeScript',
  },
}

const config: Config = {
  title: 'Cornerstone3D 中文文档',
  tagline: 'Web 医学影像可视化库 · DICOM 渲染、标注与分割',
  favicon: 'img/favicon.ico',

  // 在这里设置你网站的生产 URL
  url: SITE_URL,
  // 设置网站的 /<baseUrl>/ 路径
  baseUrl: '/',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  /**
   * 只声明中文一个 locale。
   *
   * 之前这里同时声明了 'en'，但项目里没有 i18n 目录，也就没有任何英文翻译。
   * 结果是构建会额外产出一份 /en/ 目录：96 个页面，标着 lang="en"，
   * 内容却全是中文，并且带有自己的 sitemap.xml 主动提交给搜索引擎。
   * 这等于告诉 Google 全站内容都有两个地址，同时语言标注还是错的。
   */
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/CuiBenyong/cornerstone3d-zh/tree/main/',
          /**
           * 从 git 提交记录里取每篇文档的最后更新时间。
           * 一是显示给读者，二是供 sitemap 的 lastmod 和 TechArticle 结构化数据的
           * dateModified 使用——lastmod 是少数几个 Google 确实会参考的 sitemap 字段。
           */
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/CuiBenyong/cornerstone3d-zh/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          lastmod: 'date',
          /**
           * changefreq 和 priority 都设为 null，让它们不出现在 sitemap 里。
           *
           * 这两个字段 Google 已经明确不再使用——plugin-sitemap 的源码注释里
           * 直接写着 "as of 2024, Google ignores this value"，Docusaurus 也计划
           * 在 v4 移除这两个选项。之前全站 priority 统一写 0.5 属于无效配置，
           * 改成分层数值同样无效，所以干脆不输出，让 sitemap 只保留有用的信息。
           */
          changefreq: null,
          priority: null,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
          createSitemapItems: async ({ defaultCreateSitemapItems, ...rest }) => {
            const items = await defaultCreateSitemapItems(rest)
            // 搜索页没有独立内容价值，从 sitemap 里剔除，
            // 把抓取预算留给真正的文档页。
            return items.filter((item) => !item.url.includes('/search'))
          },
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [llmsTxtPlugin],

  headTags: [
    /**
     * 提前建立到广告服务器的连接。
     * 广告脚本是异步加载的，DNS 解析和 TLS 握手先做掉可以让广告更快出现，
     * 而广告出现得越早，进入可见区域的概率越高。
     */
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://pagead2.googlesyndication.com',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'dns-prefetch',
        href: 'https://googleads.g.doubleclick.net',
      },
    },
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify(siteStructuredData),
    },
  ],

  themeConfig: {
    image: 'img/og-cover.png',
    metadata: [
      { name: 'description', content: SITE_DESCRIPTION },
      {
        name: 'keywords',
        content:
          'Cornerstone3D,Cornerstone3D 中文文档,医学影像,DICOM,DICOMweb,医学影像可视化,影像标注,影像分割,WebGL 医学影像,cornerstonejs',
      },
      { name: 'author', content: '玄一' },
      { property: 'og:locale', content: 'zh_CN' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    navbar: {
      title: 'Cornerstone3D 中文文档',
      logo: {
        alt: 'Cornerstone3D',
        src: 'img/cornerstone-logo-badge.png',
      },
      items: [
        {
          to: '/docs/concepts',
          position: 'left',
          label: '文档',
        },
        {
          to: '/docs/tutorials/basic-annotation-tool',
          position: 'left',
          label: '教程',
        },
        {
          to: '/docs/glossary',
          position: 'left',
          label: '术语对照',
        },
        {
          to: '/docs/help',
          position: 'right',
          label: '帮助',
        },
        {
          to: '/docs/faq',
          position: 'right',
          label: 'FAQ',
        },
        {
          href: 'https://course.front-end-js.top',
          label: '逐日AI',
          position: 'right',
        },
        {
          href: 'https://github.com/CuiBenyong/cornerstone3d-zh',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '文档',
          items: [
            {
              label: '快速开始',
              to: '/docs/getting-started/overview',
            },
            {
              label: '核心概念',
              to: '/docs/concepts',
            },
            {
              label: '教程',
              to: '/docs/tutorials/basic-annotation-tool',
            },
            {
              label: '术语对照表',
              to: '/docs/glossary',
            },
          ],
        },
        {
          /**
           * 这一栏原先放的是 Docusaurus 官方的 Stack Overflow、Discord 和 X 链接
           * （模板自带内容）。那些链接与 Cornerstone3D 毫无关系，既帮不到读者，
           * 还把本站的链接权重白送给了 Docusaurus 项目。
           */
          title: 'Cornerstone3D',
          items: [
            {
              label: '官方英文文档',
              href: 'https://www.cornerstonejs.org/',
            },
            {
              label: '官方仓库',
              href: 'https://github.com/cornerstonejs/cornerstone3D',
            },
            {
              label: '在线示例',
              href: 'https://www.cornerstonejs.org/live-examples/',
            },
          ],
        },
        {
          title: '站点网络',
          items: networkFooterItems,
        },
        {
          title: '本站',
          items: [
            {
              label: '翻译仓库',
              href: 'https://github.com/CuiBenyong/cornerstone3d-zh',
            },
          ],
        },
      ],
      copyright: `版权所有 © ${new Date().getFullYear()} 由 玄一 构建。本站为 Cornerstone3D 官方文档的中文翻译，内容版权归原作者所有。`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,

  scripts: [
    {
      src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9580076271637088',
      /**
       * async 必须显式声明。
       *
       * Docusaurus 会把这里的属性原样透传到 script 标签上，不会自动补 async
       * （见 @docusaurus/core 的 createBootstrapPlugin）。所以之前这个脚本是
       * head 里的同步阻塞脚本，会挡住首屏渲染——Google 官方代码片段本身就带 async，
       * 漏掉它既拖慢 LCP，也因为内容出现得晚而降低广告可见性评分。
       */
      async: true,
      crossorigin: 'anonymous',
    },
  ],
}

export default config
