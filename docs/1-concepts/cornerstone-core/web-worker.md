---
id: webWorker
title: Web Worker
description: Cornerstone3D 基于 comlink 封装的 Web Worker API，把计算密集任务放到后台线程执行。本文说明 WebWorkerManager 的 registerWorker、executeTask、回调传递与 terminate 用法，以及请求分组优先级与空闲自动终止配置。
keywords:
  - Web Worker
  - WebWorkerManager
  - registerWorker
  - executeTask
  - comlink
  - RequestType
  - autoTerminateOnIdle
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/webWorker
---

WebWorker 提供了一种在后台线程运行脚本的方式，让 Web 应用可以执行任务而不干扰用户界面。
它对执行计算密集型任务、或那些需要较长处理时间的任务特别有用。

一般来说，与 worker 打交道需要写大量样板代码、postMessage 调用和事件监听器。
Cornerstone 提供了一套简单的 API 来创建和使用 worker，把这些复杂性都替你隐藏了。

## 前置要求 {#requirements}

你需要把 [`comlink`](https://www.npmjs.com/package/comlink) 安装为应用的依赖，
仅此而已。`comlink` 是一个库，它让你可以像使用本地对象那样使用 WebWorker，
不必操心底层的消息通信。虽然它本身不处理优先级队列、负载均衡和 worker 生命周期，
但它提供了与 worker 通信的简单 API——Cornerstone 正是在此基础上
构建出更健壮、更好用的 API。

## 用法示例 {#usage-example}

用一个例子来解释 WebWorker API 会更容易。假设你有一组函数想放到后台运行，
你需要写一个对象，通过 comlink 把这些函数暴露出去。

```js
// file/location/my-awesome-worker.js

import { expose } from 'comlink';

const obj = {
  counter: 69,
  inc() {
    obj.counter++;
    console.debug('inc', obj.counter);
  },
  fib({ value }) {
    if (value <= 1) {
      return 1;
    }
    return obj.fib({ value: value - 1 }) + obj.fib({ value: value - 2 });
  },
};

expose(obj);
```

:::note
如上所见，我们的对象可以包含任意数量的函数，也可以持有本地状态。
对这些函数唯一的要求是：**参数必须是可序列化的**。
也就是说你不能把 DOM 元素、函数或任何其他不可序列化的对象作为参数传进去。

我们用对象来传参。所以上面写的是 `fib({value})` 而不是 `fib(value)`
（`value` 只是一个参数名，你可以随意命名）。
:::

接下来的关键是把这个函数告知 Cornerstone，好让它能在后台顺畅运行。下面就来看看。

## WebWorker 管理器 {#webworker-manager}

WebWorkerManager 在 WebWorker API 中扮演核心角色，它的主要职责是创建和管理 worker。
通过为任务指定不同的优先级和队列类型，你可以依赖管理器按指定的优先级
在后台有效地执行它们。除此之外，它还负责 worker 的生命周期、分配工作负载，
并提供一套好用的 API 来执行任务。

### `registerWorker` {#registerworker}

用一个唯一的名字和一个函数注册一种新的 worker 类型，让管理器知道它的存在。

参数为：

- `workerName`：该 worker 类型的名字（应当唯一），后面调用函数时要用到它。
- `workerFn`：一个返回新 Worker 实例的函数（下面细说）。
- `options`：一个对象，包含以下属性：
  - `maxWorkerInstances`（默认 `1`）：该 worker 类型最多可创建多少个实例。
    实例更多意味着：如果对同一个函数有多次调用，它们可以被分摊到该 worker 类型的
    其他实例上。
  - `overwrite`（默认 `false`）：当该 worker 类型已注册时，是否覆盖它。
  - `autoTerminateOnIdle`（默认 false）：可用于在经过一定空闲时间（毫秒）后
    终止 worker。这对那些不常使用、希望在一段时间后终止的 worker 很有用。
    该参数的取值形如 `{enabled: boolean, idleTimeThreshold: number(ms)}`。

:::tip
注意，worker 被终止并不意味着它从管理器中被销毁了。实际上，
后续任何对该 worker 的调用都会创建一个新的 worker 实例，一切都会照常工作。
:::

所以，要注册我们上面创建的那个 worker，写法如下：

```js
import { getWebWorkerManager } from '@cornerstonejs/core';

const workerFn = () => {
  return new Worker(
    new URL(
      '../relativePath/file/location/my-awesome-worker.js',
      import.meta.url
    ),
    {
      name: 'ohif', // 浏览器用来命名该 worker 的名字
    }
  );
};

const workerManager = getWebWorkerManager();

const options = {
  // maxWorkerInstances: 1,
  // overwrite: false
};

workerManager.registerWorker('ohif-worker', workerFn, options);
```

如上所示，你需要创建一个返回新 Worker 实例的函数。为了让这个 worker 能正常工作，
它所在的目录必须是主线程可以访问到的（可以是相对于当前目录的路径）。

:::note
这里有两个可以指定的名字：

1. `workerFn` 中的 `name`，浏览器用它在调试器里显示 worker 的名称；
2. 注册时用的名字，我们后面调用函数时用的是这个。

:::

### `executeTask` {#executetask}

到目前为止，管理器只知道有哪些 worker 可用，但还不知道拿它们做什么。

`executeTask` 用于在某个 worker 上执行任务，它接受以下参数：

- `workerName`：我们此前注册的那个 worker 类型的名字。
- `methodName`：想在该 worker 上执行的方法名（即函数名，
  在上面的例子里是 `fib` 或 `inc`）。
- `args`（默认 `{}`）：传给该函数的参数。参数必须可序列化，
  也就是说不能传 DOM 元素、函数或任何其他不可序列化的对象
  （不可序列化的函数怎么传，见下文）。
- `options`：一个对象，包含以下属性：
  - `requestType`（默认 `RequestType.COMPUTE`）：该请求所属的分组，
    用于给请求排优先级。默认是 `RequestType.COMPUTE`，优先级最低。
    其他分组按优先级排列为 `RequestType.INTERACTION`、`RequestType.THUMBNAIL`、
    `RequestType.PREFETCH`。
  - `priority`（默认 `0`）：该请求在所属分组内的优先级。数值越小优先级越高。
  - `options`（默认 `{}`）：传给池管理器的选项（你大概不需要改它）。
  - `callbacks`（默认 `[]`）：传入任何你希望在 worker 内部被调用的函数。

现在，要在 worker 上执行 `fib` 函数，写法如下：

```js
import { getWebWorkerManager } from '@cornerstonejs/core';

const workerManager = getWebWorkerManager();
workerManager.executeTask('ohif-worker', 'fib', { value: 10 });
```

上面这段代码会在名为 `ohif-worker` 的 worker 上、以参数 `{value: 10}`
执行 `fib` 函数。当然这是个简化的例子，实际中你往往需要在任务完成或失败时
做一些处理。由于 `executeTask` 返回的是一个 promise，
你可以用 `then` 和 `catch` 方法来处理结果。

```js
workerManager
  .executeTask('ohif-worker', 'fib', { value: 10 })
  .then((result) => {
    console.log('result', result);
  })
  .catch((error) => {
    console.error('error', error);
  });
```

或者直接 await 结果：

```js
try {
  const result = await workerManager.executeTask('ohif-worker', 'fib', {
    value: 10,
  });
  console.log('result', result);
} catch (error) {
  console.error('error', error);
}
```

### `eventListeners` {#eventlisteners}

有时需要给 worker 传一个回调函数，比如你希望在 worker 有进展时更新用户界面。
如前所述，无法直接把函数作为参数传给 worker。不过可以借助 options 中的
`callbacks` 属性绕过这个限制——这些 `callbacks` 会按其位置顺序，
作为参数方便地传给那个函数。

来自代码库的真实例子：

```js
const results = await workerManager.executeTask(
  'polySeg',
  'convertContourToSurface',
  {
    polylines,
    numPointsArray,
  },
  {
    callbacks: [
      (progress) => {
        console.debug('progress', progress);
      },
    ],
  }
);
```

如上所见，我们把一个函数作为回调传给了 worker。该函数会作为 `args` **之后的
下一个参数**传给 worker。

在 worker 里则是这样：

```js
import { expose } from 'comlink';

const obj = {
  async convertContourToSurface(args, ...callbacks) {
    const { polylines, numPointsArray } = args;
    const [progressCallback] = callbacks;
    await this.initializePolySeg(progressCallback);
    const results = await this.polySeg.instance.convertContourRoiToSurface(
      polylines,
      numPointsArray
    );

    return results;
  },
};

expose(obj);
```

### `terminate` {#terminate}

要终止一个 worker，可以使用 `webWorkerManager.terminate(workerName)`。
它会停止给定 worker 的所有实例并清理资源。
