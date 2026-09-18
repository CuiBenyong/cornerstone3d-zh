---
id: viewportReferencePresentation
title: 视图引用与显示状态
description: 视图引用（ViewReference）指定视口显示的是哪张影像，显示状态（ViewPresentation）指定它如何呈现。两者配合可以把视图在视口之间转移、或记录下来稍后恢复。本文说明 referencedImageId 与参考坐标系两套信息、堆栈与体数据视口各自产出的引用，以及导航到标注、挑选最合适视口、视口缩放三个实用范例。
keywords:
  - ViewReference
  - ViewPresentation
  - setViewReference
  - isReferenceCompatible
  - referencedImageId
  - FrameOfReferenceUID
  - 视口同步
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/viewportReferencePresentation
---

# 视图引用与显示状态 {#viewport-image-selection-reference-and-presentation}

一个视口的视图引用与显示状态信息，共同指定了这个视口正在显示哪张影像、
以及这张影像是如何呈现的。它们以多种方式被指定，
使得一个视图可以从一个视口转移到另一个视口，或者被记录下来以便稍后恢复。
获取引用时，既可以针对当前影像，也可以针对堆栈中的某张特定影像——
后者的排序 / 编号方式与滚动位置的编号 / 排序方式一致。

一些具体的使用场景：

- 为某个工具引用一张特定影像
  - 用 `ViewReference` 指定要应用到哪张影像
  - 用 `isReferenceCompatible` 判断该工具是否应当显示
  - 用 `isReferenceCompatible` 判断一组视口中哪一个最适合导航到某张影像
  - 用 `setViewReference(viewRef)` 导航到指定影像
- 恢复早前的视图，或在堆栈与体数据之间互相转换
  - 用 `ViewReference` 和 `ViewPresentation` 保存影像信息
- 对影像集做插值
  - 用带特定影像位置的 `getViewReference`，取得位于中间的、
    或与邻近标注相关的影像引用，用于插值
- 调整尺寸与同步显示状态
  - 旧视口用 `getViewPresentation` 取得原有的显示状态信息，
    再用 `setViewPresentation(viewPres)` 恢复
  - 直接使用的通用 / Next 视口用 `viewportProjection.getPresentation(viewport)`
    读取显示状态，并把 `viewportProjection.withPresentation(...)`
    返回的原生视图状态通过 `viewport.setViewState(...)` 应用上去

## 视图引用 {#view-reference}

视图引用指定了一个视图包含哪张影像，通常以被引用的 imageId 来标识，
同时还带有参考坐标系 / 焦点相关的信息。具体来说，这让那些包含相同影像、
或相同参考坐标系、但排序方式不同（堆栈 imageId 或体数据）的视口之间
能够正确对应起来。

视图引用的一个非常重要的用途，是作为标注元数据的基础——
标注的元数据需要指明它适用于哪张影像。在这种情况下，视图引用既用于判断
某张影像是否适用于给定视图，也用于判断某个视口能否导航到并显示给定标注
（无论是否需要改变导航和 / 或方位）。之后，要导航到给定引用，
就调用 `viewport.setViewReference` 来施加这次导航。
这对正交视口和堆栈视口都适用。

`ViewReference` 包含若干决定视图的字段，其中重要的是：
堆栈视图用的 `referencedImageId`，以及体数据用的 `volumeId` 加上
`cameraFocalPoint、viewPlaneNormal、FrameOfReferenceUID`。
在条件允许时，堆栈视口和体数据视口都会把这两套信息都填上，
以便该视图能适用于任一种影像类型。

### referencedImageId {#referencedimageid}

referencedImageId 用于指定那些不基于参考坐标系的堆栈类影像。
它通常对应单张影像，堆栈视口可以用它导航到某张特定影像。
当正交视口获取某张采集方位单张影像的引用时也会提供这个值，
这样那些视图引用就能兼容堆栈视口。

#### `referencedImageId` 与 `sliceIndex` {#referencedimageid-and-sliceindex}

