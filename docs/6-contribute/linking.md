---

id: linking
title: 链接 Cornerstone 库与 OHIF 进行开发
---

# 将 Cornerstone 库与 OHIF 链接以进行开发 {#linking-cornerstone-libraries-with-ohif-for-development}

通常，您可能希望将一个包链接到 Cornerstone3D，可能是为了开发一个功能、调试一个错误或其他原因。

此外，有时您可能希望链接外部包以将库包含到您的构建中，而这些库不是直接的依赖，而是动态加载的。详情见 externals/README.md 文件。

## Yarn Link {#yarn-link}

有多种方式可以链接到一个包，最常用的方法是使用 [`yarn link`](https://classic.yarnpkg.com/en/docs/cli/link)。

本指南介绍如何在开发中将本地 Cornerstone 库与 OHIF 链接。

## 先决条件 {#prerequisites}

- OHIF Viewer 的本地克隆
- 所需 Cornerstone 库的本地克隆（@cornerstonejs/core, @cornerstonejs/tools 等）
- Yarn 包管理器

## 链接库的步骤 {#steps-to-link-libraries}

1. **准备 Cornerstone 库**

   导航到您要链接的 Cornerstone 库目录（例如，@cornerstonejs/core）：

   ```bash
   cd packages/core
   ```

   首先取消任何现有的链接：

   ```bash
   yarn unlink
   ```

   创建链接：

   ```bash
   yarn link
   ```

   构建包以确保最新更改：

   ```bash
   yarn dev
   ```

2. **在 OHIF 中链接**

   在您的 OHIF 项目目录中：

   ```bash
   yarn link @cornerstonejs/core
   ```

   启动 OHIF：

   ```bash
   yarn dev
   ```

## 使用多个库 {#working-with-multiple-libraries}

您可以同时链接多个 Cornerstone 库。例如，要链接 core 和 tools：

```bash
# 在 cornerstone/packages/core
yarn unlink
yarn link
yarn dev

# 在 cornerstone/packages/tools
yarn unlink
yarn link
yarn dev

# 在 OHIF
yarn link @cornerstonejs/core
yarn link @cornerstonejs/tools
```

## 验证链接 {#verifying-the-link}

1. 在链接的库中进行可见更改（例如，修改工具中的线宽）
2. 使用 `yarn dev` 重建库
3. 更改应自动反映在 OHIF 中

## 重要提示 {#important-notes}

- 在 Cornerstone 库中进行更改后，始终运行 `yarn dev`
- 由于在 Cornerstone 3D 2.0 中迁移到 ESM，链接过程比以前更简单
- 完成时在两个项目中使用 `yarn unlink` 删除链接

## 故障排除 {#troubleshooting}

如果更改未反映：

1. 确保库已重建（`yarn dev`）
2. 检查控制台是否有任何链接错误
3. 使用浏览器控制台验证链接的库版本是否正确

## 视频教程 {#video-tutorials}

<iframe width="560" height="315" src="https://www.youtube.com/embed/IOXQ1od6DZA?si=3QP4rppQgedJn7y8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 提示 {#tips}

1. `yarn link` 实际上是包之间的一个符号链接。如果您的链接不起作用，
   查看 `Cornerstone3D` 目录中的 `node_modules`，看看符号链接是否已创建（更新的源代码——而不是 dist——在 `node_modules` 中可用）。

2. 如果您的 `debugger` 未命中，您可能需要将 webpack 中的 `mode` 设置更改为 `development` 而不是 `production`。这确保不对源代码应用压缩。

3. 使用更详细的源映射进行调试。您可以在 [这里](https://webpack.js.org/configuration/devtool/) 阅读更多。