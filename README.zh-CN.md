<div align="center">

[English](readme.md) · **简体中文**

[HRouter](https://hrouter.net/home) · [All public projects](https://github.com/honestTai) · [Star & Fork trends](#project-activity)

</div>

[![Repository summary](https://raw.githubusercontent.com/honestTai/honestTai/main/assets/badges/awesome-lint.svg)](#project-activity)

# Awesome Lint

检查 [Awesome](https://awesome.re) 清单的 Markdown 格式与 Awesome 专用规则，帮助创建和维护规范的资源清单。

> **上游 Fork：**本仓库是 [sindresorhus/awesome-lint](https://github.com/sindresorhus/awesome-lint) 的 Fork，不是 honestTai 原创的 Linter。完整上游文档和署名保留在 [English](readme.md)。

![检查结果示例](media/screenshot.png)

## 快速使用

需要 Node.js 和 Git。在命令后传入待检查的仓库地址：

```bash
npx awesome-lint https://github.com/sindresorhus/awesome-something
```

规则由 [通用 Markdown 配置](config.js) 与 [Awesome 专用规则](rules) 组成。

## 规则控制

可以使用 Markdown 注释控制检查规则：

- `<!--lint disable awesome-list-item-->`：停用指定规则。
- `<!--lint enable awesome-list-item-->`：重新启用规则。
- `<!--lint ignore awesome-list-item-->`：只忽略下一个节点。

规则名称末尾不要多留空格。完整示例、GitHub Actions、pre-commit 和程序化 API 见 [英文文档](readme.md)。

## 程序化使用

```bash
npm install awesome-lint
```

参阅 [API 文档](readme.md#api)。使用与贡献时请保留原项目的许可证和署名。

---

<a id="project-activity"></a>

## 项目动态 · Project activity

当前 Star / Fork 数量与留存事件历史，计划每日更新。

[![Star and Fork history for awesome-lint](https://raw.githubusercontent.com/honestTai/honestTai/main/assets/metrics/awesome-lint.svg)](https://github.com/honestTai/honestTai/blob/main/data/README.md)

[每日实测趋势](https://raw.githubusercontent.com/honestTai/honestTai/main/assets/metrics/awesome-lint-daily.svg) · [数据口径](https://github.com/honestTai/honestTai/blob/main/data/METHODOLOGY.zh-CN.md) · [全部公开项目](https://github.com/honestTai)

<sub>历史曲线仅重建当前仍保留的 Star 与可见 Fork，并非过去每日净总量。每日实测总量自 2026-10-06 开始，不伪造回填。</sub>