堆栈视口会结合 sliceIndex 和 referencedImageId，
尝试快速猜出给定 referencedImageId 所对应的 `imageIdIndex`。
如果给定 sliceIndex 处的 referencedImageId 与目标完全一致，
就可以直接使用这个 sliceIndex；否则它需要去查找 `imageIdIndex`。
`sliceIndex` 从来不是必需的。

对视频视口而言，referencedImageId 就是那个视频的 imageId，
而 slice index 既可以是单帧，也可以是一个数组表示的范围。

### 参考坐标系、焦点与法向量 {#frame-of-reference-focal-point-and-normal}

参考坐标系与焦点 / 法向量这几个值，可供正交视口用来指定采集平面之外的其他视图。
这些值在堆栈视口能提供时就会被提供，并可被体数据视口消费。

目前把它应用到体数据视口时三者都是必需的，
不过将来可能会支持用其他方式（而非提供法向量）来指定视图。

### `volumeId`、`sliceIndex` 与 `viewPlaneNormal` {#volumeid-sliceindex-and-viewplanenormal}

当正交视口创建视图引用时，它会带上体数据 id、切片索引和视平面法向量。
这使得判断「某个视口是否正在显示给定引用」以及「快速导航到给定视图」
都可以很快完成。它主要用在 `isReferenceCompatible` 里——
为了判断标注工具的视图，这个函数在正交视图上可能被调用很多次。

注意，堆栈视口不会提供 `volumeId`，因此这项优化对那类引用不适用。

这些值对导航来说不是必需的，但对标注显示的检测是必需的，
用来判断视图的适用性。

### 堆栈视口产出的引用 {#stack-viewport-references}

堆栈视口创建的引用包含：

- referencedImageId 和 sliceIndex
- 在可用时，还包含参考坐标系、焦点和法向量

它对当前显示的影像、以及通过切片索引引用的影像都能这么做，
其中切片索引是指在 imageIds 中的索引。

*警告*：不要假定体数据的切片索引与堆栈的切片索引之间有任何对应关系，
也不要假定两个显示**同一张影像**的堆栈会使用相互对应的切片索引，
更不要假定帧号与切片索引之间有**任何**对应关系。

堆栈视口只能导航到包含 referencedImageId 的视图引用；
它不会（实际上也做不到，因为信息不足）基于体数据 / 相机等信息
去导航或推断出合适的影像。

对堆栈视口来说，`isReferenceCompatible` 还会额外用切片索引
做一次「该影像是否就在给定位置」的快速检查，
但它并不依赖切片索引来得出结论——只是这样更快而已。

### 体数据视口产出的引用 {#volume-viewport-references}

体数据视口创建的引用包含：

- 适用于采集视图的 referencedImageId
- 参考坐标系、焦点和法向量

此外，正交视口还会加上：

- 当前聚焦视图的 volumeId 和切片索引。

正交视口会先用 volume id、切片索引和法向量来判断该引用是否适用、
或者导航到它。之后，两类体数据视口都会再应用参考坐标系 / 焦点 / 法向量。

针对一维和二维点的检测行为，将来可能会再补充
（以便让线和点显示在非原始视图上）。

## 显示状态 {#view-presentation}

显示状态指定了一个视口的平移、缩放和 VOI 信息。平移和缩放以相对于视口尺寸
和原始显示区域（如有指定则会一并包含）的百分比值表示。
这使得同一份显示状态能被应用到各种尺寸的视口上，
无论它们是否显示同一个影像实例。

VOI 是相对于影像数据中指定的基础 LUT 而言的，也就是说它不包含模态 LUT
和显示 LUT 变换。目前只指定窗宽 / 窗位，不过将来可能会允许完整的查找表。

显示状态的一些典型用途：

- 记住一张影像是如何呈现的，以便稍后以相同的显示状态再次显示——
  例如某个视口先被用来显示另一个堆栈、之后又回到原来那个堆栈时。
- 同步那些相似但不完全相同的视口，例如在不同的 CT 视图之间
  同步部分或全部显示属性。
- 视口尺寸变化时，用它记住相对位置，让影像保持在相同的「相对」位置上。

## `setViewReference` 与显示状态 {#setviewreference-and-view-presentation}

