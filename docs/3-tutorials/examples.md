---
id: examples
title: 示例
description: Cornerstone3D 在线示例的访问方式、通过 Chrome 开发者工具查看示例源码并断点调试的方法，以及在本地克隆仓库后用 yarn run example 运行任意示例的步骤。
keywords:
  - Cornerstone3D 示例
  - Cornerstone3D 在线示例
  - yarn run example
  - 调试 Cornerstone3D
  - Cornerstone3D 源码
upstream: https://www.cornerstonejs.org/docs/tutorials/examples
---

import Link from '@docusaurus/Link';

# 示例

我们已经编写了相当多的示例，可以在[这里](https://www.cornerstonejs.org/docs/examples)访问。
点开某个示例就会进入它的示例页面，你可以直接和它交互，看它是怎么工作的。

<Link to="https://www.cornerstonejs.org/docs/examples">
    <div id="open-example-button">
        点击这里打开示例页面
    </div>
</Link>

:::note 说明

在线示例托管在官方英文站点上，本中文站点不重复托管，因此上面的链接会跳转到
`cornerstonejs.org`。示例本身是纯代码演示，不影响阅读。

:::

## 源码与调试 {#source-code-and-debugging}

如果你想看每个示例的源码，我们在打开 Chrome 开发者工具时提供了源码链接。
具体做法可以看下面的视频。简单说：打开 Chrome 开发者工具后，切到 `console`，
点击控制台中显示的那个 `index.ts`。

你可以在代码的任意一行打断点，查看被调用的变量和函数。

{/* Vimeo 的 embed 会报 CORS 错误，所以这里直接用 iframe */}
<div style={{padding:"56.25% 0 0 0", position:"relative"}}>
    <iframe src="https://player.vimeo.com/video/843234360?h=06d45e5a5f&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;dnt=1"
    frameBorder="0" allow="cross-origin-isolated" allowFullScreen style= {{ position:"absolute",top:0,left:0,width:"100%",height:"100%"}} title="示例"></iframe>
</div>

## 在本地运行示例 {#run-examples-locally}

你也可以在本地运行每个示例。需要说明的是，`Cornerstone3D` 是一个 monorepo，
包含三个包（`core`、`tools`、`streaming-image-volume`），各个包的示例都放在
自己目录下的 `examples` 文件夹里。运行某个示例时，把它的名字作为参数传给
`example` 脚本即可。示例名不区分大小写，而且就算拼错了，它还能提示你可能想找的那个示例。

```bash
1. 克隆仓库
2. yarn install --frozen-lockfile
3. yarn run example petct   # 需要在仓库根目录下执行
```

:::note Important
运行示例时请把仓库根目录作为工作目录。
以前需要在各个包的目录下分别运行，现在不需要了。
:::

:::danger
一般来说，执行 `yarn install` 时都应该带上 `--frozen-lockfile` 标志，
通过强制依赖可复现来降低供应链攻击的风险。也就是说，只要 `yarn.lock` 是干净的、
没有引用被投毒的包，用这个标志就不会有被投毒的包落到你的机器上。
:::
