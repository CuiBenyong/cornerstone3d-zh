/**
 * 广告拦截检测：检测到拦截后用全屏遮罩锁住页面，读者关闭拦截并刷新后才能继续浏览。
 *
 * 作为 Docusaurus clientModule 在每个页面首次加载时运行一次。SPA 换页不需要重新检测：
 * 拦截器状态只会在刷新后改变，而遮罩一旦出现就不会自己消失。
 *
 * ## 两路独立信号
 *
 * 1. 诱饵元素：插入一个带常见广告类名的 1px 节点。拦截器的元素隐藏规则
 *    （EasyList 的 `##.adsbox` 之类）会把它隐藏或删除。这条信号不走网络，
 *    因此不会受网络环境影响。
 * 2. 网络探测：HEAD 请求 AdSense 脚本地址。拦截器会让请求立即失败。
 *
 * ## 为什么网络信号必须带对照
 *
 * 本站大量读者在国内，pagead2.googlesyndication.com 在国内网络下本来就打不开。
 * 只看「广告脚本请求失败」会把所有这些读者锁在门外。所以广告请求失败时，
 * 再请求一个同属 Google、但不在任何拦截列表里的地址（generate_204）：
 * - 对照成功 → Google 可达，只有广告被拒，判定为拦截；
 * - 对照也失败 → 是网络问题，不判定拦截。
 * 超时一律按「不确定」处理，不判定拦截——拦截器让请求立即失败，慢只可能是网络。
 *
 * ## 为什么类名是随机的
 *
 * 拦截器的反检测规则会按类名 / id 隐藏常见的「请关闭广告拦截」提示。遮罩的类名
 * 每次加载随机生成，且不含 adblock 等字样；遮罩被删除或隐藏后会自动重建。
 * 页面主体另外设为 inert 并模糊，即使遮罩被隐藏，页面也无法阅读和操作。
 */
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'

const AD_SCRIPT_URL =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9580076271637088'

/** 对照地址：204 空响应，允许跨域，不在任何广告拦截列表里。 */
const CONTROL_URL = 'https://www.google.com/generate_204'

const PROBE_TIMEOUT_MS = 8000

/** 各拦截列表普遍会隐藏的类名。不能含 adsbygoogle，否则 AdSense 会去填充这个节点。 */
const BAIT_CLASSES = 'adsbox ad-banner ad-placement pub_300x250 text-ad textAd banner-ads'

/**
 * 爬虫与预渲染不做检测：它们没有拦截器，但也可能不加载广告脚本，
 * 被锁住会让搜索引擎看到一个遮罩页面。
 */
const BOT_UA =
  /bot|crawl|spider|slurp|mediapartners|adsbot|lighthouse|headlesschrome|prerender|bingpreview/i

const COPY = {
  title: '检测到广告拦截',
  description:
    '本站内容免费开放，服务器与持续更新依靠广告收入维持。请将本站加入广告拦截插件的白名单（或暂时关闭拦截），然后刷新页面继续浏览。',
  steps: [
    '点击浏览器工具栏里的广告拦截插件图标（AdBlock、uBlock Origin、AdGuard 等）',
    '选择「在此网站上暂停」或「不在此网站上运行」',
    '点击下方按钮刷新页面',
  ],
  note: 'Brave 浏览器请关闭地址栏右侧的盾牌；使用了 AdGuard DNS、Pi-hole 等系统级拦截的，也需要放行本站。',
  reload: '我已关闭，刷新页面',
}

type ProbeResult = 'ok' | 'error' | 'timeout'

function probe(url: string): Promise<ProbeResult> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve('timeout'), PROBE_TIMEOUT_MS)
    fetch(url, { method: 'HEAD', mode: 'no-cors', cache: 'no-store', credentials: 'omit' }).then(
      () => {
        window.clearTimeout(timer)
        resolve('ok')
      },
      () => {
        window.clearTimeout(timer)
        resolve('error')
      },
    )
  })
}

