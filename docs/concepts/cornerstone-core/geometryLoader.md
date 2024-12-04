---  
id: geometryLoader  
title: 几何加载器  
---  

# 几何加载器  

本节描述了 Cornerstone Core 中的几何加载器。  

如果你阅读了分割渲染的[章节](../cornerstone-tools/segmentation/index.md)，你会看到，分割可以作为体积（标签图）进行渲染，或者可以作为轮廓或表面进行渲染（尚未实现）。  

:::note 提示  
类似的关系结构已经被应用于流行的医学影像软件，如 [3D Slicer](https://www.slicer.org/)，并加入了 [polymorph segmentation](https://github.com/PerkLab/PolySeg)。  
:::  

几何加载器通常用于从文件或 URL 加载几何数据。目前，我们只支持使用 `createAndCacheGeometry` 加载和缓存轮廓几何（该函数仅接受数据，因此尚不支持加载）。然而，未来可以添加额外的加载器，如 XML、JSON、OBJ、STL、PLY 等，以便以不同的格式加载几何数据。