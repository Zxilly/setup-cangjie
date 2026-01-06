# Setup-Cangjie

[![Tests](https://github.com/Zxilly/setup-cangjie/actions/workflows/test.yml/badge.svg)](https://github.com/Zxilly/setup-cangjie/actions/workflows/test.yml)
[![CodeQL](https://github.com/Zxilly/setup-cangjie/actions/workflows/codeql.yml/badge.svg)](https://github.com/Zxilly/setup-cangjie/actions/workflows/codeql.yml)

在 GitHub Actions 安装仓颉编译环境。

## 使用方法

支持安装 LTS、STS 和 Nightly 版本。

### 参数说明

| 参数         | 说明                                                                                                 | 是否必需 | 默认值 |
| ------------ | ---------------------------------------------------------------------------------------------------- | -------- | ------ |
| channel      | 需要安装的仓颉版本通道，例如 lts, sts, nightly                                                       | 否       | lts    |
| version      | 需要安装的仓颉版本，例如 1.0.0，latest 表示最新版，auto 表示优先从 cjpm.toml 获取版本，否则为 latest。nightly 通道需要指定完整版本号 | 否       | auto   |
| archive-path | 下载的 .zip/.tar.gz 文件的存储路径                                                                   | 否       |        |

### 输出

| 输出名  | 说明           |
| ------- | -------------- |
| version | 安装的仓颉版本 |

### 示例

```yaml
- uses: Zxilly/setup-cangjie@v2
  with:
    channel: lts # 'lts', 'sts' 或者 'nightly'
    version: 1.0.0 # 需要安装的仓颉版本，latest 表示最新版，auto 表示自动获取
    archive-path: ./cangjie-archive # 可选，下载的压缩包存储路径
```

#### Nightly 版本

```yaml
- uses: Zxilly/setup-cangjie@v2
  with:
    channel: nightly
    version: 1.1.0-alpha.20260106020001 # nightly 需要指定完整版本号
```
