---
id: overview
title: 概述
---

import Link from '@docusaurus/Link';

# 概述

`Cornerstone3D` 是一个轻量级的 Javascript 库，用于在支持 HTML5 画布元素的现代网页浏览器中可视化医学图像。
使用 `@cornerstonejs/core` 及其附带的库如 `@cornerstonejs/tools`，您可以完成广泛的影像任务。

<br/>

<Link target={"_blank"} to="/live-examples/petCT.html">
    <button id="open-ptct-button">
        打开 PT/CT 演示
    </button>
</Link>

<br/>
<br/>

<Link target={"_blank"} to="/live-examples/local.html">
    <button id="open-ptct-button">
        打开本地 DICOM 演示
    </button>
</Link>

## 特性

### 渲染

使用新的 `Cornerstone3D` 渲染引擎及其堆栈和体视图，您可以：

- 渲染所有传输语法，包括各种压缩格式如 JPEG2000、JPEG 无损
- 流式传输体积的切片并在加载时实时查看
- 在不同方向如轴向、矢状面和冠状面查看同一个体积，而无需再次重新加载整个体积（最小内存占用）
- 查看体积中的斜切片
- 渲染同一个体积的不同混合类型（例如，最大强度投影（MIP）和平均强度投影）
- 融合和叠加多个图像，如 PET/CT 融合
- 渲染彩色图像并将其渲染为体积
- 当 GPU 渲染不可用时回退到 CPU 渲染
- 通过修改视口的元数据来改变图像的校准（例如，像素间距）

### 操作

`Cornerstone3DTools` 启用了以下功能：

- 使用鼠标绑定放大和缩小图像
- 在任意方向平移图像
- 即便在斜切片中，也可以在任意方向滚动图像
- 改变图像的窗宽窗位

![](../assets/overview-manipulation.gif)

### 注释

`Cornerstone3DTools` 还可以使用工具对图像进行注释。所有注释都以 SVG 元素渲染，确保它们在任何显示器分辨率下以最佳质量显示。
`Cornerstone3DTools` 中的注释存储在图像的实际物理空间中，这使您可以在多个视口中渲染/修改同一注释。
此外，您还可以：

- 使用工具组在特定视口上激活某些工具（例如，在滚动时激活 CT 轴向视口上的片滚动，但在 PT MIP 视口上激活体积旋转）
- 使用长度工具测量两点之间的距离
- 使用双向线工具测量长度和宽度
- 使用矩形/椭圆 ROI 工具计算感兴趣区域的统计数据，如平均值和标准偏差
- 使用十字准线查找不同视口图像中的对应点，并使用参考线导航切片
- 分配不同的工具，以便在按住特定修饰键时激活（例如，shift、ctrl、alt）
- 创建自定义工具

![](../assets/overview-annotation.gif)

### 分割

`Cornerstone3D` 支持将图像的分割结果作为标签地图在所有视口中渲染，包括堆栈、体积和 3D。
您可以：

- 在视口中将分割结果渲染为标签地图（例如，CT 肺部的分割）
- 在 3D 视口中将标签地图转换为表面并应用相同的颜色
- 在任何方向查看分割结果（例如，轴向、矢状面、冠状面），即便在斜切片中
- 更改标签地图配置（例如，颜色、不透明度、轮廓渲染、轮廓厚度等）
- 使用剪刀工具（如矩形、椭圆剪刀）在 3D 轴向、矢状面、冠状面上编辑/绘制分割区域
- 对感兴趣区域的标签地图应用特定的阈值

### 同步

`Cornerstone3D` 支持多个视口之间的同步。当前有两个已实现的同步器，且我们正在开发更多。

- 窗口电平同步器：同步源视口和目标视口的窗口电平
- 相机同步器：同步源视口和目标视口的相机

## 关于此文档

我们的文档可以分为以下几个部分：

- [**快速入门**](/docs/2-getting-started/index.md)：介绍项目范围、相关库和其他相关信息，以及安装说明
- [**教程**](/docs/3-tutorials/index.md)：提供一系列不同任务的教程，如渲染、工具、分割
- [**操作指南**](/docs/4-how-to-guides/index.md)：提供更高级任务的指南，如自定义加载器、自定义元数据提供者
- [**概念**](/docs/1-concepts/index.md)：深入解释库中使用的各种技术概念
- [**贡献**](/docs/6-contribute/index.md)：解释如何为项目做出贡献以及如何报告错误
- [**迁移指南**](/docs/5-migration-guides/index.md)：包括从旧版本升级到新版本的说明，以及从 1.x升级到 2.x的说明
- [**常见问题**](/docs/faq.md)：提供常见问题的答案
- [**帮助**](/docs/help.md)：提供如何获取库帮助的信息
- [**测试覆盖率报告**](https://www.cornerstonejs.org/test-coverage)：提供库的测试覆盖率的详细报告
- [**示例**](https://www.cornerstonejs.org/docs/examples)：显示库的实时示例
- [**API 参考**](https://www.cornerstonejs.org/docs/api/core)：提供 API 的详细描述以及如何使用每个函数

如果某个页面不再最新，您可以通过修改 `/packages/docs/docs/*.md` 文件来提出 PR 进行更新。阅读更多关于如何贡献的信息 [这里](/docs/6-contribute/pull-request.md)。