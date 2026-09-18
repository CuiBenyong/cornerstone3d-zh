import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import { NETWORK_SITES } from '@site/src/config/siteNetwork'
import styles from './styles.module.css'

type Props = {
  className?: string
  /** 标题文案，不同位置可能需要不同说法 */
  heading?: string
}

/**
 * 站点网络卡片组。
 *
 * 放在文档页底部——读者读完一页后正处在"接下来看什么"的状态，
 * 这时给出相关站点是有用的信息；放在顶部则会打断阅读。
 *
 * 用 Link 而非原生 a 标签：Docusaurus 的 Link 会自动识别外链并处理
 * target 与 rel 属性。
 */
export default function SiteNetwork({
  className,
  heading = '作者的其他站点',
}: Props) {
  return (
    <nav className={clsx(styles.network, className)} aria-label={heading}>
      {/*
        这里用 p 而不是 h2。这个区块会出现在全部一百多个文档页的底部，
        如果用标题元素，每页的标题结构里都会多出一个和文档内容无关的条目，
        稀释真正的内容标题。无障碍方面由 nav 的 aria-label 提供地标名称。
      */}
      <p className={styles.heading}>{heading}</p>
      <ul className={styles.grid}>
        {NETWORK_SITES.map((site) => (
          <li key={site.id} className={styles.item}>
            <Link className={styles.card} to={site.url}>
              <span className={styles.badge}>{site.badge}</span>
              <span className={styles.name}>{site.name}</span>
              <span className={styles.tagline}>{site.tagline}</span>
              <span className={styles.description}>{site.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
