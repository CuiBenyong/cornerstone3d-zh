/**
 * 站点网络配置。
 *
 * 这里的文案会同时出现在 footer、文档页底部卡片和首页，改一处即可全站生效。
 *
 * 关于锚文本：每个站点都写了具体的描述而不是「点击这里」「更多」这类词。
 * 搜索引擎通过锚文本判断目标页面的主题，描述性锚文本对被链接的站点有实际帮助；
 * 同时这也是给读者的信息——他们能在点击前知道会去哪里。
 *
 * 关于数量：站群互链要控制规模并保持内容相关性。三个站点、每处一组链接，
 * 属于正常的关联站点导航。如果把链接铺到每个段落里，就会被判定为操纵链接。
 */

export type NetworkSite = {
  /** 用于 React key，同时作为卡片图标的文字标识 */
  id: string
  name: string
  tagline: string
  description: string
  url: string
  /** 卡片左上角的短标签 */
  badge: string
}

export const NETWORK_SITES: NetworkSite[] = [
  {
    id: 'hub',
    name: '玄一',
    tagline: '站点导航',
    description: '全部项目与站点的入口汇总。',
    url: 'https://front-end-js.top',
    badge: '导航',
  },
  {
    id: 'blog',
    name: '玄一的博客',
    tagline: '前端与 AI 编码实践',
    description:
      'JavaScript、CSS、TypeScript、React 深入解析，以及 Claude、Cursor、Copilot 等 AI 编码工具的实测对比。',
    url: 'https://blog.front-end-js.top',
    badge: '博客',
  },
  {
    id: 'course',
    name: '逐日AI',
    tagline: '动手学会 AI 工程',
    description:
      '把 AI 工程拆成一天一步。从提示工程基础到 MCP、Agent Skills、RAG 与完整项目实战。',
    url: 'https://course.front-end-js.top',
    badge: '课程',
  },
]

/** 本站，用于在其他站点或结构化数据中引用。 */
export const THIS_SITE = {
  name: 'Cornerstone3D 中文文档',
  url: 'https://cornerstone3d-zh.front-end-js.top',
}
