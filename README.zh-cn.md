# 网站

该网站使用 [Docusaurus](https://docusaurus.io/) 构建，这是一个现代化的静态网站生成器。

### 安装

```
$ yarn
```

### 本地开发

```
$ yarn start
```

此命令启动本地开发服务器并打开浏览器窗口。大部分更改会实时反映，无需重新启动服务器。

### 构建

```
$ yarn build
```

此命令将生成静态内容并将其存放在 `build` 目录中，可以使用任何静态内容托管服务进行部署。

### 部署

使用 SSH:

```
$ USE_SSH=true yarn deploy
```

不使用 SSH:

```
$ GIT_USER=<你的 GitHub 用户名> yarn deploy
```

如果你使用 GitHub Pages 进行托管，此命令是构建网站并推送到 `gh-pages` 分支的便捷方式。