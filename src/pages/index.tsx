import type { JSX } from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import Heading from '@theme/Heading'
import HomepageFeatures from '@site/src/components/HomepageFeatures'
import SiteNetwork from '@site/src/components/SiteNetwork'
import AdUnit from '@site/src/components/Ad/AdUnit'
import adStyles from '@site/src/components/Ad/styles.module.css'

import styles from './index.module.css'

/** 文档主要入口。同时承担站内链接的作用，让首页把权重分发到各个文档分区。 */
const DOC_SECTIONS = [
  {
    title: '快速开始',
    to: '/docs/getting-started/overview',
    description: '项目范围、相关库、安装方式，以及在 React / Vue / Angular 中的接入方法。',
  },
  {
    title: '核心概念',
    to: '/docs/concepts',
    description: '渲染引擎、视口、影像与体数据、加载器、元数据提供者、缓存与 Web Worker。',
  },
  {
    title: '教程',
    to: '/docs/tutorials/basic-annotation-tool',
    description: '从渲染一组堆栈影像开始，逐步实现标注工具、操作工具与分割工具。',
  },
  {
    title: '操作指南',
    to: '/docs/how-to-guides',
    description: '自定义影像加载器、元数据提供者、工具与体数据加载顺序。',
  },
  {
    title: '迁移指南',
    to: '/docs/migration-guides',
    description: '各主版本之间的破坏性变更与升级步骤，以及从旧版 Cornerstone 迁移的方法。',
  },
  {
    title: '术语对照表',
    to: '/docs/glossary',
    description: '中英文术语对照。按英文 API 名称查找对应的中文译法。',
  },
]

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <p className={styles.heroLede}>
          Cornerstone3D 是一个用于在浏览器中构建医学影像应用的 JavaScript 库。
          它负责 DICOM 数据的解析与加载、影像的 GPU 加速渲染，以及标注和分割工具的交互，
          被 OHIF Viewer 等医学影像平台用作底层渲染内核。
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/getting-started/overview"
          >
            开始阅读
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/tutorials/basic-stack"
          >
            第一个示例
          </Link>
        </div>
      </div>
    </header>
  )
}

function DocSections() {
  return (
    <section className={styles.sections}>
      <div className="container">
        <Heading as="h2" className={styles.sectionHeading}>
          文档导航
        </Heading>
        <div className={styles.sectionGrid}>
          {DOC_SECTIONS.map((section) => (
            <Link
              key={section.to}
              to={section.to}
              className={styles.sectionCard}
            >
              <span className={styles.sectionTitle}>{section.title}</span>
              <span className={styles.sectionDescription}>
                {section.description}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home(): JSX.Element {
  return (
    // 这里刻意不传 title。Docusaurus 的标题格式是「页面标题 | 站点标题」，
    // 传入与站点标题相同的值会得到「Cornerstone3D 中文文档 | Cornerstone3D 中文文档」。
    // 省略 title 时直接使用站点标题，正是首页需要的结果。
    <Layout description="Cornerstone3D 官方文档的完整中文翻译。涵盖 DICOM 影像加载、GPU 加速渲染、视口与体数据、影像标注与分割工具的完整指南。">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <DocSections />
        <div className="container">
          <div className={adStyles.adContainer}>
            <AdUnit placement="articleBottom" />
          </div>
          <SiteNetwork />
        </div>
      </main>
    </Layout>
  )
}
