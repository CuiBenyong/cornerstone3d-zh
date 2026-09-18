---
id: geometryLoader
title: 几何加载器
description: 几何加载器（Geometry Loader）用于从文件或 URL 加载并缓存三维几何数据（如网格）。本文说明如何用 registerGeometryLoader 注册加载器、cornerstoneMeshLoader 的用法，以及它支持的 PLY、OBJ、STL、VTP 网格格式与 MTL、JPG、PNG 材质格式。
keywords:
  - 几何加载器
  - registerGeometryLoader
  - cornerstoneMeshLoader
  - loadAndCacheGeometry
  - PLY
  - OBJ
  - STL
  - VTP
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/geometryLoader
---

# 几何加载器 {#geometry-loaders}

本节介绍 Cornerstone Core 中的几何加载器。

如果你读过分割渲染那一[节](../cornerstone-tools/segmentation/index.md)，
就会知道一份分割既可以渲染成体数据（标签图），也可以渲染成轮廓或曲面。

:::note TIP
类似的关系结构也被一些主流医学影像软件采用，
例如 [3D Slicer](https://www.slicer.org/) 配合
[polymorph segmentation](https://github.com/PerkLab/PolySeg)。
:::

几何加载器的作用，总体上就是从文件或 URL 加载并缓存几何数据。

## 注册网格加载器 {#register-mesh-loader}

你可以用
[`registerGeometryLoader`](https://www.cornerstonejs.org/docs/api/core/namespaces/geometryloader/functions/registerGeometryLoader)
把一个外部网格加载器接入 cornerstone 库。该函数接受一个 `scheme`，
表示第二个参数那个网格加载器函数负责处理的 scheme。

```js
import {
  geometryLoader,
  cornerstoneMeshLoader,
  Enums,
  Types,
} from '@cornerstonejs/core';

geometryLoader.registerGeometryLoader('mesh', cornerstoneMeshLoader);
```

### CornerstoneMeshLoader {#cornerstonemeshloader}

`cornerstoneMeshLoader` 的示例代码可以在
[这里](https://github.com/cornerstonejs/cornerstone3D/tree/main/packages/core/examples/meshLoader)
查看。

```js
const mesh1 = await geometryLoader.loadAndCacheGeometry(
  'mesh:https://example.com/mesh.ply',
  {
    type: Enums.GeometryType.MESH,
    geometryData: {
      id: 'mesh1',
      format: Enums.MeshType.PLY,
    } as Types.MeshData,
  }
);

const mesh2 = await geometryLoader.loadAndCacheGeometry(
  'mesh:https://example.com/mesh.obj',
  {
    type: Enums.GeometryType.MESH,
    geometryData: {
      id: 'mesh2',
      format: Enums.MeshType.OBJ,
      materialUrl: 'https://example.com/material.mtl',
    } as Types.MeshData,
  }
);

viewport.setActors([
  { uid: mesh1.id, actor: (mesh1.data as Types.IMesh).actor },
  { uid: mesh2.id, actor: (mesh2.data as Types.IMesh).actor },
]);
```

#### 支持的网格格式 {#supported-mesh-formats}

`cornerstoneMeshLoader` 支持的网格格式有：

- PLY
- OBJ
- STL
- VTP

### 支持的材质格式 {#supported-material-formats}

`cornerstoneMeshLoader` 支持的材质格式有：

- MTL
- JPG
- PNG
- JPEG
