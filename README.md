# Setup-Cangjie

[![Tests](https://github.com/Zxilly/setup-cangjie/actions/workflows/test.yml/badge.svg)](https://github.com/Zxilly/setup-cangjie/actions/workflows/test.yml)
[![CodeQL](https://github.com/Zxilly/setup-cangjie/actions/workflows/codeql.yml/badge.svg)](https://github.com/Zxilly/setup-cangjie/actions/workflows/codeql.yml)

在 GitHub Actions 安装仓颉编译环境。

## 使用方法

支持安装 STS 和 Canary 版本，在安装 Canary 版本时，需要提供具有 GitCode Cangjie 组织访问权限的 Token。

```yaml
- uses: Zxilly/setup-cangjie@v1
  with:
    channel: canary # 'canary' 或者 'sts'
    version: 0.58.3 # 需要安装的仓颉版本，例如 0.53.13, 0.58.3，使用 latest 表示最新版，默认为 auto
    token: ${{ secrets.GITCODE_TOKEN }} # 访问仓颉 gitcode 仓库的 token，使用 canary 通道时必须提供
    tool-cache: true # 把编译 SDK 保存到 GitHub Actions 缓存中
```
