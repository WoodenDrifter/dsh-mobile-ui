# dsh-mobile-ui

DeepSeek Harness (dsh) Web UI 的移动端界面插件。由deepseek v4.1flash倾情打造

## 功能

在 **设置 → 通用** 里增加一个「界面布局」开关（两个按钮：**桌面** / **移动**）：

- **桌面** — 设置面板保持 dsh 原有的两栏布局（左侧分类 + 右侧内容）。
- **移动** — 把设置面板重排为适合手机的布局：
  - 左侧分类变成**顶部横向滑动条**；
  - 内容区**铺满下方全宽**；
  - 面板**全屏铺满**，不再被 188px 固定左栏挤压（这正是手机端右侧调节项文字拥挤的原因）。

偏好存在浏览器 `localStorage`（键 `dsh.settingsLayout.mode`），因此：

- 在 Cloudflare 隧道等**非回环**地址下同样生效（dsh 在该场景禁用 Host 端设置持久化）；
- 每个浏览器各自独立。

纯手动切换，不做视口自动判定。

## 安装

把本目录作为本地 bundle 安装到当前 dsh profile：

```bash
dsh plugin install <本目录绝对路径>
```

或在 dsh 会话里让 Agent 用 `plugin_manager` 的 `install_bundle` 安装（target = 本目录绝对路径）。

安装后刷新页面，在 **设置 → 通用** 找到「界面布局」。

## 文件

| 文件 | 作用 |
|---|---|
| `package.json` | bundle 清单 + `dsh.client` 客户端声明 |
| `cordis.patch.yml` | 向 profile 插入插件行 |
| `index.js` | Host 半（空实现） |
| `client.js` | 偏好行 UI + 设置面板重排 CSS |
| `locale/en.json`、`locale/zh.json` | 插件卡片文案 |
| `icon.svg` | 插件图标 |

## 实现说明

- 通过 `settings.general.item` 插槽贡献一行偏好；控件照抄 dsh `SegmentedControl` 的样式与行为（类名前缀 `dshslm_`，只引用 `--dsw-*` 主题 token，不 import 任何 dsh client 包）。
- 移动模式给 `<html>` 加 `data-dsh-layout="mobile"`，配合一段全局 CSS 重排设置面板。
- 重排用的 `.VOzbGW_*` 是 `@deepseek-ai/dsh-client-ui-settings-general` 的 CSS-module 哈希类名，**与 dsh 版本绑定**。

## 已知限制

- `.VOzbGW_*` 哈希类名在 dsh 升级后可能变化，届时重排会失效，需要重新 pin 选择器（见 `client.js` 顶部的 `REFLOW_CSS`）。
- 设置面板的分类选择是 dsh shell 内部状态、没有对外 API，因此这里用 CSS 重排复用 dsh 自带逻辑，而不是接管渲染。

## License

[MIT](LICENSE)
