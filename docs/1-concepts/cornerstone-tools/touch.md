---
id: touchEvents
title: 触摸事件
---

# 触摸事件

当用户用一个或多个触控点（如手指或触笔）触摸设备时，会触发触摸事件。触摸点的流程如下：

1. `TOUCH_START`
2. `TOUCH_START_ACTIVATE`
3. 可选: `TOUCH_PRESS`
4. 可选: `TOUCH_DRAG`
5. `TOUCH_END`

每次用户放下手指并抬起时，触摸顺序流程将始终遵循上述顺序。触摸事件并不与点击事件互斥。

其他可以单独出现的触摸事件是`TOUCH_TAP`事件和`TOUCH_SWIPE`事件。一个`TOUCH_TAP`将触发一个`TOUCH_START` -> `TOUCH_END`事件流程。
如果用户连续点击，则只会触发一个`TOUCH_TAP`事件，并记录用户点击的次数。
`TOUCH_SWIPE`事件发生在用户在单个拖拽周期内在画布上移动超过`48px`的情况下。此外，只有在触摸屏幕后`200ms`内发生此移动时，`TOUCH_SWIPE`才会激活。
如果用户对角移动，将同时触发`LEFT`/`RIGHT`和`UP`/`DOWN`滑动。

| EVENT                  | 描述                                                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `TOUCH_START`          | 当用户放下接触点时触发。                                                                                                                                                                           |
| `TOUCH_START_ACTIVATE` | 只有在没有工具决定阻止`TOUCH_START`事件的传播时才触发。它用于区分触摸现有注解和需要创建新注解。                                                                    |
| `TOUCH_PRESS`          | 如果用户放下触控点并在>700ms内没有移动，则触发。                                                                                                                                                   |
| `TOUCH_DRAG`           | 任何时候用户移动接触点时触发，可能发生在`TOUCH_PRESS`之前，因为`TOUCH_PRESS`事件将容忍一些移动。                                                                |
| `TOUCH_END`            | 当用户抬起一个或多个接触点时触发。                                                                                                                                                                   |
| `TOUCH_TAP`            | 当用户在`300ms`内与屏幕接触并在`TOUCH_START`后在画布上移动小于`48px`时触发。                                                                                      |
| `TOUCH_SWIPE`          | 当用户在单个拖动周期内移动超过`48px`并在触摸屏幕后小于`200ms`时触发。                                                                                           |

## 多点触摸

