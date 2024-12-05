---

id: advance-retrieve-config
title: 高级选项

---

对于`retrieve stages`和`retrieve options`，都有更多高级选项，可以用来定制渐进加载的行为。

:::tip
如果你对高级选项不感兴趣（暂时），可以跳过这个部分，并直接转到[`使用`部分](./usage)。基本上，这些选项中的一些（position, decimate, offset, priority, 和 nearbyFrames）在“体积渐进”示例中使用，你可以稍后再回顾。
:::

## 高级检索阶段选项

### positions?: number[];

用于体积进度加载，我们需要指定我们想要检索的确切图像索引。在一般的挂起协议中，这通常是正确的，因为初始图像通常在堆栈的中间、顶部或底部。

你可以使用绝对位置或相对位置在 [0, 1] 之间。小于 0 的位置相对于结束，因此你可以使用 -1 表示堆栈中的最后一张图像。

例子

```js
stages: [
  {
    id: 'initialImages',
    positions: [0.5, 0, -1],
    retrieveType: 'initial', // 像讨论的那样任意命名
  },
];
```

在上面的例子中，我们正在请求堆栈中的中间图像、第一张图像和最后一张图像。

:::tip
要根据初始显示位置自动检索其他初始图像，复制阶段，并添加一个具有所需位置的新阶段，将该阶段放在首位。这可以用来确保初始图像被获取。
:::

### decimate?: number & offset?: number;

通过利用decimate和offset功能，我们可以增强指定检索所需图像的灵活性。例如，如果一个体积包含100张图像，应用decimate值为2和offset值为0将检索图像0、2、4、6、8、10、12、14、16、18，等等。同样，使用decimate值为2和offset值为1将检索图像1、3、5、7、9、11、13、15、17、19，等等。这表明我们可以通过利用不同的偏移和decimate值来有效地交错图像。

重复图像提取是安全的，因为当图像质量状态已经优于指定的提取时，提取将被丢弃。

```js
stages: [
  {
    id: 'initialImages',
    positions: [0.5, 0, -1],
    retrieveType: 'initial', // 像讨论的那样任意命名
  },
  {
    id: 'initialPass',
    decimate: 2,
    offset: 0,
    retrieveType: 'fast', // 像讨论的那样任意命名
  },
  {
    id: 'secondPass',
    decimate: 2,
    offset: 1,
    retrieveType: 'fast', // 像讨论的那样任意命名
  },
];
```

上面我们有三个阶段，首先我们检索初始图像，然后我们在两次通过中检索其余图像。第一次通过将检索图像0、2、4、6、8、10、12、14、16、18等等。第二次通过将检索图像1、3、5、7、9、11、13、15、17、19等等。

### priority?: number & requestType

使用requestType（缩略图、预取、交互）和priority（数值越低优先级越高）的组合，你可以有效地优先处理请求。例如，你可以将初始图像的优先级设置得比其余图像高（数值较低）。这将确保初始图像首先在队列中被检索。

```js
stages: [
  {
    id: 'initialImages',
    positions: [0.5, 0, -1],
    retrieveType: 'initial',
    requestType: RequestType.INTERACTION,
    priority: -1,
  },
  {
    id: 'initialPass',
    decimate: 2,
    offset: 0,
    retrieveType: 'fast',
    priority: 2,
    requestType: RequestType.PREFETCH,
  },
  {
    id: 'secondPass',
    decimate: 2,
    offset: 1,
    retrieveType: 'fast',
    priority: 3,
    requestType: RequestType.PREFETCH,
  },
];
```

:::tip
将允许的最大请求数设置为较低值，以确保你的必需请求首先被执行。例如：

```javascript
imageLoadPoolManager.setMaxSimultaneousRequests(RequestType.INTERACTION, 6);
```

:::

### nearbyFrames?: NearbyFrames[];

使用附近的帧，你可以选择填充附近的帧以瞬间填充和渲染体积中的空白空间。

例子

```js
stages: [
  {
    id: 'initialPass',
    decimate: 2,
    offset: 0,
    retrieveType: 'fast',
    priority: 2,
    requestType: RequestType.PREFETCH,
    nearbyFrames: [
      {
        offset: +1,
        imageQualityStatus: ImageQualityStatus.ADJACENT_REPLICATE,
      },
    ],
  },
  {
    id: 'secondPass',
    decimate: 2,
    offset: 1,
    retrieveType: 'fast',
    priority: 3,
    requestType: RequestType.PREFETCH,
  },
];
```

在上面，我们指定我们希望复制当前帧的相邻帧（+1）。这样，在下一阶段（secondPass）到来之前，我们将有相邻的帧准备好被渲染和显示。secondPass将用实际数据覆盖它们。

## 高级检索选项

### urlArguments

- urlArguments - 是一组添加到URL的参数
  - 这将请求与其他无法与其组合的请求区分开来
  - DICOMweb标准允许`accept`参数指定内容类型
  - HTJ2K内容类型是`image/jhc`

假设基于标准的DICOMweb支持，配置如下：

```js
retrieveOptions: {
  default: {
    urlArguments: 'accept=image/jhc',
    rangeIndex: -1,
  },
  multipleFast: {
    urlArguments: 'accept=image/jhc',
    rangeIndex: 0,
    decodeLevel: 0,
  },
},
```

:::warning
在范围请求的每个阶段中，你必须重复相同的framesPath和urlArguments，否则假设是第一个范围中检索的数据与第二个范围中检索的数据不同，第二个范围请求将检索整个请求。
:::

### framePath

- framesPath - 用于更新URL路径部分

这对于获取其他可用路径（例如缩略图、JPIP或渲染端点以进行有损编码检索）非常有用，因为它们位于不同于无损编码图像的路径上。

这也对于集成固定路径备用编码服务器有用，这些服务器根据URL路径选择返回的响应，将各种有损渲染存储在不同的路径上。

### imageQualityStatus

- imageQualityStatus - 用于将检索状态设置为有损或低分辨率

这通常用于当URL或检索参数指定给定路径的有损最终渲染时，例如有损编码的HTJ2K图像。

## 单独的低分辨率图像URL

字节范围请求的替代方法是为完整但有损/低分辨率图像发出不同的请求。假设DICOMweb支持`JPIP`，这可以基于标准，或者更有可能使用单独的路径进行低分辨率提取，这不是基于标准。

对于这里展示的`JPIP`方法，`JPIP`服务器必须暴露一个路径与普通像素数据端点相同但以`/jpip?target=<FRAMENO>`结尾的端点，并支持`fsiz`参数。参见
[DICOM标准第5部分](https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_8.4.1)和
[DICOM标准第18部分](https://dicom.nema.org/medical/dicom/current/output/html/part18.html#sect_8.3.3.1)。

对于非标准路径方法，假设存在与普通`/frames`端点相关的其他端点，除了将URL的`/frames/`部分替换为其他值。例如，这可以用于提取`/jlsThumbnail/`数据，如在`stackProgressive`示例中使用的一样。

一个`JPIP`的配置示例：

```js
  retrieveOptions: {
    default: {
      // 需要注意这是一个有损编码，因为根据这里的一般配置无法检测到。
      imageQualityStatus: ImageQualityStatus.SUBRESOLUTION,
      // 假设的JPIP服务器使用与普通DICOMweb路径相同但用/jpip?target=替换/frames路径
      // 这使用基于标准的目标JPIP参数，并将帧号分配为此处的值。
      framesPath: '/jpip?target=',
      // 基于标准的fsiz参数检索低分辨率图像
      urlArguments: 'fsiz=128,128',
    },
  },
```