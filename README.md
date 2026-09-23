# 永好游记

旅行照片与随想的静态博客。
线上地址：**https://yonghaihao.ccwu.cc**

---

## 怎么更新内容（不用写代码）

所有内容都在 **`data.json`** 里，改这个文件就行。

### 加一张照片

1. 把图片放进 `assets/photos/` 文件夹（建议先压缩到 300KB 以内，加载快）
2. 打开 `data.json`，在 `photos` 数组里加一条：

```json
{
  "src": "assets/photos/你的文件名.jpg",
  "place": "📍 地点名",
  "caption": "一句话标题",
  "note": "更长的感想，可留空"
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

---

## 推送上线

改完以后，让 AI 助手推送即可，或手动执行：

```bash
python "C:/Users/Administrator/.workbuddy/skills/git-push-hxbnx/scripts/git_push.py" \
  "C:/Users/Administrator/blog_repo" \
  "更新照片" \
  index.html data.json assets/blog.css assets/blog.js \
  assets/photos/新图片.jpg
```

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
├── data.json               ★ 内容数据（改这里）
├── CNAME                   自定义域名
└── assets/
    ├── blog.css            样式
    ├── blog.js             渲染脚本
    └── photos/             照片存放处
```
