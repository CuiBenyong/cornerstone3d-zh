---
id: viewportReferencePresentation
title: 视口图像选择参考和呈现
---

# 视口图像选择参考和呈现

视口的参考和呈现信息指定视口的图像正在显示，以及图像的呈现。这些以多种方式指定以便可以将视图从一个视口转移到另一个视口，或者可以按顺序记住以便稍后恢复视图。可以为当前图像获取参考，或堆栈中的特定图像，以与滚动位置相同的方式排序/编号已编号/已排序。
一些具体的用例是：

- 引用工具的特定图像
  - 使用“ViewReference”指定要应用的图像
  - 使用“isReferenceCompatible”来确定是否应显示该工具
  - 使用“isReferenceCompatible”来确定一组视口中的哪一个最适合导航到图像
  - 使用“setViewReference(viewRef)”导航到指定图像
- 恢复早期视图或从堆栈转换为体积，反之亦然
- 使用`ViewReference`和`ViewPresentation`来存储图像信息
- 对图像集应用插值
  - 使用具有特定图像位置的“getViewReference”来获取对的引用之间的图像或与附近注释相关的图像以进行插值
- 调整大小和同步显示演示
  - 使用`getViewPresentation`获取旧的演示信息，然后使用 setViewPresentation(viewPres) 恢复

## 视图引用

视图引用指定视图包含什么图像，通常标识为引用的图像图像 ID，以及参考系/焦点相关信息。具体来说，这允许包含相同图像或相同参考系的视口之间正确关联但以不同的顺序、堆栈图像 ID 或体积。

视图引用的一个非常重要的用例是作为注释元数据的基础其中注释元数据指定它适用于哪个图像。其中的视图参考case 用于确定图像是否适用于给定视图，以及确定视口是否可以导航以显示给定的注释（带或不带）导航和/或方向改变。然后，要导航到给定的参考，调用“viewport.setViewReference”来应用给定的导航。这可以适用于正交视口和堆栈视口。

`ViewReference` 包含许多确定视图、重要的是堆栈视图的“referencedImageId”和组合的“volumeId”对于体积，使用“cameraFocalPoint、viewPlaneNormal、FrameOfReferenceUID”。如果可能，堆栈和体积视口都会填充两组信息以允许视图应用于任一图像类型。

### 引用的ImageId

参考图像 ID 允许指定基于非参考框架的堆栈类型图像。这是通常是单个图像，并且可以由堆栈视口使用来导航到特定图像。该值由正交视口在获取对采集的引用时提供定向单个图像，以便这些视图引用与堆栈视口兼容。

#### `referencedImageId` 和 `sliceIndex`

堆栈视口使用sliceIndex和referencedImageId组合来尝试快速猜测给定引用图像 ID 的“imageIdIndex”值。如果引用的ImageId是与给定的 sliceIndex 处的相同，则可以直接使用该 sliceIndex，否则它需要找到`imageIdIndex`。 `sliceIndex` 从来都不是必需的。

对于视频视口，引用的图像 id 将是视频图像 id，而切片索引可以是单个帧，也可以是数组范围

### 参考系、焦点和法线

正交视口可以使用参考系和焦点/法线值来指定采集平面视图以外的其他视图。这些值可从以下位置获得：堆栈视口，并且可由体积视口使用。

目前，应用到体积视口需要全部三个，尽管将来可能可以通过其他方式指定视图比提供正常的。

### `volumeId`、`sliceIndex` 和 `viewPlaneNormal`

当正交视口创建视图参考时，它包括体积 id、切片索引和视图平面法线。这样可以快速识别视口是否显示给定的参考，以及快速导航到给定的视图。这主要用于“isReferenceCompatible”，它可以在正交视图上多次调用以确定注释工具意见。请注意，堆栈视口不会提供“volumeId”，因此此优化不能用于这些参考。

导航不需要这些值，但注释显示检测需要这些值他们需要检测视图的适用性。

### 堆栈视口参考

堆栈视口创建的引用包含：

- referencedImageId 和 sliceIndex
- 参考系、焦点和法线（如果有）

它可以对当前显示的图像和引用的图像执行此操作切片索引，其中切片索引是 imageId 的索引。

_警告_ 不要假设体积的切片索引以任何方式与堆栈的切片索引，或者显示相同图像的两个堆栈使用对应的切片索引切片索引，或者帧号与切片索引有任何相关性，反之亦然。

stack视口只能导航到包含referencedImageId的视图引用，它将（实际上由于缺少信息而无法）导航或发现适当的基于体积/相机等的图像

