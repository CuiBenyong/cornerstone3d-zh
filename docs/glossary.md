---
id: glossary
title: 术语对照表
description: Cornerstone3D 中英文术语对照表。涵盖渲染引擎、视口、体数据、影像加载器、标注与分割等模块的术语译法，可按英文 API 名称查找对应中文译名。
keywords:
  - Cornerstone3D 术语
  - Cornerstone3D 中文
  - 医学影像术语
  - DICOM 术语翻译
  - viewport 中文
  - segmentation 中文
sidebar_position: 90
---

# 术语对照表

这份对照表有两个用途：一是让你在读中文文档时能对应回英文 API 名称，
二是作为本站翻译的统一标准——同一个英文术语在全站只用一种中文译法。

术语按模块分组。如果你是在搜索某个英文 API 名称的中文含义，直接用浏览器的
页内查找（Ctrl+F / Cmd+F）搜英文词更快。

## 关于几个容易混淆的译法

在看表格之前，有三处译法值得单独说明，因为它们在中文社区里存在分歧：

**Annotation 译作「标注」而非「注释」。** 「注释」在编程语境里指代码注释（comment），
而 Cornerstone3D 里的 annotation 指在影像上画出的长度、角度、面积等测量标记。
医学影像领域的通行说法是「标注」。本站早期部分页面使用过「注释」，已统一为「标注」。

**Volume 译作「体数据」而非「体积」。** 「体积」是一个标量（物体占据的空间大小），
而 volume 在这里指由多张切片堆叠成的三维数据集。译作「体积」会造成实质性误解。

**Segmentation 译作「分割」。** 指把影像中的解剖结构逐体素标记出来。
不要译作「分段」——「分段」容易和 segment index（分段索引）里的 segment 混淆，
后者指分割结果中的单个标记类别。

## 枚举值与模式名保留英文

工具模式、绑定角色这类直接对应代码里枚举值的名称，全站写成
「英文（中文注解）」的形式，例如 `Active（激活）`、`Passive（被动）`、
`Enabled（启用）`、`Disabled（禁用）`。

这样写有两个原因。一是 Active 和 Enabled 译成中文后（激活、启用）在字面上
几乎区分不出来，但两者语义完全不同——Active 会响应交互，Enabled 只渲染、
不接受交互。二是读者照文档写代码时传入的是英文枚举值，保留英文可以省掉
一次反查。

| 英文 | 中文注解 | 行为 |
| --- | --- | --- |
| Active | 激活 | 响应交互；标注工具在空白处点击会新建标注 |
| Passive | 被动（默认） | 不新建标注，但已有标注的控制点可被拖动 |
| Enabled | 启用 | 渲染，但不接受交互 |
| Disabled | 禁用 | 不渲染，也不接受交互 |

## 核心渲染

| 英文 | 中文 | 说明 |
| --- | --- | --- |
| Rendering Engine | 渲染引擎 | 管理视口与渲染循环的核心对象 |
| Viewport | 视口 | 影像的一个显示区域，包含自己的相机与显示参数 |
| Stack Viewport | 堆栈视口 | 逐张显示二维切片的视口 |
| Volume Viewport | 体数据视口 | 显示三维体数据的视口，支持任意切面 |
| Generic Viewport | 通用视口 | 5.x 引入的统一视口抽象，见迁移指南 |
| Render Backend | 渲染后端 | 底层图形 API 的适配层（WebGL / WebGPU） |
| Render Path | 渲染路径 | 从数据到画面的具体渲染流程 |
| Camera | 相机 | 决定观察位置、方向与视野范围 |
| Field of View (FOV) | 视野范围 | 相机可见区域的大小 |
| Pan | 平移 | 移动影像在视口中的位置 |
| Zoom | 缩放 | 改变影像的显示比例 |
| Transfer Function | 传递函数 | 把体数据的标量值映射为颜色与不透明度 |
| Colormap | 颜色映射表 | 标量值到颜色的对应关系 |
| Window Level / Width | 窗位 / 窗宽 | 控制影像灰度显示范围，医学影像的基本调节方式 |
| VOI LUT | VOI 查找表 | Value of Interest 查找表，窗宽窗位的 DICOM 表示形式 |
| Modality LUT | 模态查找表 | 把存储值转换为具有物理意义的值（如 CT 的 HU 值） |
| MPR (Multi-Planar Reconstruction) | 多平面重建 | 从体数据重建出任意方向的切面 |
| Maximum Intensity Projection (MIP) | 最大密度投影 | 沿视线取最大值的投影方式 |

## 数据与加载