`viewport.setViewReference` API 会导航到指定的引用。旧的视口类以及临时兼容适配器
也暴露了 `viewport.setViewPresentation` 用于直接应用显示状态，
但这个旧的显示状态变更辅助方法应当预期会在后续某个破坏性版本中
从兼容层移除。直接使用的通用 / Next 视口不暴露该变更 API；
请用 `viewportProjection.withPresentation(...)` 把显示状态补丁翻译成
该视口族的原生 `ViewState`，然后调用 `viewport.setViewState(...)`。

如果引用和显示状态都要应用，那么**必须先应用视图引用**。
之后还需要执行一次渲染来完成这次视图变更，因为视图的多个部分都可能受到影响。

下面给出几种用途的示例代码。这里假设 `viewports` 是一个包含各类视口的数组，
`viewport` 是要施加改动的某一个具体视口，
引用和显示状态分别存放在 `viewRef` 和 `viewPres` 中。

### 导航到给定标注 {#navigate-to-a-given-annotation}

```javascript
const { metadata } = annotation;
if (viewport.isReferenceCompatible({ withNavigation: true })) {
  viewport.setViewReference(metadata);
} else {
  // 抛出错误说明该视图不兼容，或采取其他行为
  // 例如切换为体数据、或改为显示另一组 imageId 等
}
```

### 挑选最适合显示某个标注的视口 {#finding-the-best-viewport-for-displaying-an-annotation}

```javascript
function findViewportForAnnotation(annotation, viewports) {
  const { metadata } = annotation;

  // 如果已经有视口在显示它，直接返回那个视口。
  const alreadyDisplayingViewport = viewports.find((viewport) =>
    viewport.isReferenceCompatible(metadata)
  );
  if (alreadyDisplayingViewport) return alreadyDisplayingViewport;

  // 如果有视口只需要导航一下就行，返回它
  const navigateViewport = viewports.find((viewport) =>
    viewport.isReferenceCompatible(metadata, { withNavigation: true })
  );
  if (navigateViewport) return navigateViewport;

  // 如果有视口正在显示该体数据、且可以改变方位，就用它
  const orientationViewport = viewports.find((viewport) =>
    viewport.isReferenceCompatible(metadata, { withOrientation: true })
  );
  if (orientationViewport) return orientationViewport;

  // 如果有堆栈视口可以转换为体数据来显示它，那就这么做
  const stackToVolumeViewport = viewports.find((viewport) =>
    viewport.isReferenceCompatible(metadata, {
      withOrientation: true,
      asVolume: true,
    })
  );
  if (stackToVolumeViewport) {
    // 在这里把堆栈视口转换为体数据视口
    return stackToVolumeViewport;
  }

  // 也可以再找找显示同一参考坐标系、但不同体数据的视口

  // 从元数据中找出对应的 imageId 集合或 volumeId，
  // 应用到位置 0 的那个视口上并显示出来。
}
```

### 调整视口尺寸 {#resize-the-viewports}

```javascript
const resizeObserver = new ResizeObserver(() => {
  if (resizeTimeout) {
    return;
  }
  resizeTimeout = setTimeout(resize, 100);
});

function resize() {
  resizeTimeout = null;
  const renderingEngine = getRenderingEngine(renderingEngineId);

  if (renderingEngine) {
    // 旧视口路径：先把改动之前的显示状态存下来，之后再恢复。
    const presentations = viewports.map((viewport) =>
      viewport.getViewPresentation()
    );

    // 施加尺寸变化
    renderingEngine.resize(true, false);

    // 恢复显示状态，这样会重置相对位置，
    // 而不是把它们重置为 null。
    viewports.forEach((viewport, idx) => {
      viewport.setViewPresentation(presentations[idx]);
    });
  }
}

resizeObserver.observe(viewportGrid);
```

对直接使用的通用 / Next 视口，显示状态的读写都放在投影服务上：

```javascript
const presentations = viewports.map((viewport) =>
  viewportProjection.getPresentation(viewport)
);

renderingEngine.resize(true, false);

viewports.forEach((viewport, index) => {
  const nextViewState = viewportProjection.withPresentation(
    viewport,
    presentations[index]
  );

  if (nextViewState) {
    viewport.setViewState(nextViewState);
  }
});
```
