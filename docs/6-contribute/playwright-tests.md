---
id: playwright-tests
title: 编写 Playwright 测试
description: 用 Playwright 编写端到端测试的完整指南。涵盖针对既有示例与新增示例写测试、用 checkForScreenshot 做截图比对、用 simulateDrag 模拟鼠标拖拽、run-playwright.sh 包装脚本的各项标志、更新截图基线，以及手动托管示例与 VSCode 扩展录制测试。
keywords:
  - Playwright 测试
  - visitExample
  - checkForScreenshot
  - simulateDrag
  - run-playwright.sh
  - update-snapshots
  - 端到端测试
upstream: https://www.cornerstonejs.org/docs/contribute/playwright-tests
---

# 编写 Playwright 测试 {#writing-playwright-tests}

我们的 Playwright 测试是用 Playwright 测试框架写的。我们用这些测试来测我们的示例，
确保它们按预期工作——这反过来也就确保了我们的各个包按预期工作。

本指南将演示如何为我们的示例编写 Playwright 测试、如何新建示例并针对它做测试。

## 针对既有示例写测试 {#testing-against-existing-examples}

如果你想使用某个既有示例，可以在 `utils/ExampleRunner/example-info.json`
文件中找到示例清单。用 `exampleName` 属性来引用你想用的那个示例。
例如想用 `annotationToolModes` 这个示例，可以这样写：

```ts
import { test } from '@playwright/test';
import { visitExample } from './utils/index';

test.beforeEach(async ({ page }) => {
  await visitExample(page, 'annotationToolModes');
});

test.describe('Annotation Tool Modes', async () => {
  test('should do something', async ({ page }) => {
    // 你的测试代码写在这里
  });
});
```

## 针对新增示例写测试 {#testing-against-new-examples}

我们的 playwright 测试是跑在示例上的。如果你想新增一个示例，
可以把它放到相应包根目录下的 `examples` 文件夹里，
例如 `packages/tools/examples/{your_example_name}/index.ts`，
然后在 `utils/ExampleRunner/example-info.json` 文件中把它注册到正确的分类下——
比如它与工具相关，就可以放进既有的 `tools-basic` 分类。
如果找不到合适的分类，你也可以新建一个分类，
把它加到 `example-info.json` 的 `categories` 对象里。

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

做完这一步，就可以用 `tests/utils/visitExample.ts` 中的 `visitExample`
函数针对该示例写测试了。例如想为 `your_example_name` 这个示例写测试：

```ts
import { test } from '@playwright/test';
import { visitExample } from './utils/index';

test.beforeEach(async ({ page }) => {
  await visitExample(page, 'your_example_name');
});

test.describe('Your Example Name', async () => {
  test('should do something', async ({ page }) => {
    // 你的测试代码写在这里
  });
});
```

这样做还会让你的示例出现在我们的文档页面上，使用者就能看到该示例怎么用——
所以新增一个示例其实是一举两得。

## 截图 {#screenshots}

检查测试是否按预期工作的一个好办法，是在测试的不同阶段截图。
可以用位于 `tests/utils/checkForScreenshot.ts` 的 `checkForScreenshot`
函数来截图。你还应当提前规划好要截哪些图——
截图需要先在 `tests/utils/screenshotPaths.ts` 文件中定义。
例如想在添加一次测量之后截图，可以这样定义截图路径：

```ts
const screenShotPaths = {
  your_example_name: {
    measurementAdded: 'measurementAdded.png',
    measurementRemoved: 'measurementRemoved.png',
  },
};
```