堆栈视口的 isReferenceCompatible 将另外使用切片用于快速检查是否在给定位置找到图像的索引，但不依赖切片索引，这样速度更快。

### 体积视口参考

体积视口创建参考：

- 适合采集视图的referencedImageId
- 参考系、焦点和法线

此外，正交视口还添加：

- 焦点视图的volumeId 和切片索引。

正交视口将首先使用任何体积 ID、切片索引和法向确定参考是否适用或导航到它。然后，两个体积视口都将应用参考系/焦点/法线。可以在中添加用于检测 1d 和 2d 点的特定附加行为未来（允许线和点出现在原始视图之外）。

## 视图呈现

视图呈现指定了视口的平移、缩放和 VOI 信息。
平移和缩放指定为相对于视口尺寸和原始显示区域（如有指定，则包括在内）的百分比值。
和原始显示区域（如果指定，则包括原始显示区域）的百分比值。这样就可以将相同的视图显示应用于各种视口尺寸，而这些视口尺寸可能会也可能不会显示相同的图像实例。显示同一图像实例。

VOI 相对于图像数据中指定的基本 LUT。也就是说也就是说，它不包括模式和显示 LUT 变换。目前只指定了窗口宽度/中心，但以后可能允许使用完整的查找表。

视图呈现的一些典型用例是：

- 记住图像的呈现方式，以便稍后显示相同的呈现，例如，当一个视口用于显示另一个堆栈然后返回到原始堆栈。
- 同步相似但不相同的视口，例如同步部分或全部演示文稿不同 CT 视图之间的属性。
- 调整视口大小，用于记住相对位置，以便图像保持在相同的“相对”位置。

## `setViewReference` 和 `setViewPresentation`

`viewport.setViewReference` 和 `viewport.setViewPresentation` 导航到指定的参考并应用给定的演示文稿。如果两者都在应用，则必须首先应用视图引用。需要渲染之后完成视图更改，因为视图的多个部分可能会受到影响。

下面显示了一些示例代码，用于各种用途。这假设`viewports` 是各种类型视口的数组，而 `viewport` 是要应用更改的特定对象。参考和介绍是分别在“viewRef”和“viewPres”中。

### 导航到给定注释

```javascript
const { metadata } = annotation;
if (viewport.isReferenceCompatible({ withNavigation: true })) {
  viewport.setViewReference(metadata);
} else {
    //抛出错误，指示视图不兼容或其他行为
    //例如更改音量或显示一组不同的图像 ID 等
}
```

### Finding the best viewport for displaying an annotation

```javascript
function findViewportForAnnotation(annotation, viewports) {
  const { metadata } = annotation;

  //如果已经有一个视口显示此内容，则返回它。
  const alreadyDisplayingViewport = viewports.find((viewport) =>
    viewport.isReferenceCompatible(metadata)
  );
  if (alreadyDisplayingViewport) return alreadyDisplayingViewport;

  //如果有一个视口只需要导航，则返回它  
  const navigateViewport = viewports.find((viewport) =>
    viewport.isReferenceCompatible(metadata, { withNavigation: true })
  );
  if (navigateViewport) return navigateViewport;

  //如果有一个视口显示可以更改方向的体积，请使用它
  const orientationViewport = viewports.find((viewport) =>
    viewport.isReferenceCompatible(metadata, { withOrientation: true })
  );
  if (orientationViewport) return orientationViewport;

  // 如果有一个堆栈视口可以转换为体积来显示这一点，那么就这样做
  const stackToVolumeViewport = viewports.find((viewport) =>
    viewport.isReferenceCompatible(metadata, {
      withOrientation: true,
      asVolume: true,
    })
  );
  if (stackToVolumeViewport) {
    // 在此将堆栈转换为体积视口
    return stackToVolumeViewport;
  }
    //也可能寻找显示相同参考系但不同体积的视口

    //从元数据中查找图像 id 或volumeId 集并应用它
    //到位置 0 的视口并显示它。
}
```

### 调整视口大小

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
    // 存储之前的演示文稿以供之后使用
    const presentations = viewports.map((viewport) =>
      viewport.getViewPresentation()
    );

    // 应用调整大小
    renderingEngine.resize(true, false);

    //恢复演示文稿，因为这将重置相对位置
    //而不是重置为 null。
    viewports.forEach((viewport, idx) => {
      viewport.setViewPresentation(presentations[idx]);
    });
  }
}

resizeObserver.observe(viewportGrid);
```
