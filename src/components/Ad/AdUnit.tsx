import React, { useEffect, useRef } from 'react'
import clsx from 'clsx'
import useIsBrowser from '@docusaurus/useIsBrowser'
import { useLocation } from '@docusaurus/router'
import {
  AD_CLIENT,
  AD_PLACEMENTS,
  isAdAllowedOnPath,
  type AdPlacementName,
} from '@site/src/config/ads'
import styles from './styles.module.css'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

type Props = {
  placement: AdPlacementName
  className?: string
}

/**
 * 单个广告位。
 *
 * 这个组件被设计成"一次性"的：挂载时填充一次，之后不再尝试刷新自己。
 * 换页时的更新由外层 AdUnit 通过 key 强制重建来完成，见下方说明。
 */
function AdSlot({ placement, className }: Props) {
  const config = AD_PLACEMENTS[placement]
  const insRef = useRef<HTMLModElement>(null)
  const hasPushed = useRef(false)

  useEffect(() => {
    // React 18 的 StrictMode 在开发环境下会故意把 effect 执行两次。
    // 没有这个判断，本地开发时每个广告位都会 push 两次，
    // 多出来的那次会因为找不到空闲的 ins 元素而抛错。
    if (hasPushed.current) {
      return
    }

    const ins = insRef.current
    if (!ins) {
      return
    }

    // AdSense 填充完一个 ins 后会给它打上 data-adsbygoogle-status="done"。
    // 对已完成的节点再次 push 会抛 "All ins elements in the DOM with
    // class=adsbygoogle already have ads in them"。正常流程下走不到这里，
    // 但加一道判断可以防止将来改动引入重复填充。
    if (ins.getAttribute('data-adsbygoogle-status')) {
      return
    }

    hasPushed.current = true

    try {
      // 脚本可能还没加载完。这里的写法是 Google 官方代码片段的标准做法：
      // adsbygoogle 此时只是个普通数组，push 进去的请求会排队，
      // adsbygoogle.js 加载完成后会自己把队列消费掉。
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // 广告填充失败不应该影响文档阅读。最常见的原因是读者装了广告拦截插件，
      // 这是完全正常的情况，不需要打扰他们或往控制台刷错误。
    }
  }, [])

  return (
    <ins
      ref={insRef}
      className={clsx('adsbygoogle', styles.adSlot, className)}
      style={{ display: 'block', minHeight: config.minHeight }}
      data-ad-client={AD_CLIENT}
      data-ad-slot={config.slot}
      data-ad-format={config.format}
      {...(config.layout ? { 'data-ad-layout': config.layout } : {})}
      {...(config.fullWidthResponsive
        ? { 'data-full-width-responsive': 'true' }
        : {})}
      // 供验证使用：跳转页面后在开发者工具里查这个属性，
      // 能确认广告位确实被重建了，而不是沿用了上一页的节点。
      data-ad-placement={placement}
    />
  )
}

/**
 * 广告位的对外入口，负责决定"是否渲染"以及"何时重建"。
 *
 * ## 为什么 SPA 里的广告不会更新
 *
 * Docusaurus 是单页应用，点击站内链接不会重新加载页面。AdSense 的填充逻辑
 * 只在脚本初始化和收到 push 请求时运行，所以换页后老广告会一直留在原地。
 *
 * 直觉上的修复方式是"换页时再 push 一次"，但这是行不通的：AdSense 会给填充过的
 * ins 元素打上 data-adsbygoogle-status="done" 并永久拒绝复用它，重复 push
 * 只会抛错。
 *
 * 真正的解法是把节点换掉。下面给 AdSlot 的 key 里带上了 pathname，
 * 路由变化时 key 随之变化，React 会卸载旧的 ins 并挂载一个全新的节点，
 * AdSense 把它当作一个从未填充过的广告位正常处理。
 *
 * ## 关于政策
 *
 * AdSense 版位政策的原文是：发布商不得在用户未主动请求刷新的情况下刷新页面
 * 或页面元素。这里的重建由读者点击链接产生的导航触发，属于用户主动行为，
 * 与政策禁止的定时自动刷新是两回事。
 *
 * 因此这个文件里不能出现任何基于 setInterval / setTimeout 的刷新逻辑。
 * 如果之后有人想"提高刷新率"而加定时器，那会直接违反政策，可能导致账号被限制投放。
 */
export default function AdUnit({ placement, className }: Props) {
  const config = AD_PLACEMENTS[placement]
  const isBrowser = useIsBrowser()
  const { pathname } = useLocation()

  if (!config.enabled || !isAdAllowedOnPath(pathname)) {
    return null
  }

  // useIsBrowser 在服务端渲染和客户端首次渲染时都返回 false，
  // 因此这里的占位节点在两边是一致的，不会造成 hydration 不匹配。
  // 占位节点保留和广告相同的高度，避免广告出现时把内容顶开。
  if (!isBrowser) {
    return (
      <div
        className={clsx(styles.adPlaceholder, className)}
        style={{ minHeight: config.minHeight }}
        aria-hidden="true"
      />
    )
  }

  return (
    <AdSlot
      key={`${placement}:${pathname}`}
      placement={placement}
      className={className}
    />
  )
}
