---
id: saving
title: 保存与替换
description: 分割、结构集（RTSTRUCT）和测量报告（SR）作为派生 DICOM 对象存储时，既可以另起一个新序列，也可以成为既有序列的下一个修订版。本文说明 predecessorImageId 选项带来的差异、PredecessorSequence 提供的三项信息、阅片器凭什么显示修订版，以及前驱不可用时的行为。
keywords:
  - 分割保存
  - predecessorImageId
  - PredecessorDocumentsSequence
  - generateSegmentation
  - RTSTRUCT
  - SR
  - InstanceNumber
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/segmentation/saving
---

# 保存与替换 {#saving-and-replacing}

分割是以派生 DICOM 对象的形式存储的：一个基于它所绘制的那些影像构建出来的
SEG 实例。结构集（RTSTRUCT）和测量报告（SR）同样是派生对象，
本页的内容对这三者都适用。

存储它有两种方式，区别只在一个选项上。

## 另起一个新序列 {#a-new-series}

在没有前驱（predecessor）的情况下，适配器会基于一个 dcmjs derivation 构建该对象，
而这个 derivation 会凭空造出它所属的序列：一个全新的 `SeriesInstanceUID`、
描述 `Research Derived series`、编号 `99`，以及当前的 UTC 日期和时间。
存储出来的对象就是它自己那个序列的第一个实例。

对用户刚刚创建出来的分割，这正是你想要的行为。

## 作为既有序列的一个修订版 {#a-revision-of-an-existing-series}

传入 `predecessorImageId`——也就是被这个新对象所取代的那个实例的 image id——
该对象就会加入那个实例所在的序列：

```js
const { dataset } = generateSegmentation(
  referencedImages,
  labelmaps3D,
  metaData,
  { predecessorImageId }
);
```

`generateRTSSFromRepresentation` 和 `MeasurementReport.generateReport`
也接受同一个选项。这三者都通过 `PredecessorSequence` 元数据模块读取它，
该模块提供三样东西：

| 提供什么                       | 取自何处                                     | 效果                                                   |
| ------------------------------ | -------------------------------------------- | ------------------------------------------------------ |
| 序列属性                       | 前驱的 General Series 模块                   | 修订版落在同一序列中，编号和描述都相同                 |
| `InstanceNumber`               | 前驱的该值加一                               | 修订版排在它所取代的那个实例之后                       |
| `PredecessorDocumentsSequence` | 前驱的 study、series 和 SOP UID              | 修订版明确指出它取代了什么                             |

只有前驱确实带有的那些属性会被复制，因此前驱身上的某项缺失
绝不会清掉 derivation 已经设好的值。

## 阅片器会显示哪个实例 {#which-instance-a-viewer-shows}

存储出来的对象里，没有任何东西把某个实例标记为该序列「那个」分割。
修订版所携带的信息已经足够让阅片器自己判断：

- 它与前驱处于**同一序列**中，因此「每个序列列一条」的阅片器
  对整条修订链只显示一个条目；
- 它有**更大的 `InstanceNumber`**；
- 它在 **`PredecessorDocumentsSequence`** 中指明了自己的前驱，
  因此无论这些实例的编号如何，一条修订链的先后顺序都是可以还原出来的。

于是，一个显示该序列中最新创建实例的阅片器就会显示修订版，
而原始版本仍然可以在它背后被检索到。存储该对象的应用有责任在每次保存时
打上**实例级**的创建日期和时间；而**序列级**的 `SeriesDate` 和 `SeriesTime`
属于那个已经存在的序列，不得重新打戳。

## 记录前驱 {#recording-the-predecessor}

`Segmentation.predecessorImageId` 保存的是该分割是从哪个实例加载来的、
或者上一次是作为哪个实例存储的；`Annotation.predecessorImageId`
对标注起同样的作用。在用户保存时读取它，
第二次保存就会写出第二个修订版，而不是第二个序列。

## 前驱不可用时 {#when-the-predecessor-cannot-be-used}

如果没有任何元数据提供者持有该 image id——比如这是个过期的 id、
或者那个实例从未被摄入过——该模块会返回 `undefined`。
所有调用方都会把这个结果当作空操作合并进去，所以保存本身仍然成功，
只是该对象会另起一个新序列、并且不指明任何前驱。
该模块会打出一条带上这个 image id 的警告，而这条警告是调用方能得到的唯一提示。

如果某个提供者持有该 image id，但它不带 `StudyInstanceUID` 或
`SeriesInstanceUID`，该模块会抛出异常。这两个属性在
`PredecessorDocumentsSequence` 中都是 Type 1（必需）。
缺了它们模块就无法写出该序列，而一个指向空前驱的存储对象，
对用户来说比「保存失败并说明原因」更糟。