| 英文 | 中文 | 说明 |
| --- | --- | --- |
| Image | 影像 | 单张二维影像 |
| Volume | 体数据 | 由多张切片构成的三维数据集 |
| Stack | 堆栈 | 一组按顺序排列的二维影像 |
| Dynamic Volume / 4D Volume | 动态体数据 / 四维体数据 | 随时间变化的体数据序列 |
| imageId | 影像 ID | 标识单张影像的字符串，同时编码了加载方式 |
| volumeId | 体数据 ID | 标识一份体数据的字符串 |
| Image Loader | 影像加载器 | 按 imageId 加载影像的函数 |
| Volume Loader | 体数据加载器 | 按 volumeId 加载体数据的函数 |
| Geometry Loader | 几何加载器 | 加载轮廓、曲面等几何数据 |
| Metadata Provider | 元数据提供者 | 按 imageId 提供 DICOM 元数据的函数 |
| Cache | 缓存 | 管理已加载影像与体数据的内存占用 |
| Request Pool Manager | 请求池管理器 | 控制并发请求数量与优先级 |
| Voxel Manager | 体素管理器 | 提供体素级别的读写接口 |
| Scalar Data | 标量数据 | 体数据中每个体素的数值 |
| Web Worker | Web Worker | 在后台线程执行影像解码等耗时任务 |
| Progressive Loading | 渐进式加载 | 先显示低质量影像，再逐步替换为完整质量 |
| Streaming | 流式加载 | 切片逐份到达时即刻渲染，不等全部下载完成 |
| Display Set | 显示集 | 一组适合一起显示的影像，5.x 引入的概念 |

## 工具与交互

| 英文 | 中文 | 说明 |
| --- | --- | --- |
| Tool | 工具 | 处理用户交互的单元，如测量、平移、缩放 |
| Tool Group | 工具组 | 一组工具及其绑定关系，可同时应用到多个视口 |
| Annotation | 标注 | 在影像上绘制的测量或标记 |
| Annotation Manager | 标注管理器 | 存储与检索标注数据 |
| Annotation Group | 标注分组 | 对标注进行分组管理 |
| Synchronizer | 同步器 | 让多个视口的某项状态保持一致（如同步滚动） |
| Crosshairs | 十字定位线 | 在多个视口间指示同一空间位置 |
| Reference Lines | 参考线 | 显示其他视口切面在当前视口中的位置 |
| Measurement Target | 测量目标 | 标注所测量的具体对象，5.x 引入 |
| Touch Events | 触摸事件 | 触摸屏上的交互处理 |

## 分割

| 英文 | 中文 | 说明 |
| --- | --- | --- |
| Segmentation | 分割 | 逐体素标记影像中的解剖结构 |
| Labelmap | 标签图 | 用整数标记每个体素所属类别的分割表示形式 |
| Contour | 轮廓 | 用闭合曲线表示的分割 |
| Surface | 曲面 | 用三角网格表示的分割 |
| Segment | 分段 | 分割结果中的一个标记类别 |
| Segment Index | 分段索引 | 标识某个分段的整数编号 |
| Active Segmentation | 活动分割 | 当前正在编辑的那份分割 |
| Segmentation Representation | 分割表示形式 | 分割在视口中的呈现方式（标签图 / 轮廓 / 曲面） |
| PolySeg | PolySeg | 在不同分割表示形式之间转换的模块 |
| Threshold | 阈值 | 按数值范围自动生成分割的依据 |
| Labelmap Interpolation | 标签图插值 | 根据已标注的若干层推算中间层的分割 |
| Planar Fill | 平面填充 | 在切面内填充封闭区域 |
| Cursor Strategy | 光标策略 | 分割笔刷的形状与作用范围规则 |
| Voxel Statistics | 体素统计 | 对分割区域内的体素计算均值、体积等指标 |

## DICOM 与网络

| 英文 | 中文 | 说明 |
| --- | --- | --- |
| DICOM | DICOM | 医学数字影像与通信标准，通常不译 |
| DICOMweb | DICOMweb | DICOM 的 Web 服务接口族 |
| WADO-RS | WADO-RS | DICOMweb 中用于检索影像的接口 |
| QIDO-RS | QIDO-RS | DICOMweb 中用于查询的接口 |
| STOW-RS | STOW-RS | DICOMweb 中用于上传的接口 |
| Study | 检查 | 一次影像检查，包含多个序列 |
| Series | 序列 | 同一检查中同一扫描参数下的一组影像 |
| SOP Instance UID | SOP 实例 UID | 单张影像的全局唯一标识 |
| Frame of Reference | 参考坐标系 | 影像所处的空间坐标系，跨序列对齐的依据 |
| Transfer Syntax | 传输语法 | DICOM 数据的编码方式 |
| HTJ2K | HTJ2K | 高吞吐 JPEG 2000，支持渐进式解码 |
| Segmentation Object (SEG) | 分割对象 | 以 DICOM 格式存储的分割结果 |
| Structured Report (SR) | 结构化报告 | 以 DICOM 格式存储的测量与标注结果 |
| RT Structure Set (RTSS) | 放疗结构集 | 放疗计划中的轮廓数据 |
| NIfTI | NIfTI | 神经影像常用的文件格式 |
| Presentation | 显示状态 | 视口的显示参数集合（窗宽窗位、缩放等） |
| View Reference | 视图引用 | 描述"看的是哪个位置"的一组参数 |

## 相关库

| 名称 | 说明 |
| --- | --- |
| `@cornerstonejs/core` | 渲染引擎、视口、加载器与缓存 |
| `@cornerstonejs/tools` | 标注、分割与交互工具 |
| `@cornerstonejs/dicom-image-loader` | DICOM 影像加载器 |
| `@cornerstonejs/nifti-volume-loader` | NIfTI 体数据加载器 |
| `@cornerstonejs/adapters` | 与 DICOM SEG / SR / RTSS 互相转换 |
| OHIF Viewer | 基于 Cornerstone3D 构建的开源阅片平台 |
| VTK.js | Cornerstone3D 在三维渲染上依赖的底层库 |
