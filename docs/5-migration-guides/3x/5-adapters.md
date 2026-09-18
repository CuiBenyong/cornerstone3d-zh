---
id: adapters
title: 适配器 API
description: Cornerstone3D 3.x 中新版适配器 API 的使用指南。MeasurementReport 改用两个 Map 而非对象来登记适配器类，新增了注册自定义追踪标识的方法，适配器实现有了基类，并且不再需要向 generateToolState 传入影像与世界坐标的换算函数。
keywords:
  - 适配器 API
  - MeasurementReport
  - measurementAdapterByToolType
  - registerTrackingIdentifier
  - initCopy
  - generateToolState
  - Cornerstone3D 3.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/3x/adapters
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 主要变更 {#key-changes}

- MeasurementsReport 改用两个 Map（而不是对象）来登记适配器类：
  一个把工具类型映射到适配器类，另一个把追踪 id 映射到适配器类。
- 新增了一个「注册额外追踪 id」的方法，允许添加自定义的适配器方法。
- 适配器实现现在有了一个基类来承担部分定义工作。
  这样就可以调用基类来处理诸如「是否为追踪项」这类判断。
- MeasurementsReport 类现在可以被继承，从而创建一个默认处理逻辑
  完全不同的新类。要做到这一点，需要重新声明那两个 Map 属性，
  并为各处理器注册新的实例。
- 现在有了一个 init 方法，用于创建追踪标识并注册新的处理器。
- 标注变更事件不再需要 viewport id / rendering id
  - 这样改动是为了让标注在不可见时也能被更新
- measurement report 不再接收影像与世界坐标之间的换算函数，
  因为它已经由 `@cornerstonejs/core/utilities` 导出的方法提供
- 适配器现在可以注水（hydrate）世界坐标，例如用于 MPR 重建

## 迁移步骤 {#migration-steps}

### 1. 替换 MeasurementsReports.CORNERSTONE_TOOL_CLASSES_BY_UTILITY_TYPE {#1-replace-measurementsreportscornerstone_tool_classes_by_utility_type}

**迁移前：**

```diff
- const toolClass = MeasurementReports.CORNERSTONE_TOOL_CLASSES_BY_UTILITY_TYPE[toolType];
```

**迁移后：**

```diff
+ const toolClass = MeasurementReports.measurementAdapterByToolType.get(toolType);
```

### 2. 替换那些与既有注册完全相同的工具实例适配器注册 {#2-replace-tool-instance-adapter-registration-which-is-identical-to-existing-registration}

**迁移前：**

```diff
- class MyNewToolAdapter { ... 与例如 Probe 适配器完全相同 }
```

**迁移后：**

```diff
+ const MyNewToolAdapter = Probe.initCopy('MyNewTool');
```

### 3. 用 registerTrackingIdentifier 替换旧的工具注册方式 {#3-replace-old-tool-registration-with-registertrackingidentifier}

**迁移前：**

```diff
- class OldToolAdapter { ... 与例如 Length v1.0 完全相同，只是追踪标识末尾带 :v1.0 }
```

**迁移后：**

```diff
+ MeasurementReport.registerTrackingIdentifier(Length, `${Length.trackingIdentifierTextValue}:v1.0`);
```

### 4. 在使用 MeasurementReport 时去掉影像与世界坐标的换算 {#4-remove-image-tofrom-world-coords-in-use-of-measurementreport}

**迁移前：**

```
  // 用 cs3d 适配器生成 toolState。
  let storedMeasurementByAnnotationType = MeasurementReport.generateToolState(
    datasetToUse,
    // 注意：我们需要把 imageIds 传给 dcmjs，因为要用它们做
    // imageToWorld 变换。下面这段假定：测量被添加到该显示集的顺序
    // 与实例中 measurementGroups 的顺序相同。
    sopInstanceUIDToImageId,
    metaData,
    csUtilities.imageToWorldCoords
  );
```

**迁移后：**

```
  // 用 cs3d 适配器生成 toolState。
  let storedMeasurementByAnnotationType = MeasurementReport.generateToolState(
    datasetToUse,
    // 注意：我们需要把 imageIds 传给 dcmjs，因为要用它们做
    // imageToWorld 变换。下面这段假定：测量被添加到该显示集的顺序
    // 与实例中 measurementGroups 的顺序相同。
    sopInstanceUIDToImageId,
    metaData
  );
```

:::note 与原文的一处差异

官方英文原文中，上面第 1–3 步「迁移后」的 diff 代码块误用了 `-`（删除）标记，
与「迁移前」完全一样，看起来像是要把新写法也删掉。
这里已改为 `+`（新增），以符合其本意。

:::
