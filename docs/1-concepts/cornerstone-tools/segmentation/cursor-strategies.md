---
id: cursor-strategies
title: 自定义光标形状与填充策略
description: 通过 BrushStrategy 的回调把自定义笔刷光标与填充谓词配对起来，让光标形状与实际写入标签图的体素完全一致。本文讲解从 hover 到填充的完整生命周期、计算世界坐标几何、渲染 SVG 光标、构建配套填充策略、接入 BrushTool，以及保持两者一致的实践要点。
keywords:
  - 自定义光标
  - BrushStrategy
  - CalculateCursorGeometry
  - RenderCursor
  - isInObject
  - strokePointsWorld
  - 填充策略
  - BrushTool
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/segmentation/cursor-strategies
---

# 自定义光标形状与填充策略 {#custom-cursor-geometry--fill-strategies}

分割工具暴露了一批 `BrushStrategy` 钩子，让你可以绘制任意形状的光标轮廓，
并在绘制时复用完全相同的那份几何数据。光标不只是一个视觉提示——
`BrushTool` 会把悬停期间计算出的几何数据拷贝进驱动填充策略的 `operationData`。
本节说明如何定制这两半，使一个新的光标轮廓（例如方形、菱形或斜切多边形）
填充出的像素恰好就是用户预期的那些。

## 生命周期概览 {#lifecycle-overview}

1. 指针移动时，`BrushTool` 构建 `hoverData`
   （见 `LabelmapBaseTool.createHoverData`）。
2. 当前激活的 `BrushStrategy` 被要求运行
   `StrategyCallbacks.CalculateCursorGeometry`。这个回调可以把描述该光标的
   世界坐标点填进 `hoverData.brushCursor.data.handles`。
3. 紧接着，`StrategyCallbacks.RenderCursor` 会收到同一份 `operationData`
   以及一个 `SVGDrawingHelper`。用这个回调在画布空间中渲染光标。
4. 用户开始绘制时，`LabelmapBaseTool.getOperationData` 把
   `brushCursor.data.handles.points` 拷贝进 `operationData.points`，
   并把原始的 `hoverData` 转交给当前激活的策略。
5. 该策略对 `StrategyCallbacks.Initialize` 的实现会把这些点映射到索引空间、
   计算出 `operationData.isInObject`，并可选地更新
   `operationData.strokePointsWorld`，使得即便在拖拽过程中，
   填充与光标也始终保持对齐。

让光标计算与填充谓词保持同步，才能保证写入标签图的那片扫掠体积
与屏幕上渲染出来的一致。

## 第 1 步：计算世界坐标几何 {#step-1-calculate-world-space-geometry}

实现一个处理 `StrategyCallbacks.CalculateCursorGeometry` 的 composition。
该回调会收到启用的元素、工具配置，以及最新的 `hoverData`：

```ts
import { Enums } from '@cornerstonejs/tools';
import type { Types } from '@cornerstonejs/core';

const { StrategyCallbacks } = Enums;

export const hexCursorComposition = {
  [StrategyCallbacks.CalculateCursorGeometry]: (enabledElement, operationData) => {
    const { viewport } = enabledElement;
    const { configuration, hoverData } = operationData;
    const { brushCursor, centerCanvas } = hoverData;
    const camera = viewport.getCamera();
    const brushRadius = configuration.brushSize;

    const centerWorld = viewport.canvasToWorld(centerCanvas) as Types.Point3;
    const polygonWorld = createHexagonCorners(
      centerWorld,
      camera.viewUp,
      camera.viewPlaneNormal,
      brushRadius
    );

    // BrushTool 会自动把 handles.points 拷贝进 operationData.points。
    brushCursor.data.handles = {
      points: buildOrthogonalHandles(polygonWorld),
      polygonWorld,
    };
    brushCursor.data.invalidated = false;
  },
};
```

几点指引：

- 在从 `viewUp` / `viewPlaneNormal` 推导 `viewRight` 之前先把它们归一化，
  这样斜切平面下的行为才一致。
- `handles.points` 一定要按 `[bottom, top, left, right]` 的顺序填写。
  既有策略（例如 `fillCircle.ts`）在计算中心点和半径时依赖这个顺序。
