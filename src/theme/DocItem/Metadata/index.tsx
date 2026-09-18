import type { JSX } from 'react'
import React from 'react'
import Metadata from '@theme-original/DocItem/Metadata'
import type MetadataType from '@theme/DocItem/Metadata'
import type { WrapperProps } from '@docusaurus/types'
import Head from '@docusaurus/Head'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { useDoc } from '@docusaurus/plugin-content-docs/client'

type Props = WrapperProps<typeof MetadataType>

/**
 * 给每个文档页输出 TechArticle 结构化数据。
 *
 * ## 为什么只有 TechArticle，没有 BreadcrumbList
 *
 * Docusaurus 自带的 DocBreadcrumbs 组件已经用 microdata 的形式
 * （itemScope / itemType="https://schema.org/BreadcrumbList"）输出了面包屑结构化数据。
 * 如果这里再输出一份 JSON-LD 格式的 BreadcrumbList，同一个页面上就有两处
 * 互相竞争的面包屑声明，搜索引擎无法确定该采信哪一个。所以面包屑交给官方组件，
 * 这里只补它没有覆盖的文章级信息。
 *
 * ## translationOfWork 的作用
 *
 * 本站是官方英文文档的中文翻译。translationOfWork 显式声明了这个来源关系，
 * 好处是让搜索引擎和 AI 系统理解这是一份有出处的翻译，而不是抓取来的重复内容。
 *
 * 这个字段的值来自各页 frontmatter 里的 upstream 字段，不做路径推导。
 * 推导虽然可行（本站 slug 与官方一致），但少数页面在官方文档里并不存在，
 * 推导会生成指向 404 的链接——宁可不输出这个字段，也不能输出错的。
 */
export default function MetadataWrapper(props: Props): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  const { metadata, frontMatter } = useDoc()

  const absoluteUrl = `${siteConfig.url.replace(/\/$/, '')}${metadata.permalink}`
  const upstream = (frontMatter as { upstream?: string }).upstream

  // showLastUpdateTime 打开后 Docusaurus 会从 git 提交记录里取出这个时间戳。
  // 类型定义里没有声明它，所以这里断言读取。
  //
  // 单位是毫秒，不是秒。Docusaurus 在 getFileCommitDate 里已经做过
  // `timestampInSeconds * 1000` 的转换。这里如果再乘一次 1000，
  // 输出的 dateModified 会变成公元 56898 年——结构化数据里带一个这样的日期，
  // 比不输出 dateModified 更糟。
  const lastUpdatedAt = (metadata as { lastUpdatedAt?: number }).lastUpdatedAt

  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: metadata.title,
    url: absoluteUrl,
    inLanguage: 'zh-Hans',
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.title,
      url: siteConfig.url,
    },
    about: {
      '@type': 'SoftwareSourceCode',
      name: 'Cornerstone3D',
      codeRepository: 'https://github.com/cornerstonejs/cornerstone3D',
      programmingLanguage: 'TypeScript',
      applicationCategory: '医学影像',
    },
  }

  if (metadata.description) {
    structuredData.description = metadata.description
  }

  if (upstream) {
    structuredData.translationOfWork = {
      '@type': 'TechArticle',
      url: upstream,
      inLanguage: 'en',
    }
  }

  if (typeof lastUpdatedAt === 'number') {
    const modified = new Date(lastUpdatedAt)
    const year = modified.getUTCFullYear()
    // 只在日期落在合理区间时才输出。这道检查是为了兜住时间戳单位搞错这类问题——
    // 宁可缺一个字段，也不要让搜索引擎读到一个荒谬的日期。
    if (year >= 2015 && year <= new Date().getUTCFullYear() + 1) {
      structuredData.dateModified = modified.toISOString()
    }
  }

  return (
    <>
      <Metadata {...props} />
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Head>
    </>
  )
}
