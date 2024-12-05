---
id: playwright-tests
title: 编写Playwright测试
---

# 编写Playwright测试

我们的Playwright测试是使用Playwright测试框架编写的。我们使用这些测试来测试我们的示例并确保它们按预期工作，从而确保我们的包按预期工作。

在本指南中，我们将向您展示如何为我们的示例编写Playwright测试、创建新的示例并对其进行测试。

## 针对现有示例进行测试

如果您想使用现有示例，您可以在`utils/ExampleRunner/example-info.json`文件中找到示例列表。您可以使用`exampleName`属性引用您想要使用的示例。例如，如果您想使用`annotationToolModes`示例，可以使用以下代码片段：

```ts
import { test } from '@playwright/test';
import { visitExample } from './utils/index';

test.beforeEach(async ({ page }) => {
  await visitExample(page, 'annotationToolModes');
});

test.describe('Annotation Tool Modes', async () => {
  test('should do something', async ({ page }) => {
    // Your test code here
  });
});
```

## 针对新示例进行测试

我们的Playwright测试是针对我们的示例运行的，如果您想添加一个新示例，可以将其添加到相应包的根目录下的`examples`文件夹中，例如，`packages/tools/examples/{your_example_name}/index.ts`，然后在`utils/ExampleRunner/example-info.json`文件中将其注册到正确的类别下，例如，如果它与工具相关，可以放入现有的`tools-basic`类别。如果找不到适合您示例的类别，可以创建一个新类别，并将其添加到`example-info.json`文件中的`categories`对象中。

```json
{
  "categories": {
    "tools-basic": {
      "description": "Tools library"
    },
    "examplesByCategory": {
      "tools-basic": {
        "your_example_name": {
          "name": "Good title for your example",
          "description": "Good description of what your example demonstrates"
        }
      }
    }
  }
}
```

完成此操作后，您可以通过使用`tests/utils/visitExample.ts`文件中的`visitExample`函数来针对该示例编写测试。例如，如果您想针对`your_example_name`示例编写测试，可以使用以下代码片段：

```ts
import { test } from '@playwright/test';
import { visitExample } from './utils/index';

test.beforeEach(async ({ page }) => {
  await visitExample(page, 'your_example_name');
});

test.describe('Your Example Name', async () => {
  test('should do something', async ({ page }) => {
    // Your test code here
  });
});
```

这还会使您的示例出现在我们的文档页面上，以便用户可以了解如何使用该示例，因此通过添加新示例您可以增加双重价值。

## 截图

检查测试是否按预期工作的一个好方法是在测试的不同阶段捕获截图。您可以使用位于`tests/utils/checkForScreenshot.ts`中的`checkForScreenshot`函数来捕获截图。您还应提前规划好截图，截图需要在`tests/utils/screenshotPaths.ts`文件中定义。例如，如果您想在添加测量后捕获截图，可以这样定义截图路径：

```ts
const screenShotPaths = {
  your_example_name: {
    measurementAdded: 'measurementAdded.png',
    measurementRemoved: 'measurementRemoved.png',
  },
};
```

即使截图尚不存在也没关系，这将在下一步中解决。一旦定义了截图路径，就可以在测试中使用`checkForScreenshot`函数来捕获截图。例如，如果您想在添加测量后捕获`.cornerstone-canvas`元素的截图，可以使用以下代码片段：

```ts
import { test } from '@playwright/test';
import {
  visitExample,
  checkForScreenshot,
  screenshotPath,
} from './utils/index';

test.beforeEach(async ({ page }) => {
  await visitExample(page, 'your_example_name');
});

test.describe('Your Example Name', async () => {
  test('should do something', async ({ page }) => {
    // Your test code here to add a measurement
    const locator = page.locator('.cornerstone-canvas');
    await checkForScreenshot(
      page,
      locator,
      screenshotPath.your_example_name.measurementAdded
    );
  });
});
```

首次运行测试时，测试将自动失败，但它会为您生成截图。您会注意到在`tests/screenshots`文件夹中有三项新条目，分别是在`chromium/your-example.spec.js/measurementAdded.png`、`firefox/your-example.spec.js/measurementAdded.png`和`webkit/your-example.spec.js/measurementAdded.png`文件夹下。您现在可以再次运行测试，它将使用这些截图来与示例的当前状态进行比较。请在提交或对其进行测试之前验证基准截图是否正确。

## 模拟鼠标拖拽

如果您想模拟鼠标拖拽，可以使用位于`tests/utils/simulateDrag.ts`中的`simulateDrag`函数。您可以使用此函数来模拟对元素的鼠标拖拽。例如，如果您想模拟对`.cornerstone-canvas`元素的鼠标拖拽，可以使用以下代码片段：

```ts
import {
  visitExample,
  checkForScreenshot,
  screenShotPaths,
  simulateDrag,
} from './utils/index';

test.beforeEach(async ({ page }) => {
  await visitExample(page, 'stackManipulationTools');
});

test.describe('Basic Stack Manipulation', async () => {
  test('should manipulate the window level using the window level tool', async ({
    page,
  }) => {
    await page.getByRole('combobox').selectOption('WindowLevel');
    const locator = page.locator('.cornerstone-canvas');
    await simulateDrag(page, locator);
    await checkForScreenshot(
      page,
      locator,
      screenShotPaths.stackManipulationTools.windowLevel
    );
  });
});
```

我们的模拟拖拽工具可以模拟对任何元素的拖拽，并避免超出边界。它会计算元素的边界框，确保拖拽动作保持在元素的边界内。这对于大多数工具应该已经足够好，比提供自定义的x和y坐标更好，因为自定义坐标容易出错，并且使代码难以维护。

## 运行测试

编写测试后，可以通过使用以下命令来运行它们：

```bash
yarn test:e2e:ci
```

如果您想使用头部模式，可以使用以下命令：

```bash
yarn test:e2e:headed
```

您将在终端中看到测试结果，如果想要详细报告，可以使用以下命令：

```bash
yarn playwright show-report tests/playwright-report
```

## 手动服务示例以便开发

默认情况下，当您运行测试时，它会调用`yarn build-and-serve-static-examples`命令首先提供示例服务，然后运行测试，如果您想手动提供示例服务，可以使用相同的命令。示例将可在`http://localhost:3000`上获得。这可以加速您的开发过程，因为Playwright将跳过构建和服务步骤，并使用3000端口上的现有服务器。

## Playwright VSCode扩展和录制测试

如果您正在使用VSCode，可以使用Playwright扩展来帮助您编写测试。该扩展提供了一个测试运行程序和许多强大功能，例如使用鼠标选择定位器、录制新测试等。您可以通过在VSCode的扩展选项卡中搜索`Playwright`或者访问[Playwright扩展页面](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)来安装该扩展。

<div style={{padding:"56.25% 0 0 0", position:"relative"}}>
    <iframe src="https://player.vimeo.com/video/949208495?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
    frameBorder="0" allow="cross-origin-isolated" allowFullScreen style= {{ position:"absolute",top:0,left:0,width:"100%",height:"100%"}} title="Playwright Extension"></iframe>
</div>