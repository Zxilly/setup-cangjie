# Setup-Cangjie

在 GitHub Actions 安装仓颉编译环境。

## 使用方法

仓颉尚未广泛可用，因此需要提供一个令牌以下载。

```yaml
- uses: actions/setup-cangjie@v1
  with:
    token: ${{ secrets.GITCODE_TOKEN }}
```
