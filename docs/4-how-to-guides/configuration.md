---
id: configuration
title: 配置
description: Cornerstone Core 通过 init 函数接受配置。本文重点讲日志：Cornerstone 与 dcmjs 共用 loglevel 的同一个日志根，因此用 loglevel 接口而非 init 配置来控制；文中说明日志级别、logger 命名结构、如何按前缀批量设级别，以及如何把日志转发到别处。
keywords:
  - Cornerstone3D 配置
  - init
  - 日志
  - loglevel
  - logging.log
  - methodFactory
  - 日志级别
upstream: https://www.cornerstonejs.org/docs/how-to-guides/configuration
---

# 配置 {#configuration}

Cornerstone Core 通过它的 `init` 函数接受配置。请在**第一次**调用 `init`
时把配置传进去；此后再调用 `init`，会在 Cornerstone 已初始化的情况下立即返回。

## 日志 {#logging}

Cornerstone 用 [loglevel](https://github.com/pimterry/loglevel) 打印它的消息，
并且与 dcmjs 共用同一个日志根。请用 loglevel 的接口来配置日志，
而不要用 `init` 配置。这样一套接口就同时控制了 Cornerstone、dcmjs
以及你应用中其他组件的日志。

```ts
import { logging } from '@cornerstonejs/utils';

logging.log.getLogger('cs3d.dicomImageLoader.wadouri').setLevel('info');
```

各级别按「消息最多」到「消息最少」排列如下：

- `trace`
- `debug`
- `info`
- `warn`
- `error`
- `silent`

### logger 的命名 {#logger-names}

一个 logger 名称的结构是：

```
cs3d.<PACKAGE>.<PATH>.<FILEORAREA>
```

- `cs3d` 是所有 Cornerstone 日志的根。
- `<PACKAGE>` 是包名，例如 `core`、`tools`、`dicomImageLoader`、
  `niftiVolumeLoader`、`polymorphicSegmentation`、`labelmapInterpolation`、
  `adapters`、`metadata` 或 `ai`。
- `<PATH>` 是该包源码中的目录。它可以有多段；位于包根目录的文件则没有这一段。
- `<FILEORAREA>` 是文件名；当消息来自多个文件时，则是那块代码区域的名字。

名称示例：

- `cs3d.core.RenderingEngine.StackViewport`
- `cs3d.core.utilities.VoxelManager`
- `cs3d.dicomImageLoader.wadouri`
- `cs3d.adapters.Cornerstone3D.MeasurementReport`

有两个 logger 不在 `cs3d` 之下：`consistency.dicom` 和 `consistency.image`。
它们位于 dcmjs 的根上，因为 dcmjs 也打印同样的一致性检查消息。

### 设置级别 {#set-a-level}

logger 名称是彼此独立的字符串；名称中的点**不会**建立父子关系。
因此给某个具名 logger 设置级别，只会影响那一个精确匹配的 logger。
要查看存在哪些 logger，用 `logging.log.getLoggers()`。

```ts
import { logging } from '@cornerstonejs/utils';

// 一个精确的 logger
logging.log.getLogger('cs3d.core.RenderingEngine').setLevel('debug');

// 所有已存在、且名称以某个区域前缀开头的 logger
const prefix = 'cs3d.core.RenderingEngine';
Object.entries(logging.log.getLoggers()).forEach(([name, logger]) => {
  if (name === prefix || name.startsWith(`${prefix}.`)) {
    logger.setLevel('debug');
  }
});

// 更新根级别，然后更新那些没有自己级别的已存在 logger
logging.log.setLevel('warn');
logging.log.rebuild();
```

你可以在任意时刻设置级别，新级别立即生效。在根级别变更**之后**创建的
具名 logger 会继承新的根级别；而**已经存在**的具名 logger 会保持它们
原先继承来的级别，直到你调用 `logging.log.rebuild()`。
因此你也可以把这项控制权交给你的用户，例如放在一个用于技术支持的菜单里。

### 把日志发到别的地方 {#send-the-logs-to-a-different-location}

loglevel 允许你替换那个「生成各个日志方法」的函数。可以借此把消息发到服务器、
写进文件，或者送到你应用的界面上。替换该函数之后要再调用一次 `setLevel`，
因为新的方法正是在那一刻生成的。

```ts
import { logging } from '@cornerstonejs/utils';

const logger = logging.log.getLogger('cs3d.core.RenderingEngine');
const originalFactory = logger.methodFactory;

logger.methodFactory = (methodName, level, loggerName) => {
  const originalMethod = originalFactory(methodName, level, loggerName);

  return (...args) => {
    originalMethod(...args);

    if (methodName === 'warn' || methodName === 'error') {
      myTelemetry.send({ logger: String(loggerName), methodName, args });
    }
  };
};

logger.setLevel(logger.getLevel());
```
