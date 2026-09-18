---
id: node-20-upgrade
title: 升级到 Node.js 20
description: Cornerstone3D 4.x 要求 Node.js 20 或更高版本，此前的要求是 Node.js 18。本文给出用 nvm 升级本地 Node 版本的命令，以及 package.json 中 engines 字段的写法。
keywords:
  - Node.js 20
  - nvm
  - engines
  - Cornerstone3D 4.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/4x/node-20-upgrade
---

# 升级到 Node.js 20 {#nodejs-20-upgrade}

## 概览 {#overview}

Cornerstone3D 4.x 要求 Node.js 20 或更高版本。
此前的要求是 Node.js 18。

## 需要做的改动 {#changes-required}

### 更新 Node 版本 {#update-node-version}

把本地开发环境升级到 Node.js 20 或更高：

```bash
# 使用 nvm（Node Version Manager）
nvm install 20
nvm use 20

# 或者直接从 nodejs.org 安装
```

### 更新 Package.json {#update-packagejson}

更新你 `package.json` 中的 engines 字段：

```json
{
  "engines": {
    "node": ">=20"
  }
}
```
