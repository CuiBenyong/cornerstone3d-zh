---
id: vue-angular-react-etc
title: 'React, Vue, Angular 等'
---


这里有一些如何在 React、Vue、Angular 等框架中使用 cornerstone3D 的示例。
我们已经使得在您喜欢的框架中使用 cornerstone3D 变得简单。

请点击下面的链接以查看如何在您喜欢的框架中使用 cornerstone3D。

- [在 React 中使用 Cornerstone3D](https://github.com/cornerstonejs/vite-react-cornerstone3d)
- [在 Vue 中使用 Cornerstone3D](https://github.com/cornerstonejs/vue-cornerstone3d)
- [在 Angular 中使用 Cornerstone3D](https://github.com/cornerstonejs/angular-cornerstone3d)
  - [社区维护的项目](https://github.com/yanqzsu/ng-cornerstone)
- [在 Next.js 中使用 Cornerstone3D](https://github.com/cornerstonejs/nextjs-cornerstone3d)


## Vite

要更新您的 Vite 配置，请使用 CommonJS 插件，从优化中排除 `dicom-image-loader`，并包含 `dicom-parser`。我们计划将 `dicom-image-loader` 转换为 ES 模块，以消除未来对排除的需求。

```javascript
import { viteCommonjs } from "@originjs/vite-plugin-commonjs"


export default defineConfig({
  plugins: [viteCommonjs()],
  optimizeDeps: {
    exclude: ["@cornerstonejs/dicom-image-loader"],
    include: ["dicom-parser"],
  },
})
```


## Webpack

对于 webpack，只需安装 cornerstone3D 库并将其导入到您的项目中。

如果您之前使用了

`noParse: [/(codec)/],`

来避免在 webpack 模块中解析 codecs，请移除该行。cornerstone3D 库现在将 codecs 作为 ES 模块包含在内。