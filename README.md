# 山高路远，家在身边

一家人的旅行记录 — 照片与随想。
线上地址：**https://yonghaihao.ccwu.cc**

---

## 怎么更新内容（不用写代码）

所有内容都在 **`data.json`** 里，改这个文件就行。

### 加一张照片

1. 把图片放进 `assets/photos/` 文件夹
   - 建议宽度 1600px 以内、压缩到 400KB 以下，加载更快
   - 手机拍的照片直接用也行，稍大一点无妨
2. 打开 `data.json`，在 `photos` 数组里加一条：

```json
{
  "src": "assets/photos/你的文件名.jpg",
  "place": "地点名",
  "caption": "照片标题",
  "note": "想说的话，可留空"
}
```

### 加一条随想

在 `data.json` 的 `notes` 数组里加一条：

```json
{
  "date": "2026-09-23",
  "text": "想说的话"
}
```

> 随想按时间倒序显示，最新的在最上面。

### 改完推送

```bash
cd C:\Users\Administrator\blog_repo
git add -A
git commit -m "更新照片"
git push origin main
```

或者直接跟小烧杯说「推送到博客」。

---

## 技术信息

| 项 | 值 |
|---|---|
| 仓库 | https://github.com/gzgouyongqiang/blog |
| 本地路径 | `C:\Users\Administrator\blog_repo` |
| 托管 | GitHub Pages（main 分支根目录） |
| 域名 | `yonghaihao.ccwu.cc`（DNSHE，有效期至 2036） |
| DNS | CNAME → `gzgouyongqiang.github.io` |

## 文件结构

```
blog_repo/
├── index.html              页面结构
├── data.json               ★ 内容数据（只改这里）
├── CNAME                   自定义域名
├── README.md               本说明
└── assets/
    ├── blog.css            日系胶片感样式
    ├── blog.js             渲染脚本
    └── photos/             照片存放处
```

## 设计说明

- **风格**：日系胶片感 — 米白纸底、大留白、细衬线标题、照片轻微降饱和暖调
- **标题**：《山高路远，家在身边》
- **定位**：完全公开，任何人可访问
