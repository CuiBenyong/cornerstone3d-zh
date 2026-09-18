import React, { useRef } from 'react'
import Content from '@theme-original/DocItem/Content'
import type ContentType from '@theme/DocItem/Content'
import type { WrapperProps } from '@docusaurus/types'
import AdUnit from '@site/src/components/Ad/AdUnit'
import InArticleAd from '@site/src/components/Ad/InArticleAd'
import SiteNetwork from '@site/src/components/SiteNetwork'
import adStyles from '@site/src/components/Ad/styles.module.css'

type Props = WrapperProps<typeof ContentType>

/**
 * 包装文档正文，在其中和其后插入广告与站点导航。
 *
 * 这里用的是 Docusaurus 的 wrap 模式：通过 @theme-original 引入原组件再包一层，
 * 而不是用 swizzle CLI 把官方组件的代码复制出来（eject）。区别在于升级
 * Docusaurus 时，wrap 会自动跟随官方组件的改动，eject 出来的副本则会逐渐腐烂，
 * 需要手动跟进上游的每次修改。
 *
 * 区块顺序：正文 → 底部广告 → 站点导航。广告紧跟正文，站点导航放在最后，
 * 两者之间留有明显间距（见 SiteNetwork 的 margin-top），避免读者把导航卡片
 * 误认为广告的一部分而产生误点击。
 */
export default function ContentWrapper(props: Props): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef}>
      <Content {...props} />

      {/* 正文中部广告。它通过 portal 插入到上方正文内部，不在这里的 DOM 位置渲染。 */}
      <InArticleAd containerRef={containerRef} />

      <div className={adStyles.adContainer}>
        <AdUnit placement="articleBottom" />
      </div>

      <SiteNetwork />
    </div>
  )
}
