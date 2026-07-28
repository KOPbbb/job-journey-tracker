# 求职轨迹

一款可在 Mac 和 Windows 上直接打开的本地求职投递管理工具。它帮助你记录每一次投递、关联使用的简历版本，并按日历查看后续安排。

## 下载与安装（macOS）

1. 前往仓库右侧的 **Releases**，下载最新版的 `job-journey-tracker-*-universal.dmg`。
2. 双击 DMG，把“求职轨迹”拖进“应用程序”文件夹。
3. 首次打开时，如果 macOS 提示无法验证开发者，请在“应用程序”里按住 Control 点击应用，选择“打开”。

`universal` 安装包同时支持 Apple Silicon（M 系列）和 Intel Mac。

## 下载与安装（Windows）

1. 前往仓库右侧的 **Releases**，下载最新版的 `job-journey-tracker-*-setup.exe`。
2. 双击安装程序，按提示选择安装位置后完成安装。
3. 从桌面或开始菜单打开“求职轨迹”。

当前提供 Windows 10/11 64 位安装包。尚未进行 Windows 代码签名时，SmartScreen 可能会提示风险；确认下载来源是本仓库后，可选择“更多信息”再运行。

## 功能

- 记录、搜索和筛选投递机会
- 在投递记录页直接选择日期，只显示当天相关的投递、笔试、面试和跟进提醒
- 用“每日安排”选择某一天，并一键跳到“只看这一天的信息”
- 管理多个 PDF、DOC、DOCX 简历版本，并关联到每次投递
- 使用列表、看板和统计页面梳理进展
- 导出 CSV 或 JSON 投递记录备份

## 隐私与备份

投递记录保存在浏览器的 LocalStorage，上传的简历文件保存在浏览器的 IndexedDB。它们默认不会上传到 GitHub；GitHub 仅用于管理本软件的代码版本。

重要数据请定期在“数据备份”页面导出 JSON，并在“简历版本”页面分别下载保存简历文件。

## 本地运行

```bash
npm install
npm run dev
```

生产构建与检查：

```bash
npm run lint
npm run build
```

构建可发布的 macOS 安装包：

```bash
npm run package:mac
```

构建可发布的 Windows 安装程序：

```bash
npm run package:win
```
