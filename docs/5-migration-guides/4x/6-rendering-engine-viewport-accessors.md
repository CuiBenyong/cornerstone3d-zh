---
id: rendering-engine-viewport-accessors
title: 渲染引擎的视口访问器
description: RenderingEngine 的 getStackViewport、getStackViewports、getVolumeViewports 已被移除。改用 getViewport / getViewports 配合能力守卫来筛选。本文说明为何这样改动，并给出三个被移除访问器各自的迁移写法与新增的全部能力守卫。
keywords:
  - getStackViewport 已移除
  - getVolumeViewports
  - viewportSupportsStackCompatibility
  - viewportSupportsImageSlices
  - 能力守卫
  - PlanarViewport
  - Cornerstone3D 4.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/4x/rendering-engine-viewport-accessors
---

# 渲染引擎的视口访问器 {#rendering-engine-viewport-accessors}

## 概览 {#overview}

`RenderingEngine.getStackViewport()`、`RenderingEngine.getStackViewports()`
和 `RenderingEngine.getVolumeViewports()` 已被移除。

请改用 `getViewport()` 或 `getViewports()`，然后按你所需的**行为**来筛选。

这项改动对 ViewportV2 很重要：因为一个 `PlanarViewport` 可以暴露
堆栈式或体数据式的兼容方法，却并不是 `StackViewport` 或 `VolumeViewport`。

## 为什么要做这项改动 {#why-this-changed}

旧的那几个访问器是按旧的具体类来分类视口的。

这在 V2 视口上就行不通了——同一个视口可能同时支持：

- 影像切面类工作流，例如 `setStack()`
- 体数据类工作流，例如 `setVolumes()`
- 共享的影像查询，例如 `getCurrentImageId()` 或 `hasImageURI()`

而它实际上并不属于旧的堆栈或体数据视口类型。

## 迁移 {#migration}

### `getStackViewport(viewportId)` {#getstackviewportviewportid}

迁移前：

```ts
const viewport = renderingEngine.getStackViewport(viewportId);
await viewport.setStack(imageIds);
```

迁移后：

```ts
import { utilities } from '@cornerstonejs/core';

const viewport = renderingEngine.getViewport(viewportId);

if (!utilities.viewportSupportsStackCompatibility(viewport)) {
  throw new Error(`Viewport ${viewportId} does not implement setStack`);
}

await viewport.setStack(imageIds);
```

### `getStackViewports()` {#getstackviewports}

迁移前：

```ts
const stackViewports = renderingEngine.getStackViewports();
```

迁移后：

```ts
import { utilities } from '@cornerstonejs/core';

const stackViewports = renderingEngine
  .getViewports()
  .filter(utilities.viewportSupportsStackCompatibility);
```

如果你只需要影像切面类的查询，就改用更窄的那个守卫：

```ts
const sliceViewports = renderingEngine
  .getViewports()
  .filter(utilities.viewportSupportsImageSlices);
```

### `getVolumeViewports()` {#getvolumeviewports}

迁移前：

```ts
const volumeViewports = renderingEngine.getVolumeViewports();
```

迁移后：

选择与你所需操作相匹配的那个守卫：

```ts
import { utilities } from '@cornerstonejs/core';

const volumeInputViewports = renderingEngine
  .getViewports()
  .filter(utilities.viewportSupportsVolumeCompatibility);

const volumeActorViewports = renderingEngine
  .getViewports()
  .filter(utilities.viewportSupportsVolumeActors);

const volumeURIViewports = renderingEngine
  .getViewports()
  .filter(utilities.viewportSupportsVolumeURI);
```

## 新增的能力守卫 {#new-capability-guards}

Cornerstone3D 现在在 `utilities` 下暴露了这些基于能力的辅助函数：

- `viewportSupportsStackCompatibility`
- `viewportSupportsImageSlices`
- `viewportSupportsStackCalibration`
- `viewportSupportsVolumeCompatibility`
- `viewportSupportsVolumeActors`
- `viewportSupportsVolumeId`
- `viewportSupportsVolumeURI`

有了这些守卫，你的代码就可以依赖「所支持的行为」，
而不再依赖旧的视口类。
