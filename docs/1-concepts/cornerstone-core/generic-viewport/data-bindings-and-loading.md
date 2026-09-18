---
id: data-bindings-and-loading
title: 数据绑定与加载
description: 通用视口如何把加载、绑定、视口导航与渲染外观四件事分开。说明数据提供者（DataProvider）的职责、视口数据绑定（ViewportDataBinding）的角色与 applyViewState 机制、显示状态的拆分方式、分割绑定的挂载方式，以及完整的加载流程。
keywords:
  - DataProvider
  - ViewportDataBinding
  - applyViewState
  - setDisplaySetPresentation
  - DataPresentation
  - useSliceRendering
  - 通用视口
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/generic-viewport/data-bindings-and-loading
---

# 数据绑定与加载 {#data-bindings-and-loading}

通用视口把加载、绑定、视口导航和渲染外观这四件事分开。

视口请求它的 `DataProvider` 加载某个逻辑数据 id。加载得到的数据被交给选中的渲染路径，
渲染路径随后返回一个 `ViewportDataBinding`。这个绑定包含已挂载的运行时渲染实现，
以及视图状态、数据显示状态、渲染、尺寸变化和清理这几类回调。

## 数据提供者 {#data-provider}

数据提供者负责把应用层的数据 id 转换成已加载的数据。对平面视口来说，
这一步可能解析出 imageId、体数据、采集方位、元数据，以及内部选定的有效渲染路径。
加载得到的对象只是描述数据本身，它不拥有视口导航。

## 视口数据绑定 {#viewport-data-binding}

一个绑定代表一对已挂载的「数据 + 渲染路径」。它带有一个角色：

- `source`（源）定义视口使用的活动视图。
- `overlay`（叠加）绘制与源数据对齐的附加数据。

每当视口的导航状态发生变化，绑定就会收到 `applyViewState(viewState)`。
这取代了早前 `updateCamera()` 那套说法——因为绑定是在**施加**视口状态，
而不是**持有**相机真值。

视口以显示集（display set）id 为键来保存这些绑定。这意味着工具和应用代码
可以只更新某一份已挂载的显示集，而不必伸手去操作 actor 或 mapper 对象：

```ts
viewport.setDisplaySetPresentation(petDataId, {
  visible: false,
});

viewport.render();
```

`reference` 是已注册数据上的一个可选语义关系。当某个绑定渲染的内容派生自另一个对象时
会用到它，比如分割标签图、体数据、影像、几何数据，或者另一个数据 id。
它**不是** actor id，也不用作运行时的 actor 身份标识。

```ts
utilities.genericViewportDisplaySetMetadataProvider.add(labelmapDataId, {
  kind: 'planar',
  imageIds: labelmapImageIds,
  reference: {
    kind: 'segmentation',
    segmentationId,
    representationUID,
    labelmapId,
  },
});
```

## 显示状态的拆分 {#presentation-split}

视口状态和数据显示状态的归属是不同的：

- `viewState` 是视口本地的导航与布局状态。
- `DataPresentation` 是每个绑定各自的外观设置，例如 VOI、不透明度、颜色映射表、
  插值方式、可见性，或播放相关的显示状态。

有了这个拆分，一个视口只需平移、缩放、旋转、导航一次，
而多个绑定各自按自己的外观设置渲染。

## 分割绑定 {#segmentation-bindings}

标签图分割使用同一套绑定模型。分割显示工具创建或解析出标签图数据，
把它注册为平面数据，然后作为叠加绑定挂载。启用 `useSliceRendering` 后，
兼容的体数据标签图会走切面 / 影像叠加路径渲染，而不是旧的体数据标签图 actor 路径。

```ts
await segmentation.addLabelmapRepresentationToViewportMap({
  [viewportId]: [
    {
      segmentationId,
      config: {
        useSliceRendering: true,
      },
    },
  ],
});
```

在内部，这个表示形式被映射为叠加数据：

```ts
await viewport.addDisplaySet(labelmapDataId, {
  orientation: viewport.getViewState().orientation,
  role: 'overlay',
});
```

分割本身仍归工具库的分割状态所有。视口只拥有用于渲染它的那个已挂载叠加绑定。

## 加载流程 {#loading-flow}

典型流程是这样的：

1. 视口依据数据集形态、方位和渲染配置推断出渲染路径。
2. 视口带着这个内部决策调用 `dataProvider.load(dataId, options)`。
3. 渲染路径解析器为已加载的数据选出运行时路径。
4. 渲染路径挂载运行时资源，并返回一个绑定。
5. 视口把这个绑定连同它的数据 id 和角色一起存下来。
6. 视口把当前的 `viewState` 和数据显示状态推送给该绑定。
7. 绑定在渲染或尺寸变化时把这些状态投射为渲染器指令。

在整个流程中，导航状态始终归视口所有。
