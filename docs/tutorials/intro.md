---

id: intro
---

# 介绍

本介绍的目的是给出教程所依赖的组件的概览，以确保其正常工作。教程是以学习为导向的，是你开始尝试我们库中各种功能的好地方，我们不希望你被实现细节所干扰或困惑。因此，我们已经将教程的学习部分与其他必要的实现细节分离开来，这样你可以专注于学习。

:::note 信息
教程完全是以学习为导向，特别是，它们旨在教你“如何做”而不是“知道是什么”。（[Cornerstone3D文档哲学](https://documentation.divio.com/)）
:::

## 在本地运行教程

我们在仓库中包含了一个 `tutorial` 示例，你可以在 `packages/tools/examples/tutorial/index.ts` 中找到。这个文件包含了运行教程所需的所有设置代码（如上所述）。当你打开这个文件时，你会看到一个专门的位置，用于复制并粘贴教程中的代码。这样，你就不需要担心设置代码，专注于教程本身。

如何运行它？

```bash
# 在库的根目录下
yarn install

# 运行教程示例
yarn run example tutorial
```

然后在浏览器中新打开一个标签页，访问 `http://localhost:3000/`。

🎉 快乐学习 🎉

## 好奇的学习者

对于好奇的学习者，以下是每个教程中使用的（幕后）组件。

### 图像加载器

`Cornerstone3D` 不处理图像加载。正如我们稍后将学习的，`Cornerstone3D` 也能够渲染任何方向的 `Volumes`。因此，应该将合适的图像和体积加载器注册到 `Cornerstone3D` 中，以确保它能够按预期工作。这样的加载器示例如下：

- 图像加载器：`cornerstoneDICOMImageLoader`
- 体积加载器：`cornerstoneStreamingImageVolumeLoader`

### 元数据提供者

为了使 `Cornerstone3D` 能正确显示图像的属性，如VOI、SUV值等，它需要元数据（除了图像数据本身）。因此，应该将合适的元数据提供者注册到 `Cornerstone3D` 中，以确保它能够按预期工作。这样的提供者示例如下：

### 库初始化

`Cornerstone3D` 和 `Cornerstone3DTools` 都需要通过调用 `.init()` 方法来初始化。