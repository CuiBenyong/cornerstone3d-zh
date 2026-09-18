---
id: async-beforesend
title: beforeSend 回调改为异步
description: 4.x 中 dicomImageLoader 的 beforeSend 回调从同步改为异步，现在返回 Promise。本文给出签名的前后对比、如何把既有同步回调包成 Promise、如何借此在回调中做异步取 token 等操作，以及相关注意事项。
keywords:
  - beforeSend
  - dicomImageLoader
  - 异步回调
  - Promise
  - 认证 token
  - LoaderOptions
  - Cornerstone3D 4.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/4x/async-beforesend
---

# beforeSend 回调改为异步 {#async-beforesend-callback}

## 变化内容 {#what-changed}

在 4.x 版本中，dicomImageLoader 的 LoaderOptions 里那个 `beforeSend` 回调
已从同步改为异步，现在返回一个 Promise。

### API 变化 {#api-change}

`beforeSend` 回调的签名已更新，以支持异步操作：

```typescript
// 迁移前（3.x）
beforeSend?: (
  xhr: XMLHttpRequest,
  imageId: string,
  defaultHeaders: Record<string, string>,
  params: LoaderXhrRequestParams
) => Record<string, string> | void;

// 迁移后（4.x）
beforeSend?: (
  xhr: XMLHttpRequest,
  imageId: string,
  defaultHeaders: Record<string, string>,
  params: LoaderXhrRequestParams
) => Promise<Record<string, string> | void>;
```

## 迁移指南 {#migration-guide}

### 更新同步回调 {#update-synchronous-callbacks}

如果你已有同步的 `beforeSend` 回调，把返回值包进 Promise 即可：

```javascript
import dicomImageLoader from '@cornerstonejs/dicom-image-loader';

// 迁移前（3.x）—— 同步
dicomImageLoader.init({
  beforeSend: function (xhr, imageId, defaultHeaders, params) {
    const headers = {
      Authorization: 'Bearer ' + getAuthToken(),
      'Custom-Header': 'value',
    };
    return headers;
  },
});

// 迁移后（4.x）—— 返回 Promise 的异步形式
dicomImageLoader.init({
  beforeSend: function (xhr, imageId, defaultHeaders, params) {
    return Promise.resolve({
      Authorization: 'Bearer ' + getAuthToken(),
      'Custom-Header': 'value',
    });
  },
});

// 也可以用 async/await 语法
dicomImageLoader.init({
  beforeSend: async function (xhr, imageId, defaultHeaders, params) {
    return {
      Authorization: 'Bearer ' + getAuthToken(),
      'Custom-Header': 'value',
    };
  },
});
```

### 利用异步能力 {#leverage-async-capabilities}

现在你可以在 `beforeSend` 中执行异步操作了：

```javascript
// 异步获取认证 token
dicomImageLoader.init({
  beforeSend: async function (xhr, imageId, defaultHeaders, params) {
    // 现在可以发起异步调用
    const token = await fetchAuthToken();
    const customHeaders = await getCustomHeaders(imageId);

    return {
      Authorization: 'Bearer ' + token,
      ...customHeaders,
    };
  },
});
```

## 好处 {#benefits}

- **异步操作**：可以从远端获取认证 token 或请求头
- **token 刷新**：可以在发请求前自动刷新已过期的 token
- **条件化请求头**：可以依据异步检查的结果动态决定请求头
- **更好的集成**：能与现代异步认证流程无缝配合

## 重要提示 {#important-notes}

- 该回调现在必须返回 Promise，即使做的是同步操作
- 对立即可得的值用 `Promise.resolve()`，或使用 `async/await` 语法
- XHR 请求会等到该 Promise 解决之后才真正发出
- 被 reject 的 Promise 会导致该影像加载失败

## 为什么要做这项改动 {#why-we-changed-this}

现代认证流程常常需要异步操作（刷新 token、OAuth 流程等）。
把 `beforeSend` 改为异步，使它能正常接入这些模式，而不必再靠变通手段。
