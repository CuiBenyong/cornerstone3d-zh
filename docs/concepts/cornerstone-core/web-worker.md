---
id: webWorker
title: Web Workers
---

WebWorkers 提供了一种在后台线程中运行脚本的方法，允许 Web 应用程序在不干扰用户界面的情况下执行任务。它们对于执行计算密集型任务或需要大量处理时间的任务特别有用。

通常，与worker一起工作需要大量样板代码、postMessage 调用和事件侦听器。 Cornerstone 提供了一个简单的 API 来创建和使用工作线程，为您隐藏了所有复杂性。

## 要求

您需要安装 [`comlink`](https://www.npmjs.com/package/comlink) 作为应用程序的依赖项。仅此而已。`comlink` 是一个库，允许您像使用本地对象一样使用 WebWorkers，而不必担心底层消息传递。虽然它不处理优先级队列、负载平衡或工作线程生命周期，但它提供了一个简单的 API 来与工作线程进行通信，Cornerstone 使用它来创建更强大且用户友好的 API。

## 使用示例

通过一个例子我们会更容易解释WebWorker API。假设您有一组函数你想在后台运行。您需要编写一个通过 comlink 公开这些函数的对象。

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

：：：note
正如您在上面看到的，我们的对象可以包含任意数量的函数并且可以保存本地状态。这些函数的唯一要求是参数应该是可序列化的。这意味着您不能将 DOM 元素、函数或任何其他不可序列化的对象作为参数传递。

我们使用对象作为参数。因此，在上面我们使用“fib({value})”而不是“fib(value)”（“value”只是一个参数名称；您可以为参数使用任何您想要的名称。）
:::
现在关键是要告知Cornerstone这个功能，让它在后台顺利运行。让我们深入了解一下。

## WebWorker 管理器

WebWorkerManager 在 WebWorker API 中起着至关重要的作用。它的主要功能是创建和监督worker。通过分配具有不同优先级和队列类型的任务，您可以依靠管理器根据指定的优先级在后台有效地执行它们。此外，它还处理worker的生命周期，分配工作负载，并提供用户友好的 API 来执行任务。

### `registerWorker`

使用唯一的名称和函数注册一个新的worker类型，以便让经理知道它。

参数是

- `workerName`：worker 类型的名称（应该是唯一的），稍后我们将使用它来调用函数。
- `workerFn`：一个返回新 Worker 实例的函数（稍后会详细介绍）
- `options` 具有以下属性的对象：
  - `maxWorkerInstances(default=1)`：可以创建的该工作线程类型的最大实例数。更多实例意味着有多个调用
    对于同一函数，它们可以被卸载到工作类型的其他实例。
- `overwrite (default=false)`：如果已经注册，是否覆盖现有的工作类型
  - `autoTerminateOnIdle`（默认为 false）可用于在经过一定量的空闲时间（以毫秒为单位）后终止工作线程。这对于不经常使用的worker非常有用，并且您希望在特定时间段后终止它们。在经理身上。该方法的参数是对象
  `{启用：布尔值，idleTimeThreshold：数字（毫秒）}`。

:::tip
请注意，如果worker被终止，并不意味着该worker从管理器中被销毁。事实上，对worker的任何后续调用都将创建worker的新实例，并且一切都会按预期工作。
:::

因此，要注册我们上面创建的worker，我们将执行以下操作：

```js
import { getWebWorkerManager } from '@cornerstonejs/core';

const workerFn = () => {
  return new Worker(
    new URL(
      '../relativePath/file/location/my-awesome-worker.js',
      import.meta.url
    ),
    {
      name: 'ohif', // name used by the browser to name the worker
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

在上面您看到，您需要创建一个返回新 Worker 实例的函数。
为了让工作线程工作，它应该位于主线程可以访问的目录中（它可以是相对的到当前目录）。

:::note
您可以指定两个名称：

1. workerFn中的`name`，浏览器使用该名称在调试器中显示worker名称
2. 注册名称，我们稍后用它来调用函数

:::

### `executeTask`

到目前为止，经理只知道可用的workers，但不知道如何处理他们。

`executeTask` 用于在工作线程上执行任务。它需要以下参数：

- `workerName`：我们之前注册的worker类型的名称
- `methodName`：我们要在worker上执行的方法的名称（函数名称，在上面的示例中为`fib`或`inc`）
- `args` (`default = {}`)：传递给函数的参数。参数应该是可序列化的，这意味着您不能将 DOM 元素、函数或任何其他不可序列化对象作为参数传递（请检查下面如何传递不可序列化函数）
- `options` 具有以下属性的对象：
- `requestType (default = RequestType.COMPUTE)` ：请求的组。这用于确定请求的优先级。默认为“RequestType.COMPUTE”，这是最低优先级。
    其他组按优先级排列为“RequestType.INTERACTION”和“RequestType.THUMBNAIL”、“RequestType.PREFETCH”
  - `priority` (`default = 0`)：指定组内请求的优先级。数字越小，优先级越高。
- `options` (`default= {}`)：池管理器的选项（您很可能不需要更改它）
  - `callbacks` (`default = []`)：传入您想要在工作程序内部调用的任何函数。

现在要在工作线程上执行“fib”函数，我们将执行以下操作：

```js
import { getWebWorkerManager } from '@cornerstonejs/core';

const workerManager = getWebWorkerManager();
workerManager.executeTask('ohif-worker', 'fib', { value: 10 });
```

上面的代码将在名称为“ohif-worker”、参数为“{value: 10}”的工作线程上执行“fib”函数。当然这是一个简化的例如，通常您需要在任务完成或失败时执行某些操作。自从回归以来`executeTask` 是一个 Promise，你可以使用 `then` 和 `catch` 方法来处理结果。

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

或者只是等待结果

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

### `eventListeners`

有时，需要向worker提供回调函数。例如，如果您希望在工作人员取得进展时更新用户界面。如前所述，不可能直接将函数作为参数传递给工作程序。但是，您可以通过利用选项中的“callbacks”属性来解决此问题。这些“回调”可以根据其位置作为参数方便地传递给函数。

代码库中的真实示例：

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
正如您所看到的，我们将一个函数作为回调传递给工作线程。该函数作为 NEXT 参数在 args 之后传递给工作程序。

在worker中我们有

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

### `terminate`

要终止worker，您可以使用“webWorkerManager.terminate(workerName)”。停止给定工作线程的所有实例并清理资源。