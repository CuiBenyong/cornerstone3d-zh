---
id: imageId
title: 影像 ID（ImageId）
description: ImageId 是一个用于唯一标识单张影像的 URL，Cornerstone 依据其 URL scheme 决定调用哪个影像加载器。本文说明 ImageId 的格式，并给出 WADO-URI、WADO-RS 等不同加载器下 imageId 的实际例子。
keywords:
  - imageId
  - ImageId 格式
  - WADO-URI
  - WADO-RS
  - dicomweb
  - URL scheme
  - 影像加载器
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/imageId
---

# 影像 ID（ImageId） {#imageid}

`Cornerstone3D` 的 `ImageId` 是一个 URL，用来标识一张要交给 cornerstone 显示的影像。

Cornerstone 依据 `ImageId` 中的 URL scheme 来决定调用哪个
[影像加载器](./imageLoader.md)插件去实际加载这张影像。
需要说明的是，`Cornerstone3D` 把影像加载这件事完全委托给了已注册的影像加载器。

这个策略使 Cornerstone 能够同时显示用不同协议、从不同服务器获取的多张影像。
例如，Cornerstone 可以把通过 WADO 获取的 DICOM CT 影像，
与一张用数码相机拍摄、存放在文件系统上的 JPEG 皮肤科照片并排显示。

ImageId 的格式：

![image-id-format](./../../assets/image-id-format.png)

DICOM 持久对象（WADO）是一套使用 DICOM 协议存取医学影像的标准。
WADO 允许从兼容 WADO 的服务器检索（以及存储）影像。
下面是不同影像加载器插件下 imageId 的一些例子：

[**WADO-URI**](https://dicom.nema.org/dicom/2013/output/chtml/part18/sect_6.2.html)

```
http://www.medical-webservice.st/RetrieveDocument?
requestType=WADO&studyUID=1.2.250.1.59.40211.12345678.678910
&seriesUID=1.2.250.1.59.40211.789001276.14556172.67789
&objectUID=1.2.250.1.59.40211.2678810.87991027.899772.2
&contentType=application%2Fdicom&transferSyntax=1.2.840.10008.1.2.4.50

```

[**WADO-RS**](https://dicom.nema.org/dicom/2013/output/chtml/part18/sect_6.5.html)

```
https://d14fa38qiwhyfd.cloudfront.net/dicomweb/
studies/1.3.6.1.4.1.25403.345050719074.3824.20170126083429.2/
series/1.3.6.1.4.1.25403.345050719074.3824.20170126083454.5/
instances/1.3.6.1.4.1.25403.345050719074.3824.20170126083455.3/frames/1
```

Cornerstone 并不规定 URL 的内容是什么——由影像加载器自己定义 URL 的内容和格式，
只要它能据此定位到影像即可。举例来说，可以写一个专有的影像加载器插件，
让它与某个专有服务器通信，并用 GUID、文件名或数据库行 id 来查找影像。

下面是不同影像加载器插件下 ImageId 可能长什么样的一些例子：

- `example://1`
- `dicomweb://server/wado/{uid}/{uid}/{uid}`
- `http://server/image.jpeg`
- `custom://server/uuid`
- `wadors://server/{StudyInstanceUID}/{SeriesInstanceUID}/{SOPInstanceUID}`
