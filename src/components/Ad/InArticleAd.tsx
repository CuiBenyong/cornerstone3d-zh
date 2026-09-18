import React, { useEffect, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from '@docusaurus/router'
import { AD_PLACEMENTS, IN_ARTICLE_RULES } from '@site/src/config/ads'
import AdUnit from './AdUnit'
import styles from './styles.module.css'

type Props = {
  /** 指向包裹正文的元素。组件会在它内部寻找 .markdown 容器。 */
  containerRef: RefObject<HTMLElement>
}

/**
 * 正文中部广告。
 *
 * ## 为什么需要操作 DOM
 *
 * 正文是 MDX 编译出来的 React 元素树，作者写的 Markdown 直接决定它的结构。
 * 想把广告插到"第二小节之后"，就得知道小节的边界在哪——而这个信息只存在于
 * 渲染结果里，拿不到对应的 React 元素。
 *
 * 所以这里的做法是：渲染完成后在真实 DOM 里找到插入点，插入一个空的宿主节点，
 * 再用 React portal 把广告渲染进去。广告本身仍然由 React 管理，
 * 手动操作 DOM 的部分仅限于那个空壳容器。
 *
 * 另一种思路是改写 MDX 组件映射、在渲染 h2 时计数并插入广告，但那会让每个
 * 标题都经过广告逻辑，正文渲染和广告投放耦合在一起，反而更难维护。
 */
export default function InArticleAd({ containerRef }: Props) {
  const { pathname } = useLocation()
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!AD_PLACEMENTS.inArticle.enabled) {
      return
    }

    const container = containerRef.current
    if (!container) {
      return
    }

    const markdown =
      container.querySelector<HTMLElement>('.markdown') ?? container

    // 内容太短就不插广告，原因见 src/config/ads.ts 里 IN_ARTICLE_RULES 的说明。
    const textLength = (markdown.textContent ?? '').trim().length
    if (textLength < IN_ARTICLE_RULES.minChars) {
      setHost(null)
      return
    }

    const headings = Array.from(markdown.querySelectorAll('h2'))
    if (headings.length < IN_ARTICLE_RULES.minHeadings) {
      setHost(null)
      return
    }

    // 插到第 N+1 个 h2 之前，也就是读完前 N 个完整小节之后。
    const anchor = headings[IN_ARTICLE_RULES.afterHeadingCount]
    if (!anchor?.parentElement) {
      setHost(null)
      return
    }

    const element = document.createElement('div')
    element.className = styles.adContainer
    anchor.parentElement.insertBefore(element, anchor)
    setHost(element)

    return () => {
      // 换页时必须把宿主节点删掉。留着它会导致两个问题：
      // 旧节点在新页面的正文里成为游离的空容器，
      // 而且 React 会尝试往一个已经不在文档树上的节点里渲染。
      element.remove()
      setHost(null)
    }
    // pathname 作为依赖项：换页后正文内容变了，插入点要重新计算。
  }, [pathname, containerRef])

  if (!host) {
    return null
  }

  return createPortal(<AdUnit placement="inArticle" />, host)
}
