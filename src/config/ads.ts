/**
 * AdSense 配置的唯一来源。
 *
 * 想调整广告行为时只改这个文件，不要去改组件。
 *
 * 关于 slot：目前三个版位共用同一个广告单元 ID。这在 AdSense 里是允许的，
 * 但同一个 slot 的数据会合并在一张报表里，无法区分是哪个位置带来的收入。
 * 如果之后想分开看数据，在后台为每个位置各建一个广告单元，把 ID 填到
 * 对应的 `slot` 字段即可，组件不需要改。
 */

/** AdSense 发布商 ID，与 docusaurus.config.ts 里 loader 脚本的 client 参数保持一致。 */
export const AD_CLIENT = 'ca-pub-9580076271637088'

/** 后台已创建的广告单元 ID。 */
const SLOT_SHARED = '1684022808'

export type AdPlacementName = 'inArticle' | 'articleBottom' | 'tocSidebar'

export type AdPlacementConfig = {
  /** 关掉某个版位时把它设为 false，组件会整个不渲染。 */
  enabled: boolean
  slot: string
  /** AdSense 的 data-ad-format。'fluid' 配合 in-article 布局，'auto' 用于自适应展示广告。 */
  format: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'
  /** 仅 format 为 'fluid' 时有意义。 */
  layout?: 'in-article'
  fullWidthResponsive?: boolean
  /**
   * 预留高度（px）。这不是装饰——广告是异步填充的，不预留高度会在广告插入时
   * 把下方内容顶开，产生 CLS（Cumulative Layout Shift）。CLS 是 Core Web Vitals
   * 的三项指标之一，既影响搜索排名，也影响广告可见性评分。
   */
  minHeight: number
}

export const AD_PLACEMENTS: Record<AdPlacementName, AdPlacementConfig> = {
  /** 正文中部。单次点击价格通常明显高于其他位置，因为它处在阅读动线上。 */
  inArticle: {
    enabled: true,
    slot: SLOT_SHARED,
    format: 'fluid',
    layout: 'in-article',
    minHeight: 280,
  },
  /** 正文末尾、翻页器之前。读者读完一页时的自然停顿点。 */
  articleBottom: {
    enabled: true,
    slot: SLOT_SHARED,
    format: 'auto',
    fullWidthResponsive: true,
    minHeight: 280,
  },
  /**
   * 右侧目录下方。只在桌面端出现——它挂在 DocItem/TOC/Desktop 上，
   * 而该组件本身只在 windowSize 为 desktop 时才渲染。
   */
  tocSidebar: {
    enabled: true,
    slot: SLOT_SHARED,
    format: 'auto',
    minHeight: 600,
  },
}

/**
 * 正文内广告的准入门槛。
 *
 * 短页面不投正文内广告，有两个原因：
 * 1. 合规。AdSense 不希望在内容过少的页面上投放广告，广告占比过高的页面
 *    可能被判定为低价值内容。本站有不少纯索引页（只有几行字加一个列表），
 *    正是这类风险页面。
 * 2. 体验。三行正文夹一块广告，读者会直接关掉页面。
 */
export const IN_ARTICLE_RULES = {
  /**
   * 页面至少要有这么多个 h2 小节。要求 3 个的原因是：广告插在第 2 节之后，
   * 后面还得至少剩 1 节，否则它实质上等于底部广告，和 articleBottom 重复。
   */
  minHeadings: 3,
  /** 读完这么多个完整 h2 小节后才插入广告。 */
  afterHeadingCount: 2,
  /** 正文纯文本长度下限（字符数）。 */
  minChars: 800,
}

/**
 * 这些路径前缀下完全不投广告。
 *
 * 面向贡献者的页面（怎么提 PR、怎么跑测试）流量小、商业价值低，
 * 而且读这些页面的是想给项目做贡献的人，不该拿广告去打扰他们。
 */
export const AD_EXCLUDED_PATH_PREFIXES = ['/docs/contribute']

export function isAdAllowedOnPath(pathname: string): boolean {
  return !AD_EXCLUDED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}