- 你需要的任何额外数据（例如 `polygonWorld` 或预先算好的法向量）
  都挂在 `brushCursor.data.handles` 上。在你的填充策略内部，
  可以通过 `operationData.hoverData` 取到它们。

## 第 2 步：渲染自定义光标 {#step-2-render-the-custom-cursor}

渲染回调负责依据前一步算出的世界坐标几何，绘制画布空间中的叠加层。
请使用 `packages/tools/src/drawingSvg` 中的共享 SVG 辅助函数，
以保持输出与其余工具体系一致：

```ts
import { Enums, drawing } from '@cornerstonejs/tools';

const { StrategyCallbacks } = Enums;
const { drawPolyline: drawPolylineSvg } = drawing;

hexCursorComposition[StrategyCallbacks.RenderCursor] = (
  enabledElement,
  operationData,
  svgDrawingHelper
) => {
  const { viewport } = enabledElement;
  const { brushCursor } = operationData.hoverData;
  const polygonWorld = brushCursor.data.handles?.polygonWorld ?? [];

  if (polygonWorld.length === 0) {
    return;
  }

  const polygonCanvas = polygonWorld.map((point) =>
    viewport.worldToCanvas(point)
  );

  const annotationUID = brushCursor.metadata?.brushCursorUID;
  drawPolylineSvg(svgDrawingHelper, annotationUID, 'hexagon', polygonCanvas, {
    color: `rgb(${brushCursor.metadata.segmentColor?.slice(0, 3) ?? [0, 255, 0]})`,
    lineDash:
      operationData.centerSegmentIndexInfo.segmentIndex === 0 ? [1, 2] : undefined,
    closed: true,
  });
};
```

渲染这一步要保持轻量——`BrushTool` 在每次鼠标移动时都会触发它。
不要在这里重新计算世界坐标数据，所有东西都应在
`CalculateCursorGeometry` 阶段缓存好。

## 第 3 步：构建配套的填充策略 {#step-3-build-a-matching-fill-strategy}

填充策略是一个 `BrushStrategy` 实例，它把若干可复用的 composition 接在一起。
该类位于 `packages/tools/src/tools/segmentation/strategies/BrushStrategy.ts`
（若使用 npm 包，则是
`@cornerstonejs/tools/dist/tools/segmentation/strategies/BrushStrategy`）。
`StrategyCallbacks.Initialize` 这一部分，正是你把光标几何转换为
`compositions.regionFill` 所用谓词的地方：

```ts
import BrushStrategy from '@cornerstonejs/tools/dist/tools/segmentation/strategies/BrushStrategy';
import { Enums, utilities } from '@cornerstonejs/tools';
import { utilities as csUtils } from '@cornerstonejs/core';

const { StrategyCallbacks } = Enums;
const { getBoundingBoxAroundShapeIJK } = utilities.boundingBox;
const { transformWorldToIndex } = csUtils;
const {
  regionFill,
  setValue,
  determineSegmentIndex,
  preview,
  labelmapStatistics,
} = BrushStrategy.COMPOSITIONS;

const initializeHexagon = {
  [StrategyCallbacks.Initialize]: (operationData) => {
    const { segmentationImageData, hoverData } = operationData;
    const worldPolygon = hoverData?.brushCursor?.data?.handles?.polygonWorld;

    if (!Array.isArray(worldPolygon) || worldPolygon.length === 0) {
      return;
    }

    const polygonIJK = worldPolygon.map((worldPoint) =>
      transformWorldToIndex(segmentationImageData, worldPoint)
    );

    operationData.isInObject = createPointInPolygon(worldPolygon, segmentationImageData);
    operationData.isInObjectBoundsIJK = getBoundingBoxAroundShapeIJK(
      polygonIJK,
      segmentationImageData.getDimensions()
    );

    // 保持拖拽操作时笔画的连续性。
    operationData.strokePointsWorld = [
      ...(operationData.strokePointsWorld ?? []),
      ...worldPolygon,
    ];
  },
};

export const HEXAGON_STRATEGY = new BrushStrategy(
  'Hexagon',
  regionFill,
  setValue,
  initializeHexagon,
  determineSegmentIndex,
  preview,
  labelmapStatistics,
  hexCursorComposition
);

export const fillInsideHexagon = HEXAGON_STRATEGY.strategyFunction;
```

