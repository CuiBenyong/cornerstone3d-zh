---
id: render-backends
title: 渲染后端
description: 平面通用视口如何选择渲染后端。说明 gpu、cpu 与 auto 三种取值的优先级规则、setRenderBackend 的运行时热切换行为，以及扩展如何通过 registerRenderBackend 注册自定义后端并做 TypeScript 类型增强。
keywords:
  - 渲染后端
  - Render Backend
  - registerRenderBackend
  - setRenderBackend
  - RenderBackends
  - WebGPU
  - CPU 渲染
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/generic-viewport/render-backends
---

# 渲染后端 {#render-backends}

渲染后端是平面通用视口挂载数据时所使用的那个具名渲染实现。Cornerstone 自带两个
具体后端：`'gpu'`（VTK / WebGL）和 `'cpu'`，另外还有 `'auto'` 这个偏好值，
它会依据 `init()` 阶段的能力检测结果（WebGL 可用性、纹理格式探测，
以及已废弃的 `useCPURendering` 标志）解析成上述两者之一。

后端通过普通字符串来指定。`Enums.RenderBackends` 这个常量对象把可读的名称映射到
这些字符串（`RenderBackends.GPU === 'gpu'`）；与 TypeScript 的 enum 不同，
它会随着扩展后端的注册在运行时增长。

## 后端的选择 {#selecting-a-backend}

某份已挂载数据集使用哪个后端，按以下优先级解析：

1. `setDisplaySets()` / `addDisplaySet()` 上针对单次挂载的 `renderBackend` 选项。
   指定具体后端会把该数据集固定到这个后端；指定 `'auto'` 则依据能力检测解析，
   即使全局后端已被固定也是如此。
2. 全局配置 `rendering.planar.renderBackend`，可在 `init()` 时设置，
   也可在运行时用 `setRenderBackend()` 修改。
3. `'auto'` 的解析结果：检测不到可用的 WebGL 上下文时用 CPU，否则用 GPU。

`setRenderBackend(backend, reason?)` 会就地热切换所有已挂载的视口——
视口 id、已挂载的数据、相机、显示状态和工具标注都会保留，只有渲染路径被重建。
它会在 eventTarget 上派发 `RENDER_BACKEND_CHANGED` 事件。

Cornerstone 自己**不会**主动切换后端：监听降级事件
（`WEBGL_CONTEXT_LOST`、`RENDER_PATH_ERROR`）的应用应当自行调用它，
通常是在询问用户之后。

`getRenderBackend()` 返回配置的偏好值；`getEffectiveRenderBackend()`
返回解析后的具体后端。

## 注册自定义后端 {#registering-a-custom-backend}

:::caution 实验性功能
已注册的自定义后端目前尚未完全可用，注册 API 也是有意保持不完整的。
`registerRenderBackend()` 现在只捕获了平面视口在选择和挂载后端时所需的接线信息，
但它预计会增加更多参数，用来描述该后端注册了哪些后端特有的改动与行为——
例如参与 `'auto'` 的能力解析、由后端自行创建画布/绘图表面（而不是画到已有表面上）、
以及按后端处理上下文丢失与降级。`RegisterRenderBackendOptions` 的结构预计还会变化。
:::

`registerRenderBackend()` 采用与 `registerViewportType` 相同的「可扩展枚举」模型：
注册后，该后端 id 就成为 `setRenderBackend()`、全局配置
`rendering.planar.renderBackend` 以及单次挂载的 `renderBackend` 选项的合法取值。

```ts
import {
  registerRenderBackend,
  setRenderBackend,
  Enums,
} from '@cornerstonejs/core';

registerRenderBackend({
  name: 'WEBGPU',
  backend: 'myOrg:webgpu',
  renderModes: {
    image: {
      id: 'myOrg:webgpuImage',
      createDefinition: () => new WebGPUImageSlicePath(),
    },
    volume: {
      id: 'myOrg:webgpuVolume',
      createDefinition: () => new WebGPUVolumeSlicePath(),
    },
  },
});

setRenderBackend(Enums.RenderBackends.WEBGPU);
```

这份定义携带了视口当前所需的语义接线信息：

- `backend` —— 字符串 id，例如 `'myOrg:webgpu'`。自定义 id 请加上组织命名空间前缀；
  `'auto'` 是保留值。
- `renderModes` —— 该后端针对每种数据集类型所解析到的渲染模式。它把每个模式的
  字符串 `id` 与实现该模式的平面渲染路径定义的 `createDefinition` 工厂函数放在一起
  （渲染路径实现了什么，见[渲染路径](./render-paths.md)）。
  这个工厂函数每个视口会被调用一次（每个平面视口各自持有自己的渲染路径解析器），
  因此每次调用都必须返回一个新的定义实例。
  `image` 是必需的，且它的 id 必须与 `volume` 的不同；
  如果该后端无法渲染基于体数据的数据集，就省略 `volume`——
  这种情况下为此类数据集选择该后端会报出一个说明性的错误。
- `surface` —— 该后端的渲染模式画到哪个已有的合成画布上，取值为
  `'vtk'`（默认）或 `'cpu'`。自定义后端目前还不能注册自己的绘图表面，
  这正是上面提到的计划中的扩展点之一。
- `name` —— 可选的常量名，会被加入 `Enums.RenderBackends`，
  例如 `RenderBackends.WEBGPU`。

## TypeScript 类型增强 {#typescript-augmentation}

后端字符串的类型通过 `@cornerstonejs/core` 中两个可增强的 interface 保持开放。
在你扩展的 `.d.ts` 里增强它们，就能让新的字符串和常量名进入自动补全与类型检查：

```ts
declare module '@cornerstonejs/core' {
  interface RenderBackendRegistry {
    'myOrg:webgpu': 'myOrg:webgpu';
  }
  interface RenderBackendConstants {
    readonly WEBGPU: 'myOrg:webgpu';
  }
}
```

`RenderBackendRegistry` 供给 `RenderBackendValue` 这个字符串联合类型，
它是 `setRenderBackend()` 和 `renderBackend` 选项所接受的类型；
`RenderBackendConstants` 则为 `Enums.RenderBackends` 的属性提供类型。
