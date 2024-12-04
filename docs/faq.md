---
id: faq
---

# 常见问题解答

### Cornerstone（旧版）与 Cornerstone3D（Alpha 版）和 react-vtkjs-viewport 有什么区别？

尽管 Cornerstone（旧版）通过 WebGL 实现了 GPU 加速渲染，但它仅处理医学图像的 2D 渲染。为了解决这个问题，我们创建了 [react-vtkjs-viewport](https://github.com/OHIF/react-vtkjs-viewport)，通过将渲染功能移到 [`vtk.js`](https://github.com/kitware/vtk-js)（一个强大的渲染库），使医学图像能够进行 3D 渲染。然而，vtk.js 在每个视口使用 WebGL 实例，这在某些情况下（如 PET/CT 挂图协议，可能需要在屏幕上同时显示超过 10 个视口）并不适用，原因是 GPU 内存限制（纹理不在画布间共享）和 WebGL 上下文限制（每个浏览器标签页最多可以有 16 个上下文）。此外，`vtk.js` 不支持 SVG 注释工具。

为了满足复杂的成像使用需求，我们选择从零开始构建 Cornerstone 渲染引擎，以高效利用 GPU 内存。这个渲染引擎抽象了 `vtk.js` 的许多技术细节；它在一个 WebGL 画布中处理数据，并将生成的图像传输到屏幕上的画布。

这种方法使我们能够高效地在同一数据的不同视图/表现之间共享 GPU 纹理内存。例如，在 PET/CT 融合 MPR 挂图协议中，只有一个 PET 卷存储在 GPU 内存中，并在渲染反转的 PET 视口和融合 PET 视口时使用。

### Cornerstone 和 Cornerstone3D 之间的功能差异是什么？

以下功能目前不会迁移：

<table>
<thead>
  <tr>
    <th>功能</th>
    <th>原因</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>Cornerstone 模块</td>
    <td>在 CornerstoneTools 中，这些是命名空间插件，用于以自定义方式存储工具范围的元数据，同时具有启用/禁用事件的初始化钩子。对于简单的平面工具来说，它们不是必需的，因此在第一版中不会提供。</td>
  </tr>
  <tr>
    <td>Mixin</td>
    <td>Mixin 是 CornerstoneTools 3.0+ 中为工具引入的自注册插件。我们发现，组合工具时有更有用的设计模式，例如包装通用的工具函数。我们计划弃用此功能。</td>
  </tr>
  <tr>
    <td>注册的第三方内容（工具以外的内容，例如自定义操作器、工具等）</td>
    <td>我们认为工具函数应该被封装在 NPM 库中并导入，旧的框架可能对于其用例来说过于繁重。</td>
  </tr>
</tbody>
</table>