此时截图文件还不存在也没关系，下一步会处理。定义好截图路径之后，
就可以在测试里用 `checkForScreenshot` 函数来截图了。
例如想在添加一次测量之后对 `cornerstone-canvas` 元素截图：

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
    // 你添加一次测量的测试代码写在这里
    const locator = page.locator('.cornerstone-canvas');
    await checkForScreenshot(
      page,
      locator,
      screenshotPath.your_example_name.measurementAdded
    );
  });
});
```

这个测试第一次运行时必然会失败，但它会帮你把截图生成出来：
你会在 `tests/screenshots` 文件夹下看到 3 个新条目，分别位于
`chromium/your-example.spec.js/measurementAdded.png`、
`firefox/your-example.spec.js/measurementAdded.png` 和
`webkit/your-example.spec.js/measurementAdded.png`。
这时再跑一次测试，它就会拿这些截图与示例当前的状态做比对。
在提交这些基准截图、或用它们做比对之前，请先确认它们是正确的。

## 模拟鼠标拖拽 {#simulating-mouse-drags}

如果想模拟鼠标拖拽，可以用位于 `tests/utils/simulateDrag.ts` 的
`simulateDrag` 函数。它可以在任意元素上模拟鼠标拖拽。
例如想在 `cornerstone-canvas` 元素上模拟拖拽：

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

我们这个拖拽模拟工具可以在任意元素上模拟拖拽，并且不会拖出边界。
它会计算该元素的包围盒，确保拖拽保持在元素范围之内。
这对大多数工具来说已经够用，而且比自己传入自定义的 x、y 坐标更好——
后者容易出错，也让代码难以维护。

## 运行测试 {#running-the-tests}

写好测试之后，可以用下面的命令运行：

```bash
./scripts/run-playwright.sh
./scripts/run-playwright.sh --compat
./scripts/run-playwright.sh --cpu
./scripts/run-playwright.sh --next
```

这个包装脚本会运行 `npx playwright test`、按所选模式自动挑选测试文件，
并把带时间戳的日志和产物写到 `reports/` 下。

例如：

```bash
reports/legacy-playwright/<timestamp>/
reports/compat-playwright/<timestamp>/
reports/compat-cpu-playwright/<timestamp>/
reports/generic-viewport-playwright/<timestamp>/
```

该包装脚本支持的标志：

- `--compat`：以 `?type=next` 打开示例页面。
- `--cpu`：以 `?cpu=1` 打开示例页面。
- `--next`：只运行 `tests/genericViewport/**/*.spec.ts`。

Playwright 的 `--next` 与 Karma 的 `--next` **含义不同**。
Playwright 用它只选取 `tests/genericViewport` 那套测试；
而 Karma 用它作为便捷模式，跑兼容模式和 CPU 两轮。

其余参数会被直接透传给 `playwright test`，
所以你仍然可以照常使用 Playwright 的 CLI：

```bash
./scripts/run-playwright.sh --project chromium --headed
./scripts/run-playwright.sh -g "stack viewport"
./scripts/run-playwright.sh --workers 1
./scripts/run-playwright.sh --update-snapshots
```

有用的环境变量：

- `PLAYWRIGHT_REUSE_EXISTING_SERVER=true|false`：
  控制是否复用已配置的本地示例服务器。
- 包装脚本内部会设置 `PLAYWRIGHT_FORCE_COMPAT`、
  `PLAYWRIGHT_FORCE_CPU_RENDERING`、`PLAYWRIGHT_HTML_OUTPUT_DIR`
  和 `PLAYWRIGHT_HTML_OPEN=never`。

例如：

```bash
./scripts/run-playwright.sh
./scripts/run-playwright.sh --compat
./scripts/run-playwright.sh --project chromium --headed
./scripts/run-playwright.sh -g "stack viewport"
PLAYWRIGHT_REUSE_EXISTING_SERVER=true ./scripts/run-playwright.sh --project chromium
./scripts/run-playwright.sh --next
```

## 更新截图基线 {#updating-screenshot-baselines}

Playwright 的快照文件存放在
`tests/screenshots/<project>/<spec>/<name>.png`，
路径模板来自 `playwright.config.ts`。

常规运行会与那些已提交的截图做比对。要重写它们，
把 Playwright 原生的快照标志透传给包装脚本即可：

```bash
./scripts/run-playwright.sh --update-snapshots
./scripts/run-playwright.sh --next --update-snapshots
./scripts/run-playwright.sh --project chromium --update-snapshots
```

## 开发时手动托管示例 {#serving-the-examples-manually-for-development}

默认情况下，当 Playwright 需要启动自己的本地服务器时，
它会在 `playwright.globalSetup.ts` 中构建这些示例，
随后配置好的 `webServer` 会在 `http://localhost:3333` 上托管
`.static-examples`。

如果你想在开发期间自己手动托管这些示例，
可以自己运行同一条命令，然后告诉 Playwright 复用这个已有的服务器：

```bash
yarn run build-and-serve-static-examples
PLAYWRIGHT_REUSE_EXISTING_SERVER=true ./scripts/run-playwright.sh
```

## Playwright 的 VSCode 扩展与录制测试 {#playwright-vscode-extension-and-recording-tests}

如果你用 VSCode，可以借助 Playwright 扩展来帮你写测试。
该扩展提供了测试运行器以及许多很好用的功能，
例如用鼠标点选 locator、录制一个新测试等等。
在 VSCode 的扩展页搜索 `Playwright` 即可安装，
也可以访问 [Playwright 扩展页面](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)。

<div style={{padding:"56.25% 0 0 0", position:"relative"}}>
    <iframe src="https://player.vimeo.com/video/949208495?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
    frameBorder="0" allow="cross-origin-isolated" allowFullScreen style= {{ position:"absolute",top:0,left:0,width:"100%",height:"100%"}} title="Playwright Extension"></iframe>
</div>
