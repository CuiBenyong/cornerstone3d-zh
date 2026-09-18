---
id: advance-retrieve-config
title: 进阶选项
description: 渐进式加载的进阶配置选项。取回阶段侧包括 positions 指定精确影像位置、decimate 与 offset 实现交错、priority 与 requestType 控制优先级、nearbyFrames 复制邻近帧填空；取回选项侧包括 urlArguments、framesPath、imageQualityStatus，以及用 JPIP 或独立路径取回亚分辨率影像。
keywords:
  - 进阶取回配置
  - positions
  - decimate
  - offset
  - nearbyFrames
  - urlArguments
  - framesPath
  - JPIP
upstream: https://www.cornerstonejs.org/docs/concepts/progressive-loading/advance-retrieve-config
---

`取回阶段`和`取回选项`都还有一些更进阶的选项，
可以用来定制渐进式加载的行为。

:::tip
如果你（暂时）对进阶选项不感兴趣，可以跳过本节，
直接去看[用法一节](./usage.md)。基本上，这里的一部分选项
（position、decimate、offset、priority 和 nearbyFrames）
用在了「体数据渐进式加载」那个示例中，你之后可以再回来看。
:::

## 进阶的取回阶段选项 {#advanced-retrieve-stages-options}

### positions?: number[]; {#positions-number}

用于体数据渐进式加载——这时我们需要指定想取回的确切影像索引。
在通用的挂片协议中一般都是这样，因为初始影像通常位于堆栈的中间、顶部或底部。

你可以用绝对位置，也可以用 [0, 1] 之间的相对位置。
小于 0 的位置是相对末尾而言的，所以可以用 -1 表示堆栈中的最后一张影像。

示例

```js
stages: [
  {
    id: 'initialImages',
    positions: [0.5, 0, -1],
    retrieveType: 'initial', // 如前所述，名字可以随意取
  },
];
```

上面这个例子里，我们请求的是堆栈中间那张、第一张，以及最后一张影像。

:::tip
若要根据初始显示位置自动取回另一张初始影像，
可以把这些阶段复制一份，并在最前面加上一个带有你所需位置的新阶段。
这可以用来确保那张初始影像被取到。
:::

### decimate?: number 与 offset?: number; {#decimate-number--offset-number}

借助 decimate 和 offset 这两个特性，我们可以更灵活地指定要取回哪些影像。
例如，如果一份体数据包含 100 张影像，那么 decimate 取 2、offset 取 0
会取回影像 0、2、4、6、8、10、12、14、16、18……；
同理，decimate 取 2、offset 取 1 会取回影像 1、3、5、7、9、11、13、15、17、19……
这就展示了如何通过不同的 offset 和 decimate 取值来有效地交错取回影像。

重复取回同一张影像是安全的：当该影像的质量状态已经优于所指定的那次取回时，
这次取回会被丢弃。

```js
stages: [
  {
    id: 'initialImages',
    positions: [0.5, 0, -1],
    retrieveType: 'initial', // 如前所述，名字可以随意取
  },
  {
    id: 'initialPass',
    decimate: 2,
    offset: 0,
    retrieveType: 'fast', // 如前所述，名字可以随意取
  },
  {
    id: 'secondPass',
    decimate: 2,
    offset: 1,
    retrieveType: 'fast', // 如前所述，名字可以随意取
  },
];
```

上面有三个阶段：先取回初始影像，然后分两趟取回其余影像。
第一趟取回影像 0、2、4、6、8、10、12、14、16、18……；
第二趟取回影像 1、3、5、7、9、11、13、15、17、19……

### priority?: number 与 requestType {#priority-number--requesttype}

组合使用 requestType（thumbnail、prefetch、interaction）
和 priority（数值越小优先级越高），就能有效地为请求排定优先级。
例如你可以把初始影像的优先级设得比其余影像更高（数值更小），
这样就能保证初始影像在队列中被最先取回。

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
把可同时运行的最大请求数设小一些，以确保你真正需要的那些请求被优先执行。例如：

