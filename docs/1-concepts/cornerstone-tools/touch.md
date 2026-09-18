---
id: touchEvents
title: 触摸事件
description: 触摸事件支持多点触控手势，包含 TOUCH_START、TOUCH_PRESS、TOUCH_DRAG、TOUCH_TAP、TOUCH_SWIPE 等事件。本文说明事件触发顺序与各自的判定阈值、多点触控如何归约为单点、拖拽事件的 delta 计算、按触点数量绑定工具的方式，以及触摸事件与鼠标事件的对应关系。
keywords:
  - 触摸事件
  - TOUCH_DRAG
  - TOUCH_SWIPE
  - TOUCH_TAP
  - 多点触控
  - numTouchPoints
  - ITouchPoints
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/touchEvents
---

# 触摸事件 {#touch-events}

当用户用一个或多个触点（例如手指或触控笔）触摸设备时，就会触发触摸事件。
触点的事件流如下：

1. `TOUCH_START`
2. `TOUCH_START_ACTIVATE`
3. 可选：`TOUCH_PRESS`
4. 可选：`TOUCH_DRAG`
5. `TOUCH_END`

用户每一次按下手指再抬起，触摸事件的顺序都会遵循上面这个流程。
触摸事件与点击事件并不互斥。

另外还有两个可以独立发生的触摸事件：`TOUCH_TAP` 和 `TOUCH_SWIPE`。
一次 `TOUCH_TAP` 会触发 `TOUCH_START` → `TOUCH_END` 的事件流。
如果用户连续点按，只会触发一次 `TOUCH_TAP` 事件，并带上用户点按了多少次的计数。

`TOUCH_SWIPE` 事件在用户于单次拖拽周期内、在画布上移动超过 `48px` 时发生。
此外，`TOUCH_SWIPE` 只有在触屏后最初 `200ms` 内发生该移动时才会被激活。
如果用户沿对角线移动，则 `LEFT`/`RIGHT` 和 `UP`/`DOWN` 两个方向的滑动都会触发。

| 事件                   | 说明                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `TOUCH_START`          | 用户按下触点时触发。                                                                                      |
| `TOUCH_START_ACTIVATE` | 仅当没有任何工具决定阻止 `TOUCH_START` 事件传播时才触发。它有助于区分「触摸了已有标注」与「需要创建新标注」。 |
| `TOUCH_PRESS`          | 用户按下触点并保持不动超过 700ms 时触发。                                                                  |
| `TOUCH_DRAG`           | 用户移动触点时随时触发；由于 `TOUCH_PRESS` 事件容许一定的移动量，它可能在 `TOUCH_PRESS` 之前发生。          |
| `TOUCH_END`            | 用户抬起一个或多个触点时触发。                                                                            |
| `TOUCH_TAP`            | 用户与屏幕接触时间少于 `300ms`、且相对 `TOUCH_START` 的移动少于画布 `48px` 时触发。                        |
| `TOUCH_SWIPE`          | 用户在单次拖拽周期内移动超过 `48px`、且发生在触屏后 `200ms` 之内时触发。                                    |

## 多点触控 {#multitouch}

