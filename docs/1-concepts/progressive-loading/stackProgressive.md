---
id: stackProgressive
title: 分层渐进加载
---

在这里，我们将探索 stackViewports 的渐进加载，作为渐进加载的一个示例用例，并将其与常规加载进行基准测试。我们将更详细地讨论这一点，包括涉及多个阶段的渐进加载和不同检索类型的场景。

:::tip
对于堆叠的视区，可以使用流式方法解码较大的图像，其中 HTJ2K RPCL 图像作为流接收，并在可用时解码其部分内容。这可以显著改善堆叠图像的查看体验，而不需要除支持 HTJ2K RPCL 传输语法以外的任何特殊服务器要求。
:::

# 基准测试

通常情况下，对于损失/第一个版本的图像，大约 1/16 到 1/10 的图像被检索。这显著提高了第一张图像的加载速度。这较大程度上受制于图像的总体大小、网络性能和压缩比。

**全尺寸测试图像为 3036 x 3036，大小为 11.1 MB。**

| 类型                        | 网络  | 大小   | 首次渲染时间 | 最终渲染时间（基线）   |
| --------------------------- | ----- | ------ | ------------ | ----------------------- |
| HTJ2K 流式（1 阶段）         | 4g    | 11.1 M | 66 ms        | 5053 ms                 |
| HTJ2K 字节范围（2 阶段）     | 4g    | 128 K  | 45 ms        | 4610 ms                 |

上述测试的配置如下：

## HTJ2K 流式（1 阶段）

此配置将使用单阶段流式响应来检索图像。
它可以安全地用于流式和非流式传输语法，但仅在使用 HTJ2K 传输语法时激活解码部分。
对于 HTJ2K 解码，如果图像不是 RPCL 格式，那么可能会出现其他解码进程，例如按区域（例如左上、右上、左下、右下）解码，或者解码可能会在数据全部可用之前失败。

:::tip
您可以使用 `urlParameters: accept=image/jhc` 以标准兼容的方式请求 HTJ2K。
:::

```js
const retrieveConfiguration = {
  // stages 默认值为 singleRetrieveConfiguration 
  retrieveOptions: {
    single: {
      streaming: true,
    },
  },
};
```

## HTJ2K 字节范围（2 阶段）

此顺序检索配置指定了两个阶段，每个阶段都适用于整个图像 ID 堆栈。第一阶段将使用 `singleFast` 检索类型加载每个图像，随后第二阶段将使用 `singleFinal` 进行检索。

注意，此检索配置需要服务器端支持字节范围请求。对于不支持字节范围请求的服务器来说，这可能是安全的，但在尝试时请求也可能失败。请阅读您的 DICOM 合规声明。

:::tip
您可以添加第三个错误恢复阶段，去掉所有字节范围请求。这个阶段只有在前几个阶段失败时才会运行。这允许处理未知的服务器支持。
:::

```js
const retrieveConfiguration = {
  // 这个 stages 列表可作为 sequentialRetrieveStages 使用
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