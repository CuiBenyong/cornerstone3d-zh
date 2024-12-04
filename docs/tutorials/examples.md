---

id: examples
title: 示例
---

import Link from '@docusaurus/Link';

# 示例

我们已经编写了大量示例，你可以在[这里](/docs/examples)访问它们。当你点击一个示例时，你将被带到该示例的页面。你可以与每个示例进行互动，查看它是如何工作的。

<Link to="/docs/examples">
    <div id="open-example-button">
        点击这里打开示例页面
    </div>
</Link>

## 源代码与调试

如果你有兴趣查看每个示例的源代码，我们已在你打开Chrome开发者工具时提供了一个链接。你可以通过以下视频来了解如何操作。总结来说，打开Chrome开发者工具后，点击 `console`，然后点击控制台中显示的 `index.ts` 文件。

你可以在代码的任何一行设置断点，并检查正在调用的变量和函数。

<!-- /由于某些原因，Vimeo嵌入会给出CORS错误 -->
<div style={{padding:"56.25% 0 0 0", position:"relative"}}>
    <iframe src="https://player.vimeo.com/video/694244249?h=06d45e5a5f&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;dnt=1"
    frameBorder="0" allow="cross-origin-isolated" allowFullScreen style= {{ position:"absolute",top:0,left:0,width:"100%",height:"100%"}} title="Examples"></iframe>
</div>

## 本地运行示例

你也可以在本地运行每个示例。需要注意的是，`Cornerstone3D` 是一个 monorepo，包含三个包（`core`，`tools`，`streaming-image-volume`）。每个包的示例都包含在该包内的 `examples` 目录中。你可以通过将示例的名称作为参数传递给 `example` 脚本来运行每个示例。例如，示例名称不区分大小写，甚至可以在你输入错误时自动提示你所需的示例名称。

```bash

1. 克隆仓库
2. `yarn install`
3. `yarn run example petct` \// 这应该在仓库根目录运行

```

:::note 重要
在运行示例时，请使用仓库的根目录作为工作目录。以前，你需要在每个包目录中运行示例，现在不再需要这么做。
:::