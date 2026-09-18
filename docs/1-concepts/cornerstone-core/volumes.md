---
id: volumes
title: 体数据
description: 体数据（Volume）是一个在空间中具有物理尺寸和方位的三维数据数组，由参考坐标系、体素间距、体素维度、原点和方向向量共同确定其坐标系。本文给出 IImageVolume 接口的完整字段，并说明为何用 VoxelManager 取代了原先的 scalarData。
keywords:
  - 体数据
  - Volume
  - ImageVolume
  - IImageVolume
  - VoxelManager
  - FrameOfReferenceUID
  - 体素间距
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/volumes
---

# 体数据 {#volumes}

体数据是一个三维数据数组，在空间中具有物理尺寸和方位。它可以由一个三维影像序列的
像素数据与元数据组合而成，也可以由应用从零开始定义。一份体数据具有
`FrameOfReferenceUID`、`体素间距 (x,y,z)`、`体素维度 (x,y,z)`、`原点`
和`方向`向量，这些共同唯一确定了它相对于患者坐标系的坐标系。

## ImageVolume {#imagevolume}

在 `Cornerstone3D` 中，我们用 `ImageVolume` 基类来表示一份三维影像体数据，
所有体数据都派生自这个类。例如 `StreamingImageVolume` 就用于表示一份
正在逐张影像流式加载的体数据。`StreamingImageVolume` 类稍后会详细讨论。

```js
interface IImageVolume {
  /** 该体数据在缓存中的唯一标识 */
  readonly volumeId: string
  /** 体数据维度 */
  dimensions: Point3
  /** 体数据方向 */
  direction: Float32Array
  /** 体数据元数据 */
  metadata: Metadata
  /** 体数据原点 —— 设为体数据中最后一张影像的 imagePositionPatient */
  origin: Point3
  /** 体数据的缩放元数据 */
  scaling?: {
    PET?: {
      SUVlbmFactor?: number
      SUVbsaFactor?: number
      suvbwToSuvlbm?: number
      suvbwToSuvbsa?: number
    }
  }
  /** 体数据大小（字节） */
  sizeInBytes?: number
  /** 体数据间距 */
  spacing: Point3
  /** 体数据中的体素数量 */
  numVoxels: number
  /** 以 vtkImageData 形式表示的体数据影像数据 */
  imageData?: vtkImageData
  /** 该体数据对应的 openGL 纹理 */
  vtkOpenGLTexture: any
  /** 体数据的加载状态对象，包含已加载 / 加载中的状态 */
  loadStatus?: Record<string, any>
  /** 体数据的 imageId（当它由若干独立 imageId 构成时） */
  imageIds?: Array<string>
  /** 体数据的 referencedVolumeId（当它派生自另一份体数据时） */
  referencedVolumeId?: string // 当该体数据派生自另一份体数据
  /** 体素管理器 */
  voxelManager?: IVoxelManager
}
```

## 体素管理器 {#voxel-manager}

`VoxelManager` 负责管理一份体数据的体素数据。在 `Cornerstone3D` 早前的版本中，
我们把 `scalarData` 直接放在 `ImageVolume` 对象里。但这种做法在内存占用和性能上
存在若干限制，因此现在我们把体素数据的管理委托给 `VoxelManager` 类——
它是一个有状态的类，负责跟踪体数据中的体素数据。

关于 `VoxelManager` 类的更多内容见[这里](./voxelManager.md)。
