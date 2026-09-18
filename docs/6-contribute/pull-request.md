---
id: pull-request
title: 如何贡献
description: 为 Cornerstone3D 做贡献的指引：如何提报缺陷、如何通过 Pull Request 提交代码改动、提交改动时的若干建议，以及需要更新 package.json 依赖时必须遵循的安全审计流程。
keywords:
  - 如何贡献
  - 提报缺陷
  - Pull Request
  - package.json
  - yarn audit
  - 依赖安全
upstream: https://www.cornerstonejs.org/docs/contribute/pull-request
---

# 如何贡献 {#how-to-contribute}

## 提报缺陷 {#reporting-bugs}

如果你发现了缺陷，我们非常鼓励你向项目维护者提报。你可以在项目的 issue
跟踪器上新建一个 issue，或者直接提一个修复该缺陷的 pull request。
提报缺陷时提供尽可能多的信息总是有帮助的；
如果你还能提供一个能复现该缺陷的示例，那就帮了大忙。

## 我想贡献代码——该怎么做？ {#i-would-like-to-contribute-code---how-do-i-do-this}

fork 该仓库、做出你的改动，然后提交一个 pull request。在提交之前：

- 确保你的改动有充分的测试，并且你已经更新了项目文档。
- 确保测试（`yarn run test`）和构建（`yarn run build`）
  在你本机上都能正常运行并全部通过。

## 提交改动有什么建议吗？ {#any-guidance-on-submitting-changes}

我们确实很感谢代码贡献，但分诊和整合外部提交的代码改动可能非常耗时。
在准备 pull request 时请考虑以下几点：

- 功能适合放进这个仓库。如果不确定，可以先在论坛上发帖问问。
- 代码质量可以接受。我们没有定义成文的编码规范，
  但请确保它能通过 ESLint，并且看起来与仓库里其余代码风格一致。
- 设计质量可以接受。这一点比较主观，建议到论坛上寻求具体指导。
- pull request 的范围不要太大。请考虑为每个特性分别提 PR，
  因为大的 PR 理解起来非常耗时。
- 我们会尽快对你的 pull request 给出反馈。遵循上面这些建议
  有助于确保你的改动得到评审。

## 我的改动需要更新 package.json 里的依赖——流程是什么？ {#my-changes-require-updating-dependencies-in-the-packagejson-files---what-is-the-process-for-doing-this}

一般来说你通常不需要更新那些 `package.json` 文件。
但如果确实需要，你还必须同时更新 Cornerstone3D 的各个 lock 文件；
也就是说，你得在**不**带 `--frozen-lockfile` 标志的情况下
分别执行一次 `yarn` 和 `bun` 的 `install`。

:::danger
更新 `package.json` 文件必须谨慎，以免引入存在漏洞的第三方包和 / 或版本。
在提交并推送代码之前，添加新包和 / 或新版本时应当这样做：

1. 尽职调查：研究所添加的包和 / 或版本是否存在已知漏洞。
2. 更新 `package.json` 文件。
3. 执行 `yarn run install:update-lockfile`。
   这会同时更新 `yarn.lock` 和 `bun.lock` 两个文件。
4. 执行 `yarn run audit` 做最后一道安全检查。
   它会同时运行 `yarn audit` 和 `bun audit`。
5. 把 `yarn.lock` 和 `bun.lock` 两个文件都包含在你的提交里。

如果你的调查或审计发现了**高**风险漏洞，**不要**提交或推送你的改动！
低风险和中风险漏洞是可以接受的。
:::
