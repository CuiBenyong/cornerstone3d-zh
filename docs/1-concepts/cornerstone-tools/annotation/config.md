---
id: config
title: 配置
---

在本节中，我们将解释更改工具样式的各种方法。这包括各种属性，例如在 `selected`、`highlighted` 或 `locked` 状态下的 `color`；文本框颜色、线条虚线样式和粗细等。

## 样式层次结构

我们将从查看样式的层次结构开始。样式层次结构如下所示。

- 注释级别设置（带 UID）**set/getAnnotationToolStyle**
  - 视口级别工具设置 **set/getViewportToolStyle**
    - 每个工具的这一层：此视口上的长度
    - 全局这一层：此视口中的所有工具
      - 工具组设置（适用于工具组中所有视口中指定的任何工具）**set/getToolGroupToolStyle**
        - 每个工具层：工具组中所有视口上的角度
        - 全局这一层：工具组中所有视口内的所有工具
          - 默认级别：**set/getDefaultToolStyle**
            - 每个工具层（长度）设置
            - 全局（应用程序级别）设置（我们提供默认值）。

在注释渲染循环中，获取某个属性的样式（`color`、`lineDash`、`lineThickness`）时，我们检查样式是否在注释级别设置（最高优先级）。
如果没有，我们检查视口注释绘制时是否设置了任何视口级别设置；但在视口级别中，我们首先检查是否设置了工具级别设置。如果没有，我们检查“全局”（视口中所有工具）级别。
如果找不到，我们将移到下一个工具组级别。如果找不到，我们将移到下一个全局级别，即最后一个检查级别。

![configs](../../../assets/configs.png)

## 默认设置

`Cornerstone3DTools` 为 toolsStyles 类初始化了默认设置，可以在 `packages/tools/src/stateManagement/annotation/config/ToolStyle.ts` 中找到

```js
{
  color: 'rgb(255, 255, 0)',
  colorHighlighted: 'rgb(0, 255, 0)',
  colorSelected: 'rgb(0, 220, 0)',
  colorLocked: 'rgb(255, 255, 0)',
  lineWidth: '1',
  lineDash: '',
  textBoxVisibility: true,
  textBoxFontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
  textBoxFontSize: '14px',
  textBoxColor: 'rgb(255, 255, 0)',
  textBoxColorHighlighted: 'rgb(0, 255, 0)',
  textBoxColorSelected: 'rgb(0, 255, 0)',
  textBoxColorLocked: 'rgb(255, 255, 0)',
  textBoxBackground: '',
  textBoxLinkLineWidth: '1',
  textBoxLinkLineDash: '2,3',
};
```

但是，您可以调整上述每个参数以及我们接下来将讨论的其他样式。

## 设置样式

样式层次结构的每个级别都有一组可设置的样式。样式如下。

### 注释级别设置

```js
import { annotations } from '@cornerstonejs/tools';

// 注释级别
const styles = {
  colorHighlighted: 'rgb(255, 255, 0)',
};

annotation.config.style.setAnnotationToolStyle(annotationUID, style);
```

### 视口级别工具设置

```js
// 视口级别
const styles = {
  LengthTool: {
    colorHighlighted: 'rgb(255, 255, 0)',
  },
  global: {
    lineWidth: '2',
  },
};

annotation.config.style.setViewportToolStyle(viewportId, styles);
```

### 工具组级别工具设置

```js
const styles = {
  LengthTool: {
    colorHighlighted: 'rgb(255, 255, 0)',
  },
  global: {
    lineWidth: '2',
  },
};

annotation.config.style.setToolGroupToolStyles(toolGroupId, styles);
```

### 全局（默认）级别工具设置

```js
const styles = annotation.config.style.getDefaultToolStyle();

const newStyles = {
  ProbeTool: {
    colorHighlighted: 'rgb(255, 255, 0)',
  },
  global: {
    lineDash: '2,3',
  },
};

annotation.config.style.setDefaultToolStyle(deepMerge(styles, newStyles));
```