触摸事件本身支持多点触摸，以[`ITouchPoints[]`](https://www.cornerstonejs.org/docs/api/tools/namespace/Types#ITouchPoints)提供。
为了使触摸事件与鼠标事件兼容，这些`ITouchPoints[]`需要被简化为一个
`ITouchPoint`。当前的数组简化策略是取平均坐标值。可以实现其他策略，如第一个点、中位数点等。这可以在
[`touch` utilities codebase](https://github.com/cornerstonejs/cornerstone3D/main/packages/tools/src/utilities/touch/index.ts)实现。

`ITouchPoints`的结构如下：

```js
type ITouchPoints = {
  /** 点的页面坐标 */
  page: Types.Point2,
  /** 点的客户端坐标 */
  client: Types.Point2,
  /** 点的画布坐标 */
  canvas: Types.Point2,
  /** 点的世界坐标 */
  world: Types.Point3,

  /** 原生触摸对象属性，这些属性是可JSON序列化的 */
  touch: {
    identifier: string,
    radiusX: number,
    radiusY: number,
    force: number,
    rotationAngle: number,
  },
};
```

## 多点触摸拖拽计算

`TOUCH_DRAG`事件具有以下结构：

```js
type TouchDragEventDetail = NormalizedTouchEventDetail & {
  /** 触摸事件的起始点。 */
  startPoints: ITouchPoints,
  /** 触摸的最后一点。 */
  lastPoints: ITouchPoints,
  /** 当前的触摸位置。 */
  currentPoints: ITouchPoints,
  startPointsList: ITouchPoints[],
  /** 触摸的最后一点。 */
  lastPointsList: ITouchPoints[],
  /** 当前的触摸位置。 */
  currentPointsList: ITouchPoints[],

  /** 当前点和最后一点之间的差异。 */
  deltaPoints: IPoints,
  /** 当前点和最后一点之间的距离差异。 */
  deltaDistance: IDistance,
};
```

`deltaPoints`是`lastPointsList`的平均坐标点与`currentPointsList`之间的差异。
`deltaDistance`是`lastPointsList`与`currentPointsList`中点之间平均距离的差异。

## 用法

您可以为事件向元素添加事件监听器。

```js
import Events from '@cornerstonejs/tools/enums/Events';
// element是cornerstone视域元素
element.addEventListener(Events.TOUCH_DRAG, (evt) => {
  // 我在拖动时的函数
  console.log(evt);
});

element.addEventListener(Events.TOUCH_SWIPE, (evt) => {
  // 我在滑动时的函数
  console.log(evt);
});

// 在部署的OHIF应用程序中通过chrome控制台
cornerstone
  .getEnabledElements()[0]
  .viewport.element.addEventListener(Events.TOUCH_SWIPE, (evt) => {
    // 我在滑动时的函数
    console.log('SWIPE', evt);
  });
```

可以通过运行 `yarn run example stackManipulationToolsTouch` 找到完整示例，其源代码位于[此处](https://github.com/gradienthealth/cornerstone3D/blob/gradienthealth/added_touch_events/packages/tools/examples/stackManipulationToolsTouch/index.ts)。

## 绑定

触摸工具根据放下的指针数量有绑定。
未来，绑定可以基于力度以及半径（笔的检测）进行筛选。
`numTouchPoints`可以是硬件支持的任意数量。

```js
// 向Cornerstone3D添加工具
cornerstoneTools.addTool(PanTool);
cornerstoneTools.addTool(WindowLevelTool);
cornerstoneTools.addTool(StackScrollTool);
cornerstoneTools.addTool(ZoomTool);

// 定义工具组，它定义鼠标事件如何映射到工具命令中，
// 任何使用该组的视口
const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

// 将工具添加到工具组中
toolGroup.addTool(WindowLevelTool.toolName);
toolGroup.addTool(PanTool.toolName);
toolGroup.addTool(ZoomTool.toolName);
toolGroup.addTool(StackScrollTool.toolName);

// 设置工具的初始状态，在此所有工具都是激活并绑定到
// 不同的触摸输入
// 5个触摸点是可能的 => 支持不限数量的触摸点，但通常受硬件限制。
toolGroup.setToolActive(ZoomTool.toolName, {
  bindings: [{ numTouchPoints: 2 }],
});
toolGroup.setToolActive(StackScrollTool.toolName, {
  bindings: [{ numTouchPoints: 3 }],
});
toolGroup.setToolActive(WindowLevelTool.toolName, {
  bindings: [
    {
      mouseButton: MouseBindings.Primary, // 单指触摸的特殊条件
    },
  ],
});
```

`MouseBindings.Primary`是一种特殊的绑定类型，将自动绑定单指触摸。

## 触摸与鼠标事件类比

触摸和鼠标事件有很多重叠的继承关系。大多数触摸事件都有一个鼠标事件类比。见下表：

| 触摸事件              | 鼠标事件               |
| ---------------------- | --------------------- |
| `TOUCH_START`          | `MOUSE_DOWN`          |
| `TOUCH_START_ACTIVATE` | `MOUSE_DOWN_ACTIVATE` |
| `TOUCH_PRESS`          | N/A                   |
| `TOUCH_DRAG`           | `MOUSE_DRAG`          |
| `TOUCH_SWIPE`          | N/A                   |
| `TOUCH_END`            | `MOUSE_UP`            |
| `TOUCH_TAP`            | `MOUSE_CLICK`         |

触摸事件与鼠标事件的主要区别在于触摸事件可以有多个指针（多点触摸）。触摸事件将自动将多个指针简化为一个单点值。默认情况下，这些点的简化方法是取加权平均值。这个简化的点可以用作`IPoints`或`ITouchPoints`，是否需要触摸信息取决于具体情况。

如果需要多个触摸点，可以以列表形式访问。

```js
type MousePointsDetail = {
  /** 鼠标事件的起始点。 */
  startPoints: IPoints,
  /** 鼠标的最后一点。 */
  lastPoints: IPoints,
  /** 当前鼠标位置。 */
  currentPoints: IPoints,
  /** 当前点和最后一点之间的差异。 */
  deltaPoints: IPoints,
};

type TouchPointsDetail = {
  /** 触摸事件的起始点。 */
  startPoints: ITouchPoints,
  /** 触摸的最后一点。 */
  lastPoints: ITouchPoints,
  /** 当前触摸位置。 */
  currentPoints: ITouchPoints,

  startPointsList: ITouchPoints[],
  /** 触摸的最后一点。 */
  lastPointsList: ITouchPoints[],
  /** 当前触摸位置。 */
  currentPointsList: ITouchPoints[],

  /** 当前点和最后一点之间的差异。 */
  deltaPoints: IPoints,
  /** 当前点和最后一点之间的距离差异。 */
  deltaDistance: IDistance,
};