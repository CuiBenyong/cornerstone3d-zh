---
id: volumes
title: 体积
---

# 体积


体积是具有物理尺寸和空间方向的 3D 数据阵列。它可以通过组合 3D 成像系列的像素数据和元数据来构建，也可以由应用程序从头开始定义。体积具有“FrameOfReferenceUID”、“voxelSpacing (x,y,z)”、“体素尺寸 (x,y,z)”、“origin”和“orientation”向量，它们唯一地定义其相对于患者坐标系。

## ImageVolume

在“Cornerstone3D”中，我们使用“ImageVolume”基类来表示 3D 图像体积。所有体积均源自此类。例如`StreamingImageVolume` 用于表示正在逐个图像流式传输的体积。稍后我们将更详细地讨论“StreamingImageVolume”类。

```js
interface IImageVolume {
  /** unique identifier of the volume in the cache */
  readonly volumeId: string
  /** volume dimensions */
  dimensions: Point3
  /** volume direction */
  direction: Float32Array
  /** volume metadata */
  metadata: Metadata
  /** volume origin - set to the imagePositionPatient of the last image in the volume */
  origin: Point3
  /** volume scaling metadata */
  scaling?: {
    PET?: {
      SUVlbmFactor?: number
      SUVbsaFactor?: number
      suvbwToSuvlbm?: number
      suvbwToSuvbsa?: number
    }
  }
  /** volume size in bytes */
  sizeInBytes?: number
  /** volume spacing */
  spacing: Point3
  /** number of voxels in the volume */
  numVoxels: number
  /** volume image data as vtkImageData */
  imageData?: vtkImageData
  /** openGL texture for the volume */
  vtkOpenGLTexture: any
  /** loading status object for the volume containing loaded/loading statuses */
  loadStatus?: Record<string, any>
  /** imageIds of the volume (if it is built of separate imageIds) */
  imageIds?: Array<string>
  /** volume referencedVolumeId (if it is derived from another volume) */
  referencedVolumeId?: string // if volume is derived from another volume
  /** voxel manager */
  voxelManager?: IVoxelManager
}
```

## 体素管理器

`VoxelManager` 负责管理体积的体素数据。在之前版本的“Cornerstone3D”中，我们曾经在“ImageVolume”对象中包含“scalarData”。然而，这种方法在内存使用和性能方面有一些制。因此，我们现在将体素数据管理委托给“VoxelManager”类，它是一个有状态的类，用于跟踪体积中的体素数据。
您可以在[此处](./voxelManager.md)阅读有关“VoxelManager”类的更多信息。