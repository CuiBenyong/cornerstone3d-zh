---  
id: imageId  
title: ImageId  
---  

# ImageId  

`Cornerstone3D` 的 `ImageId` 是一个 URL，用于标识 Cornerstone 显示的单张图像。  

`ImageId` 中的 URL 方案被 Cornerstone 用来确定调用哪个 [图像加载器](./imageLoader.md) 插件来实际加载图像。需要注意的是，`Cornerstone3D` 将图像加载委托给已注册的图像加载器。  
这种策略使得 Cornerstone 可以同时显示从不同服务器通过不同协议获取的多个图像。例如，Cornerstone 可以同时显示通过 WADO 协议获得的 DICOM CT 图像以及通过数字相机拍摄并存储在文件系统中的 JPEG 皮肤科图像。  

## ImageId 格式  

![image-id-format](./../../assets/image-id-format.png)  

DICOM 持久对象（WADO）是一种使用 DICOM 协议存储和检索医学图像的标准。  
WADO 允许从 WADO 兼容服务器检索（和存储）图像。以下是不同图像加载器插件的 ImageId 示例：  

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

Cornerstone 不指定 URL 的内容是什么 —— 由图像加载器定义 URL 的内容和格式，以便能够定位图像。例如，可以编写一个专有的图像加载器插件与专有服务器通信，并使用 GUID、文件名或数据库行 ID 查找图像。  

以下是不同图像加载器插件的 ImageId 示例：  

- `example://1`  
- `dicomweb://server/wado/{uid}/{uid}/{uid}`  
- `http://server/image.jpeg`  
- `custom://server/uuid`  
- `wadors://server/{StudyInstanceUID}/{SeriesInstanceUID}/{SOPInstanceUID}`  