```javascript
imageLoadPoolManager.setMaxSimultaneousRequests(RequestType.INTERACTION, 6);
```

:::

### nearbyFrames?: NearbyFrames[]; {#nearbyframes-nearbyframes}

借助 nearbyFrames，你可以把邻近的帧填上，
从而瞬时填补并渲染出体数据中的空白处。

示例

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

上面我们指定了希望把当前帧的相邻帧（+1）复制出来。这样一来，
在下一阶段（secondPass）到来之前，我们就已经有可供渲染和显示的相邻帧了。
secondPass 随后会用真实数据把它们覆盖掉。

## 进阶的取回选项 {#advanced-retrieve-options}

### urlArguments {#urlarguments}

- urlArguments —— 要附加到 URL 上的一组参数
  - 它把这次请求与其他无法与之合并的请求区分开
  - DICOMweb 标准允许用 `accept` 参数来指定内容类型
  - HTJ2K 的内容类型是 `image/jhc`

对应的配置是（假定服务端支持基于标准的 DICOMweb）：

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
在一次范围请求的各个阶段中，你**必须**重复写上相同的 framesPath 和
urlArguments；否则系统会认为第一个范围取到的数据与第二个范围取到的
**不是**同一份数据，于是第二次范围请求会直接把整个请求重新取一遍。
:::

### framePath {#framepath}

- framesPath —— 用于改写 URL 的路径部分

这在需要取回另一条可用路径时很有用，例如缩略图、JPIP，
或用于有损编码取回的 rendered 端点——因为它们所在的路径
与无损编码影像的路径不同。

它同样有助于与那些「固定路径的替代编码服务器」集成——
那类服务器依据 URL 路径来决定返回哪个响应，
并把各种有损渲染结果存放在不同路径上。

### imageQualityStatus {#imagequalitystatus}

- imageQualityStatus —— 用于把取回状态设为有损或亚分辨率

它通常用在这种情形：URL 或取回参数指定了该路径下某种有损的最终渲染结果，
例如有损编码的 HTJ2K 影像。

## 为亚分辨率影像使用独立 URL {#separate-url-for-sub-resolution-images}

字节范围请求之外的另一种做法，是为一张完整但有损 / 低分辨率的影像
发出一个不同的请求。如果 DICOMweb 支持 `JPIP`，这可以是基于标准的；
但更常见的是非标准做法——为低分辨率取回使用一条单独的路径。

对这里展示的 `JPIP` 做法来说，`JPIP` 服务器必须暴露一个端点，
其路径与普通像素数据端点完全一致，只是结尾改为
`/jpip?target=<FRAMENO>`，并且支持 `fsiz` 参数。参见 DICOM 标准的
[Part 5](https://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_8.4.1)
和
[Part 18](https://dicom.nema.org/medical/dicom/current/output/html/part18.html#sect_8.3.3.1)。

对非标准路径的做法来说，前提假设是：除了常规的 `/frames` 端点之外，
还存在与之相关的其他端点，只是 URL 中 `/frames/` 那一段被换成了别的值。
例如可以借此取回 `stackProgressive` 示例中所用的 `/jlsThumbnail/` 数据。

`JPIP` 的一份配置示例：

```js
  retrieveOptions: {
    default: {
      // 需要在这里注明这是有损编码，因为仅凭这里的通用配置
      // 是无法检测出来的。
      imageQualityStatus: ImageQualityStatus.SUBRESOLUTION,
      // 一个假想的 JPIP 服务器，其路径就是常规 DICOMweb 路径，
      // 只是把 /frames 那一段换成了 /jpip?target=
      // 这里用的是基于标准的 JPIP target 参数，
      // 并把帧号作为它的取值。
      framesPath: '/jpip?target=',
      // 基于标准的 fsiz 参数用于取回一张亚分辨率影像
      urlArguments: 'fsiz=128,128',
    },
  },
```
