import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// 这个代码运行在 Node.js 环境中 - 请不要在这里使用客户端代码（浏览器 API，JSX 等）

const config: Config = {
  title: 'cornerstone3D 中文文档',
  tagline: 'cornerstone3D',
  favicon: 'img/favicon.ico',

  // 在这里设置你网站的生产 URL
  url: 'https://worldrecently.news',
  // 设置网站的 /<baseUrl>/ 路径
  // 对于 GitHub Pages 部署，通常是 '/<projectName>/'
  baseUrl: '/',

  // GitHub Pages 部署配置。
  // 如果你没有使用 GitHub Pages，则不需要这些配置。
  // organizationName: 'CuiBenyong', // 通常是你的 GitHub 组织/用户名。
  // projectName: 'cornerstone3d-zh', // 通常是你的仓库名。

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // 即使你不使用国际化，也可以通过这个字段设置有用的元数据，
  // 例如 HTML 的 lang 属性。如果你的网站是中文的，
  // 你可能希望将 "en" 替换为 "zh-Hans"。
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans','en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // 请将此路径修改为你的仓库。
          // 如果不需要 "编辑此页面" 链接，请删除此配置。
          editUrl:
            'https://github.com/CuiBenyong/cornerstone3d-zh/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // 请将此路径修改为你的仓库。
          // 如果不需要 "编辑此页面" 链接，请删除此配置。
          editUrl:
            'https://github.com/CuiBenyong/cornerstone3d-zh/tree/main/',
          // 有助于强制执行博客最佳实践的配置
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        }
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // 用你的项目社交卡片替换
    image: 'https://avatars.githubusercontent.com/u/15165477?s=400&u=f73fe33de737d7d314733fe68e61296335fc5cfc&v=4',
    navbar: {
      title: '首页',
      logo: {
        alt: 'Logo',
        src: 'img/cornerstone-logo-badge.png',
      },
      items: [
        {
          // type: 'doc',
          // docId: 'concepts/concepts-index',
          to: '/docs/concepts',
          position: 'left',
          label: '文档',
        },
        {
          // type: 'doc',
          // docId: 'tutorials/basic-annotation-tool',
          to: '/docs/tutorials/basic-annotation-tool',
          position: 'left',
          label: '教程',
        },
        {
          // type: 'doc',
          // docId: 'tutorials/basic-annotation-tool',
          to: '/docs/help',
          position: 'right',
          label: '帮助',
        },
        {
          // type: 'doc',
          // docId: 'tutorials/basic-annotation-tool',
          to: '/docs/faq',
          position: 'right',
          label: 'FAQ',
        },
        // {to: '/blog', label: '博客', position: 'left'},
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
              label: '概念',
              to: '/docs/concepts/cornerstone-core',
            },
            {
              label: '教程',
              to: '/docs/tutorials/basic-annotation-tool',
            },
          ],
        },
        {
          title: '社区',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'X',
              href: 'https://x.com/docusaurus',
            },
          ],
        },
        {
          title: '更多',
          items: [
            // {
            //   label: '博客',
            //   to: '/blog',
            // },
            {
              label: 'GitHub',
              href: 'https://github.com/CuiBenyong/cornerstone3d-zh',
            },
          ],
        },
      ],
      copyright: `版权所有 © ${new Date().getFullYear()} 由 玄一 构建。`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },

  } satisfies Preset.ThemeConfig,
  scripts: [
    {
      src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9580076271637088',
      crossorigin: 'anonymous'
    }
  ]
};

export default config;