上面的 `createPointInPolygon` 代表你自己实现的那个用于分类体素的谓词。
许多策略会把多边形所在平面及其法向量都缓存下来，好让谓词避免重复的坐标变换。

几个要点：

- `operationData.isInObject` 必须是一个高效的「点是否在形状内」谓词，
  因为它会对每个候选体素运行一次。
- 一定要更新 `operationData.isInObjectBoundsIJK`；
  `regionFill` 会用这个包围盒来提前终止迭代。
- 复用 `operationData.strokePointsWorld` 来描述一次拖拽扫掠出的体积。
  像 `fillCircle.ts` 这样的策略会对笔画做加密，
  以免光标移动速度快于事件频率时留下空洞。
- 组合使用既有的辅助函数，例如 `getBoundingBoxAroundShapeIJK`、
  `pointInSphere`，或自定义的多边形数学，让这些谓词保持确定性。

## 把策略接入 BrushTool {#wiring-the-strategy-into-brushtool}

在你的 `ToolGroup` 内，把这个新策略函数注册到 `BrushTool` 的配置中：

```ts
import { addTool, BrushTool, ToolGroupManager, Enums } from '@cornerstonejs/tools';
import { fillInsideHexagon } from './strategies/fillHexagon';

addTool(BrushTool);
const toolGroup = ToolGroupManager.createToolGroup('segmentationGroup');
toolGroup.addTool(BrushTool.toolName);

const brushConfig =
  toolGroup.getToolConfiguration(BrushTool.toolName) ?? {};

toolGroup.setToolConfiguration(
  BrushTool.toolName,
  {
    ...brushConfig,
    strategies: {
      ...(brushConfig.strategies ?? {}),
      FILL_INSIDE_HEXAGON: fillInsideHexagon,
    },
    defaultStrategy: 'FILL_INSIDE_HEXAGON',
    activeStrategy: 'FILL_INSIDE_HEXAGON',
  },
  true
);

toolGroup.setToolActive(BrushTool.toolName, {
  bindings: [{ mouseButton: Enums.MouseBindings.Primary }],
  strategy: 'FILL_INSIDE_HEXAGON',
});
```

如果需要在运行时切换策略，使用 `setToolConfiguration`：

```ts
toolGroup.setToolConfiguration(BrushTool.toolName, {
  activeStrategy: 'FILL_INSIDE_HEXAGON',
});
```

当某个 composition 没有实现光标相关回调时，`BrushStrategy`
会自动回退到默认的圆形光标，所以你可以只给需要它的那些策略
选择性地应用自定义光标。

## 让光标与填充逻辑保持一致：实践要点 {#matching-cursor-and-fill-logic-best-practices}

- **共享世界坐标数据**：把你需要的每个几何基元都写进
  `brushCursor.data.handles`。填充策略可以从 `operationData.hoverData`
  把它们读回来，无需重新计算。
- **保持幂等**：这些回调每帧可能运行多次。不要修改共享实例，
  缓存向量前先用 `vec3.clone` 克隆一份。
- **遵守坐标系**：`CalculateCursorGeometry` 工作在世界坐标下，
  `RenderCursor` 工作在画布坐标下，而 `Initialize` 必须用
  `transformWorldToIndex` 转换到 IJK。
- **注意性能**：谓词要少分支，并对开销大的变换做记忆化。
  `BrushStrategy` 是在紧凑的体素循环内部执行的。
- **为「点在形状内」函数写测试**：参照
  `packages/tools/src/tools/segmentation/strategies/__tests__/fillCircle.spec.ts`
  写 Jest 单元测试，有助于发现回归。
- **处理快速拖拽**：填充 `operationData.strokePointsWorld`
  （并对长线段做加密），使谓词能覆盖光标扫过的每一个点。

按这些步骤来，你就能放心地交付新的光标轮廓以及与之匹配的填充行为，
让使用者看到的形状与实际写入分割的内容完全一致。
