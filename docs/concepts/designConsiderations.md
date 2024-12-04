## 高级设计考虑

这些库扩展并更新了 `cornerstone.js` 提供的接口，以更好地支持体积渲染、3D 感知工具和 PET 图像的支持。这些接口和功能大致可以分为：

- 渲染 / 渲染器
- 图像加载 / 图像加载器
- 元数据提供者
- 工具

`@cornerstonejs/core` 是一个建立在 `vtk.js` 基础上的“渲染”库，利用 `cornerstone` 的现有架构与图像加载器和元数据提供者集成。

本仓库的 `@cornerstonejs/tools` 是一个“工具”库，在初始化后，它将监听 `@cornerstonejs/core` 发出的自定义事件。请注意，事件命名和处理方式与 `cornerstone-tools` 库中的事件和事件处理重叠。如果您尝试同时使用 `cornerstone-tools`，可能会遇到问题。由于这是一个可能的使用场景，请随时报告任何问题并提出潜在的解决方案。