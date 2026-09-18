---
id: faq
title: 常见问题解答
description: 关于旧版 Cornerstone 与 Cornerstone3D 差异的常见问题，包括为何从零重建渲染引擎、如何高效共享 GPU 纹理内存，以及哪些旧特性不会迁移过来及其原因。
keywords:
  - Cornerstone3D 常见问题
  - 旧版 Cornerstone
  - react-vtkjs-viewport
  - WebGL 上下文限制
  - GPU 纹理共享
  - 特性对等
upstream: https://www.cornerstonejs.org/docs/faq
---

# 常见问题解答 {#frequently-asked-questions}

### 旧版 Cornerstone、Cornerstone3D 与 react-vtkjs-viewport 之间有什么区别？ {#what-is-the-difference-between-cornerstone-legacy-and-cornerstone3d-alpha-and-react-vtkjs-viewport}

旧版 Cornerstone 虽然通过 WebGL 实现了 GPU 加速渲染，但它只处理医学影像的二维渲染。
为解决这个问题，我们创建了
[react-vtkjs-viewport](https://github.com/OHIF/react-vtkjs-viewport)，
把渲染能力交给 [`vtk.js`](https://github.com/kitware/vtk-js)
这个强大的渲染库，从而实现医学影像的三维渲染。

然而，vtk.js 是每个视口用一个 WebGL 实例，这在 PET/CT 挂片协议这类场景下
无法扩展——那种场景可能需要同屏显示 10 个以上视口，
原因有两点：GPU 内存限制（纹理无法跨画布共享），
以及 WebGL 上下文数量限制（每个浏览器标签页最多只能存在 16 个上下文）。
此外，`vtk.js` 也不支持 SVG 标注工具。

为了满足复杂的成像使用场景，我们选择从零构建 Cornerstone 渲染引擎，
以高效利用 GPU 内存。这个渲染引擎把 `vtk.js` 的许多技术细节抽象掉了：
它在一块离屏 WebGL 画布上处理数据，再把得到的影像传输到屏上的各个画布。

这种做法让我们能在同一份数据的不同视图 / 表现形式之间高效共享 GPU 纹理内存。
例如在 PET/CT 融合 MPR 挂片协议中，GPU 内存里只存一份 PET 体数据，
渲染反色 PET 视口和融合 PET 视口时都用这一份。

### Cornerstone 与 Cornerstone3D 之间的特性对等情况如何？ {#what-are-the-feature-parity-between-cornerstone-and-cornerstone3d}

以下这些目前不会迁移过来：

<table>
<thead>
  <tr>
    <th>特性</th>
    <th>原因</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>Cornerstone Modules</td>
    <td>在 CornerstoneTools 中，这是一套带命名空间的插件，用于以自定义方式存放工具级的元数据，同时也带有启用 / 禁用事件的初始化钩子。对简单的平面工具来说它们并非必需，因此第一版不会提供。</td>
  </tr>
  <tr>
    <td>Mixins</td>
    <td>Mixin 是 CornerstoneTools 3.0+ 引入的、工具的自注册附加件。我们发现用组合方式构建工具还有更有用的设计模式，例如把通用工具函数包装起来。我们打算废弃这个特性。</td>
  </tr>
  <tr>
    <td>除工具之外注册进来的第三方内容（自定义操作器、工具函数等）</td>
    <td>我们认为工具函数就应该打包成 NPM 库再引入，而旧框架对它的使用场景来说可能过重了。</td>
  </tr>
</tbody>
</table>
