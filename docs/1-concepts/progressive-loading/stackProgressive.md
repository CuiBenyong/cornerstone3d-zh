---
id: stackProgressive
title: 堆栈渐进式加载
description: 以堆栈视口为例说明渐进式加载，并给出与常规加载的对比基准数据。对 3036×3036、11.1 MB 的测试影像，HTJ2K 流式单阶段首帧渲染 66ms、字节范围两阶段 45ms，而基线完整渲染需约 5 秒。文中给出两种取回配置的完整代码。
keywords:
  - 堆栈渐进式加载
  - HTJ2K 流式
  - 字节范围
  - retrieveConfiguration
  - singleFast
  - decodeLevel
  - 性能基准
upstream: https://www.cornerstonejs.org/docs/concepts/progressive-loading/stackProgressive
---

这里我们以堆栈视口的渐进式加载作为一个使用场景来展开，
并把它与常规加载做基准对比。我们会讨论得更细一些，
包括涉及多阶段渐进式加载和不同取回类型的情形。

:::tip
对堆栈视口而言，较大的影像可以用流式方式解码：
HTJ2K RPCL 影像以数据流的形式接收，其中一部分一旦可用就被解码。
这可以显著改善堆栈影像的浏览体验，
而且除了需要服务器支持 HTJ2K RPCL 传输语法之外，不要求任何特殊的服务端条件。
:::

# 基准数据 {#benchmark}

一般来说，影像的有损 / 首个版本只需取回大约 1/16 到 1/10 的数据量。
这让首批影像的速度有了显著提升。这个提升幅度受影像总体尺寸、
网络性能和压缩比的影响相当大。

**完整尺寸的测试影像为 3036 × 3036，大小 11.1 MB。**

| 类型                        | 网络 | 数据量 | 首帧渲染 | 完整渲染（基线） |
| --------------------------- | ---- | ------ | -------- | ---------------- |
| HTJ2K 流式（1 阶段）        | 4g   | 11.1 M | 66 ms    | 5053 ms          |
| HTJ2K 字节范围（2 阶段）    | 4g   | 128 K  | 45 ms    | 4610 ms          |

上面这项测试所用的配置如下。

## HTJ2K 流式（1 阶段） {#htj2k-streaming-1-stage}

这份配置会用单阶段的流式响应取回影像。它对流式和非流式传输语法都可以安全使用，
但只有在配合 HTJ2K 传输语法时，解码那一部分才会真正启用。
对 HTJ2K 解码来说，如果影像**不是** RPCL 格式，
那么可能会发生其他形式的解码递进，例如按区域解码
（比如左上、右上、左下、右下），或者在完整数据到齐之前解码一直失败。

:::tip
可以用 `urlParameters: accept=image/jhc` 以符合标准的方式请求 HTJ2K。
:::

```js
const retrieveConfiguration = {
  // stages 默认取 singleRetrieveConfiguration
  retrieveOptions: {
    single: {
      streaming: true,
    },
  },
};
```

## HTJ2K 字节范围（2 阶段） {#htj2k-byte-range-2-stages}

这份顺序取回配置指定了两个阶段，每个阶段都作用于整批 imageId。
第一阶段用 `singleFast` 取回类型加载每张影像，
第二阶段再用 `singleFinal` 取回。

注意这份取回配置要求服务端支持字节范围请求。对不支持字节范围请求的服务器，
它**可能**也是安全的，但那些请求也可能在发起时失败。
请查阅你所用服务器的 DICOM 一致性声明。

:::tip
你可以再加第三个用于错误恢复的阶段，其中去掉所有字节范围请求。
这个阶段只有在前面各阶段失败时才会被执行，
从而应对服务端支持情况未知的场景。
:::

```js
const retrieveConfiguration = {
  // 这份 stages 列表也可以直接用 sequentialRetrieveStages
  stages: [
    {
      id: 'lossySequential',
      retrieveType: 'singleFast',
    },
    {
      id: 'finalSequential',
      retrieveType: 'singleFinal',
    },
  ],
  retrieveOptions: {
    singleFast: {
      rangeIndex: 0,
      decodeLevel: 3,
    },
    singleFinal: {
      rangeIndex: -1,
    },
  },
};
```