function isBaitBlocked(bait: HTMLElement): boolean {
  if (!bait.isConnected) return true
  const style = window.getComputedStyle(bait)
  return (
    bait.offsetWidth === 0 ||
    bait.offsetHeight === 0 ||
    style.display === 'none' ||
    style.visibility === 'hidden'
  )
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function detectAdBlock(): Promise<boolean> {
  const bait = document.createElement('div')
  bait.className = BAIT_CLASSES
  bait.setAttribute('aria-hidden', 'true')
  bait.style.cssText =
    'position:absolute!important;left:-10000px!important;top:-10000px!important;width:1px!important;height:1px!important;pointer-events:none!important;'
  document.body.appendChild(bait)

  try {
    const network = (async () => {
      if ((await probe(AD_SCRIPT_URL)) !== 'error') return false
      return (await probe(CONTROL_URL)) === 'ok'
    })()

    // 元素隐藏规则通常在节点插入后立即生效，部分过程式规则要稍晚一些，查两次。
    await wait(400)
    if (isBaitBlocked(bait)) return true
    if (await network) return true
    await wait(600)
    return isBaitBlocked(bait)
  } finally {
    bait.remove()
  }
}

function randomName(): string {
  return `r${Math.random().toString(36).slice(2, 9)}`
}

function buildStyle(p: string): string {
  return `
.${p}-lock{overflow:hidden!important}
.${p}-inert{filter:blur(6px)!important;pointer-events:none!important;user-select:none!important}
.${p}{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.72);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);font-family:system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif}
.${p}-card{box-sizing:border-box;width:100%;max-width:480px;max-height:calc(100vh - 32px);overflow:auto;padding:28px 24px 24px;border-radius:14px;background:#fff;color:#1e293b;box-shadow:0 20px 50px rgba(0,0,0,.3);line-height:1.6}
.${p}-card h2{margin:0 0 12px;font-size:20px;line-height:1.35;color:inherit}
.${p}-card p{margin:0 0 12px;font-size:15px}
.${p}-card ol{margin:0 0 12px;padding-left:1.4em;font-size:14px}
.${p}-card li{margin:4px 0}
.${p}-note{color:#64748b;font-size:13px!important}
.${p}-btn{display:block;width:100%;margin-top:8px;padding:11px 16px;border:0;border-radius:8px;background:#2563eb;color:#fff;font-size:15px;font-weight:600;cursor:pointer}
.${p}-btn:hover{background:#1d4ed8}
.${p}-btn:focus-visible{outline:3px solid #93c5fd;outline-offset:2px}
@media (prefers-color-scheme:dark){.${p}-card{background:#1e293b;color:#e2e8f0}.${p}-note{color:#94a3b8}}
html[data-theme=dark] .${p}-card{background:#1e293b;color:#e2e8f0}
html[data-theme=dark] .${p}-note{color:#94a3b8}
html[data-theme=light] .${p}-card{background:#fff;color:#1e293b}
html[data-theme=light] .${p}-note{color:#64748b}
`
}

function buildOverlay(p: string): HTMLElement {
  const overlay = document.createElement('div')
  overlay.className = p
  overlay.setAttribute('role', 'alertdialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-labelledby', `${p}-title`)
  overlay.setAttribute('aria-describedby', `${p}-desc`)

  const card = document.createElement('div')
  card.className = `${p}-card`

  const title = document.createElement('h2')
  title.id = `${p}-title`
  title.textContent = COPY.title

  const desc = document.createElement('p')
  desc.id = `${p}-desc`
  desc.textContent = COPY.description

  const steps = document.createElement('ol')
  for (const step of COPY.steps) {
    const li = document.createElement('li')
    li.textContent = step
    steps.appendChild(li)
  }

  const note = document.createElement('p')
  note.className = `${p}-note`
  note.textContent = COPY.note

  const button = document.createElement('button')
  button.type = 'button'
  button.className = `${p}-btn`
  button.textContent = COPY.reload
  button.addEventListener('click', () => window.location.reload())

  card.append(title, desc, steps, note, button)
  overlay.appendChild(card)
  return overlay
}

function lockPage(): void {
  let p = randomName()
  const style = document.createElement('style')
  let overlay = buildOverlay(p)

  const isOwn = (node: Node) => node === overlay || node === style

  const lockChildren = () => {
    for (const child of Array.from(document.body.children)) {
      if (isOwn(child)) continue
      child.setAttribute('inert', '')
      child.setAttribute('aria-hidden', 'true')
      child.classList.add(`${p}-inert`)
    }
  }

  // 遮罩被隐藏时换一套类名重建，让按类名写的隐藏规则失效。
  const rebuild = () => {
    const prev = p
    p = randomName()
    for (const el of Array.from(document.querySelectorAll(`.${prev}-inert`))) {
      el.classList.replace(`${prev}-inert`, `${p}-inert`)
    }
    document.documentElement.classList.replace(`${prev}-lock`, `${p}-lock`)
    document.body.classList.replace(`${prev}-lock`, `${p}-lock`)
    overlay.remove()
    overlay = buildOverlay(p)
    ensure()
  }

  const ensure = () => {
    const css = buildStyle(p)
    if (style.textContent !== css) style.textContent = css
    if (!style.isConnected) document.head.appendChild(style)
    if (!overlay.isConnected) document.body.appendChild(overlay)
    document.documentElement.classList.add(`${p}-lock`)
    document.body.classList.add(`${p}-lock`)
    lockChildren()
  }

  ensure()
  overlay.querySelector('button')?.focus()

  new MutationObserver(() => {
    if (!overlay.isConnected || !style.isConnected) ensure()
    else lockChildren()
  }).observe(document.body, { childList: true })
  new MutationObserver(() => {
    if (!style.isConnected) ensure()
  }).observe(document.head, { childList: true })

  window.setInterval(() => {
    const cs = window.getComputedStyle(overlay)
    if (
      !overlay.isConnected ||
      cs.display === 'none' ||
      cs.visibility === 'hidden' ||
      Number(cs.opacity) === 0 ||
      overlay.offsetHeight === 0
    ) {
      rebuild()
    } else {
      ensure()
    }
  }, 1000)
}

function start(): void {
  if (BOT_UA.test(navigator.userAgent) || !navigator.onLine) return
  void detectAdBlock().then((blocked) => {
    if (blocked) lockPage()
  })
}

if (ExecutionEnvironment.canUseDOM && process.env.NODE_ENV === 'production') {
  if (document.readyState === 'complete') start()
  else window.addEventListener('load', start, { once: true })
}
