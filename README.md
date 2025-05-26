# Setup-Cangjie

[![Tests](https://github.com/Zxilly/setup-cangjie/actions/workflows/test.yml/badge.svg)](https://github.com/Zxilly/setup-cangjie/actions/workflows/test.yml)
[![CodeQL](https://github.com/Zxilly/setup-cangjie/actions/workflows/codeql.yml/badge.svg)](https://github.com/Zxilly/setup-cangjie/actions/workflows/codeql.yml)

在 GitHub Actions 安装仓颉编译环境。

## 使用方法

支持安装 STS 和 Canary 版本，在安装 Canary 版本时，需要提供具有 GitCode Cangjie 组织访问权限的 Token。

### 参数说明

| 参数           | 说明                                                                             | 是否必需 | 默认值    |
|--------------|--------------------------------------------------------------------------------|------|--------|
| channel      | 需要安装的仓颉版本通道，例如 canary, sts                                                     | 否    | canary |
| version      | 需要安装的仓颉版本，例如 0.53.13, 0.58.3，latest 表示最新版，auto 表示优先从 cjpm.toml 获取版本，否则为 latest | 否    | auto   |
| token        | 访问仓颉 gitcode 仓库的 token，使用 canary 通道时必须提供                                       | 否    |        |
| tool-cache   | 是否缓存仓颉 SDK                                                                     | 否    | true   |
| archive-path | 下载的 .zip/.tar.gz 文件的存储路径                                                       | 否    |        |

### 输出

| 输出名     | 说明      |
|---------|---------|
| version | 安装的仓颉版本 |

### 示例

```yaml
- uses: Zxilly/setup-cangjie@v1
  with:
    channel: canary # 'canary' 或者 'sts'
    version: 0.58.3 # 需要安装的仓颉版本，例如 0.53.13, 0.58.3，latest 表示最新版，auto 表示自动获取
    token: ${{ secrets.GITCODE_TOKEN }} # 访问仓颉 gitcode 仓库的 token，使用 canary 通道时必须提供
    tool-cache: true # 是否缓存仓颉 SDK
    archive-path: ./cangjie-archive # 可选，下载的压缩包存储路径
```
