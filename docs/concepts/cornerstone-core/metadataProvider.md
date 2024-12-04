---  
id: metadataProvider  
title: 元数据提供者  
---  

# 元数据提供者  

医学图像通常附带许多非像素级的元数据，例如图像的像素间距、病人 ID 或扫描采集日期。对于某些文件类型（如 DICOM），这些信息存储在文件头中，可以读取、解析并传递给应用程序。而对于其他文件类型（如 JPEG、PNG），这些信息需要独立于实际像素数据提供。然而，即使是 DICOM 图像，应用程序开发人员也通常将元数据独立于像素数据的传输提供给客户端，因为这样可以显著提高性能。  

元数据提供者是一个 JavaScript 函数，充当访问与 Cornerstone 中图像相关的元数据的接口。用户可以定义自己的提供者函数，以便为每个特定图像返回他们希望提供的任何元数据。元数据提供者函数具有以下原型：

```
function metadataProvider(type: string, ...queries: any): any
```

然而，通常提供者实现以下更简单的原型：

```
function metadataProvider(type: string, imageId: string): Record<string, any>
```

这是因为大多数元数据是为 [ImageId](./imageId.md) 提供的，但 Cornerstone 提供了为任何信息定义和使用元数据提供者的基础设施。

## 元数据类型  

元数据提供者的 `type` 参数可以是任何字符串。您可以使用 `cornerstone.metaData.get()` 调用任何类型，如果任何元数据提供者可以为给定的图像 ID 提供该类型，则会收到响应。例如，您可以用它轻松提供应用程序特定的信息，如地面真相或病人信息。  

Cornerstone 核心和工具也会自动请求显示图像的各种类型的元数据。标准元数据模块的列表可以在 API 参考的 [MetadataModules 部分](/api/core/namespace/Enums#MetadataModules) 中找到。许多这些模块符合 DICOM 标准。如果您想在 [自定义元数据提供者](../../how-to-guides/custom-metadata-provider.md) 中实现它们，最简单的方法是查看现有元数据提供者如何实现它们，例如 [WADOURI 元数据提供者](https://github.com/cornerstonejs/cornerstone3D/blob/main/packages/dicomImageLoader/src/imageLoader/wadouri/metaData/metaDataProvider.ts#L65)。

## 元数据提供者的优先级  

由于可以注册多个元数据提供者，因此在添加提供者时可以为其定义优先级编号。当请求元数据时，Cornerstone 按照提供者的优先级顺序请求 `imageId` 的元数据（如果提供者对 `imageId` 返回 `undefined`，Cornerstone 会转到下一个提供者）。  

例如，如果 provider1 注册了优先级 10，provider2 注册了优先级 100，那么 Cornerstone 会首先请求 provider2 提供该 `imageId` 的元数据。