触摸事件原生支持多点触控，它以
[`ITouchPoints[]`](https://www.cornerstonejs.org/docs/api/tools/namespaces/Types/interfaces/ITouchPoints)
列表的形式提供。为了让触摸事件能与鼠标事件兼容，
这些 `ITouchPoints[]` 需要被归约为单个 `ITouchPoint`。
当前的数组归约策略是取各坐标值的平均值。也可以实现其他策略，
例如取第一个点、取中位点等，实现位置在
[`touch` 工具函数代码](https://github.com/cornerstonejs/cornerstone3D/main/packages/tools/src/utilities/touch/index.ts)中。

`ITouchPoints` 的结构如下：

```js
type ITouchPoints = {
  /** 该点的 page 坐标 */
  page: Types.Point2,
  /** 该点的 client 坐标 */
  client: Types.Point2,
  /** 该点的画布坐标 */
  canvas: Types.Point2,
  /** 该点的世界坐标 */
  world: Types.Point3,

  /** 原生 Touch 对象中可被 JSON 序列化的那些属性 */
  touch: {
    identifier: string,
    radiusX: number,
    radiusY: number,
    force: number,
    rotationAngle: number,
  },
};
```

## 多点触控的拖拽计算 {#multitouch-drag-calculations}

`TOUCH_DRAG` 事件的结构如下：

```js
type TouchDragEventDetail = NormalizedTouchEventDetail & {
  /** 该触摸事件的起始点。 */
  startPoints: ITouchPoints,
  /** 触摸的上一组点。 */
  lastPoints: ITouchPoints,
  /** 当前的触摸位置。 */
  currentPoints: ITouchPoints,
  startPointsList: ITouchPoints[],
  /** 触摸的上一组点。 */
  lastPointsList: ITouchPoints[],
  /** 当前的触摸位置。 */
  currentPointsList: ITouchPoints[],

  /** 当前点与上一组点之间的差值。 */
  deltaPoints: IPoints,
  /** 当前点与上一组点各自点间距之间的差值。 */
  deltaDistance: IDistance,
};
```

`deltaPoints` 是 `lastPointsList` 与 `currentPointsList` 各自平均坐标点之间的差值。
`deltaDistance` 是 `lastPointsList` 与 `currentPointsList` 中点间平均距离之间的差值。

## 用法 {#usage}

可以给元素添加对应事件的监听器。

```js
import Events from '@cornerstonejs/tools/enums/Events';
// element 是 cornerstone 的视口元素
element.addEventListener(Events.TOUCH_DRAG, (evt) => {
  // 拖拽时执行我的函数
  console.log(evt);
});

element.addEventListener(Events.TOUCH_SWIPE, (evt) => {
  // 滑动时执行我的函数
  console.log(evt);
});

// 在已部署的 OHIF 应用中，于 chrome 控制台里
cornerstone
  .getEnabledElements()[0]
  .viewport.element.addEventListener(Events.TOUCH_SWIPE, (evt) => {
    // 滑动时执行我的函数
    console.log('SWIPE', evt);
  });
```

完整示例可以通过运行 `yarn run example stackManipulationToolsTouch` 查看，
其源码在[这里](https://github.com/gradienthealth/cornerstone3D/blob/gradienthealth/added_touch_events/packages/tools/examples/stackManipulationToolsTouch/index.ts)。

## 绑定 {#binding}

触摸类工具的绑定取决于按下的触点数量。将来绑定还可以按压力大小
以及触点半径（用于识别触控笔）来筛选。`numTouchPoints`
可以多到硬件所支持的上限。

```js
// 把工具添加到 Cornerstone3D
cornerstoneTools.addTool(PanTool);
cornerstoneTools.addTool(WindowLevelTool);
cornerstoneTools.addTool(StackScrollTool);
cornerstoneTools.addTool(ZoomTool);

// 定义一个工具组，它决定了对使用该组的任何视口而言，
// 鼠标事件如何映射到工具命令
const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

// 把工具加入工具组
toolGroup.addTool(WindowLevelTool.toolName);
toolGroup.addTool(PanTool.toolName);
toolGroup.addTool(ZoomTool.toolName);
toolGroup.addTool(StackScrollTool.toolName);

// 设置这些工具的初始状态。这里所有工具都是激活的，
// 并分别绑定到不同的触摸输入上。
// 这里写了 5 个触点 => 触点数量本身不受限制，但通常受硬件限制。
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

`MouseBindings.Primary` 是一种特殊的绑定类型，它会自动绑定单指触摸。

## 触摸事件与鼠标事件的对应关系 {#touch-and-mouse-event-analogs}

触摸事件与鼠标事件在继承关系上有大量重叠。大多数触摸事件都有对应的鼠标事件，
见下表：

| 触摸事件               | 鼠标事件              |
| ---------------------- | --------------------- |
| `TOUCH_START`          | `MOUSE_DOWN`          |
| `TOUCH_START_ACTIVATE` | `MOUSE_DOWN_ACTIVATE` |
| `TOUCH_PRESS`          | 无                    |
| `TOUCH_DRAG`           | `MOUSE_DRAG`          |
| `TOUCH_SWIPE`          | 无                    |
| `TOUCH_END`            | `MOUSE_UP`            |
| `TOUCH_TAP`            | `MOUSE_CLICK`         |

触摸事件与鼠标事件的主要区别在于：触摸事件可以有多个触点（多点触控）。
触摸事件会自动把多个触点归约为单个点值，默认的归约方式是取加权平均。
归约出来的这个点，可以按是否需要触摸相关信息，作为 `IPoints`
或 `ITouchPoints` 使用。

如果确实需要多个触点，它们也能以列表形式取用。

```js
type MousePointsDetail = {
  /** 该鼠标事件的起始点。 */
  startPoints: IPoints,
  /** 鼠标的上一组点。 */
  lastPoints: IPoints,
  /** 当前的鼠标位置。 */
  currentPoints: IPoints,
  /** 当前点与上一组点之间的差值。 */
  deltaPoints: IPoints,
};

type TouchPointsDetail = {
  /** 该触摸事件的起始点。 */
  startPoints: ITouchPoints,
  /** 触摸的上一组点。 */
  lastPoints: ITouchPoints,
  /** 当前的触摸位置。 */
  currentPoints: ITouchPoints,

  startPointsList: ITouchPoints[],
  /** 触摸的上一组点。 */
  lastPointsList: ITouchPoints[],
  /** 当前的触摸位置。 */
  currentPointsList: ITouchPoints[],

  /** 当前点与上一组点之间的差值。 */
  deltaPoints: IPoints,
  /** 当前点与上一组点各自点间距之间的差值。 */
  deltaDistance: IDistance,
};
```
