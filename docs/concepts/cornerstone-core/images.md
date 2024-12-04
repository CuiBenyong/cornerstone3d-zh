---  
id: images  
title: 图像对象
---  

# 图像对象

Cornerstone 的 [Image Loaders](./imageLoader.md) 返回 `Image Load Objects`，其中包含一个 Promise。我们选择使用对象而不是仅返回 Promise 的原因是，图像加载器现在还可以在其图像加载对象中返回其他属性。例如，我们计划实现通过图像加载器在图像加载对象中返回一个 `cancelFn`，以支持取消待处理或正在进行的请求。  

以下是此类图像加载对象的接口。您可以在 API 参考的 [IImage 部分](/api/core/namespace/Types#IImage) 中阅读更多关于每个字段的说明。  

```js  
interface IImage {  
  imageId: string  
  sharedCacheKey?: string  
  minPixelValue: number  
  maxPixelValue: number  
  slope: number  
  intercept: number  
  windowCenter: number[]  
  windowWidth: number[]  
  getPixelData: () => Array<number>  
  getCanvas: () => HTMLCanvasElement  
  rows: number  
  columns: number  
  height: number  
  width: number  
  color: boolean  
  rgba: boolean  
  numberOfComponents: number  
  columnPixelSpacing: number  
  rowPixelSpacing: number  
  sliceThickness?: number  
  invert: boolean  
  sizeInBytes: number  
  scaling?: {  
    PET?: {  
      SUVlbmFactor?: number  
      SUVbsaFactor?: number  
      suvbwToSuvlbm?: number  
      suvbwToSuvbsa?: number  
    }  
  }  
}  
```