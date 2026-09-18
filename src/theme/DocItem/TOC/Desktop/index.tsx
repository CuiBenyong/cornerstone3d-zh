import React from 'react'
import Desktop from '@theme-original/DocItem/TOC/Desktop'
import type DesktopType from '@theme/DocItem/TOC/Desktop'
import type { WrapperProps } from '@docusaurus/types'
import AdUnit from '@site/src/components/Ad/AdUnit'
import adStyles from '@site/src/components/Ad/styles.module.css'

type Props = WrapperProps<typeof DesktopType>

/**
 * 在右侧目录下方追加一个广告位。
 *
 * 选这个组件作为挂载点是因为它本身就只在桌面端渲染——DocItem/Layout 里
 * 判断了 windowSize 为 desktop 才渲染它。所以不需要在广告侧另写屏幕宽度判断，
 * 手机端自然不会出现这个广告。
 *
 * 注意目录区域在没有标题时不会渲染（hide_table_of_contents 或 toc 为空），
 * 这种页面上侧栏广告也就不存在，属于预期行为。
 */
export default function DesktopWrapper(props: Props): JSX.Element {
  return (
    <>
      <Desktop {...props} />
      <div className={adStyles.adTocContainer}>
        <AdUnit placement="tocSidebar" />
      </div>
    </>
  )
}
