# Setup-Cangjie

[![Tests](https://github.com/Zxilly/setup-cangjie/actions/workflows/test.yml/badge.svg)](https://github.com/Zxilly/setup-cangjie/actions/workflows/test.yml)
[![CodeQL](https://github.com/Zxilly/setup-cangjie/actions/workflows/codeql.yml/badge.svg)](https://github.com/Zxilly/setup-cangjie/actions/workflows/codeql.yml)

在 GitHub Actions 安装仓颉编译环境。

## 使用方法

支持安装 STS 和 Canary 版本，在安装 Canary 版本时，需要提供具有 GitCode Cangjie 组织访问权限的 Token。

```yaml
- uses: Zxilly/setup-cangjie@v1
  with:
    channel: 'canary' # 'canary' or 'sts'
    token: ${{ secrets.GITCODE_TOKEN }}
```