### 可配置样式

当前我们可以配置以下样式。

```js
color;
colorActive;
colorHighlighted;
colorHighlightedActive;
colorHighlightedPassive;
colorLocked;
colorLockedActive;
colorLockedPassive;
colorPassive;
colorSelected;
colorSelectedActive;
colorSelectedPassive;
lineDash;
lineDashActive;
lineDashHighlighted;
lineDashHighlightedActive;
lineDashHighlightedPassive;
lineDashLocked;
lineDashLockedActive;
lineDashLockedPassive;
lineDashPassive;
lineDashSelected;
lineDashSelectedActive;
lineDashSelectedPassive;
lineWidth;
lineWidthActive;
lineWidthHighlighted;
lineWidthHighlightedActive;
lineWidthHighlightedPassive;
lineWidthLocked;
lineWidthLockedActive;
lineWidthLockedPassive;
lineWidthPassive;
lineWidthSelected;
lineWidthSelectedActive;
lineWidthSelectedPassive;
textBoxBackground;
textBoxBackgroundActive;
textBoxBackgroundHighlighted;
textBoxBackgroundHighlightedActive;
textBoxBackgroundHighlightedPassive;
textBoxBackgroundLocked;
textBoxBackgroundLockedActive;
textBoxBackgroundLockedPassive;
textBoxBackgroundPassive;
textBoxBackgroundSelected;
textBoxBackgroundSelectedActive;
textBoxBackgroundSelectedPassive;
textBoxColor;
textBoxColorActive;
textBoxColorHighlighted;
textBoxColorHighlightedActive;
textBoxColorHighlightedPassive;
textBoxColorLocked;
textBoxColorLockedActive;
textBoxColorLockedPassive;
textBoxColorPassive;
textBoxColorSelected;
textBoxColorSelectedActive;
textBoxColorSelectedPassive;
textBoxFontFamily;
textBoxFontFamilyActive;
textBoxFontFamilyHighlighted;
textBoxFontFamilyHighlightedActive;
textBoxFontFamilyHighlightedPassive;
textBoxFontFamilyLocked;
textBoxFontFamilyLockedActive;
textBoxFontFamilyLockedPassive;
textBoxFontFamilyPassive;
textBoxFontFamilySelected;
textBoxFontFamilySelectedActive;
textBoxFontFamilySelectedPassive;
textBoxFontSize;
textBoxFontSizeActive;
textBoxFontSizeHighlighted;
textBoxFontSizeHighlightedActive;
textBoxFontSizeHighlightedPassive;
textBoxFontSizeLocked;
textBoxFontSizeLockedActive;
textBoxFontSizeLockedPassive;
textBoxFontSizePassive;
textBoxFontSizeSelected;
textBoxFontSizeSelectedActive;
textBoxFontSizeSelectedPassive;
textBoxLinkLineDash;
textBoxLinkLineDashActive;
textBoxLinkLineDashHighlighted;
textBoxLinkLineDashHighlightedActive;
textBoxLinkLineDashHighlightedPassive;
textBoxLinkLineDashLocked;
textBoxLinkLineDashLockedActive;
textBoxLinkLineDashLockedPassive;
textBoxLinkLineDashPassive;
textBoxLinkLineDashSelected;
textBoxLinkLineDashSelectedActive;
textBoxLinkLineDashSelectedPassive;
textBoxLinkLineWidth;
textBoxLinkLineWidthActive;
textBoxLinkLineWidthHighlighted;
textBoxLinkLineWidthHighlightedActive;
textBoxLinkLineWidthHighlightedPassive;
textBoxLinkLineWidthLocked;
textBoxLinkLineWidthLockedActive;
textBoxLinkLineWidthLockedPassive;
textBoxLinkLineWidthPassive;
textBoxLinkLineWidthSelected;
textBoxLinkLineWidthSelectedActive;
textBoxLinkLineWidthSelectedPassive;
```