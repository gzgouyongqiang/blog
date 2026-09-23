# 山高路远，家在身边

一家人的旅行记录 — 相册与随想。
线上地址：**https://yonghaihao.ccwu.cc**

---

## 页面结构

```
首页 index.html          年份时间轴 → 每次行程一张卡片
  └─ 点卡片进入
行程页 trip.html?id=xxx   一次行程的完整相册（照片流 + 配文）
```

---

## 怎么更新内容（不用写代码）

所有内容都在 **`data.json`** 里。

### 加一次行程

**第 1 步：准备照片**

在 `assets/photos/` 下新建一个文件夹，用行程 id 命名，例如 `assets/photos/xinjiang2019/`。
每张照片建议：

| 项 | 建议值 |
|---|---|
| 长边 | 1600px |
| 体积 | 600KB 以内 |
| 格式 | JPEG |

再建一个 `t/` 子文件夹放缩略图（长边 700px），首页卡片用，能明显加快首屏。

> 这一步可以交给我做——把照片给我，我批量压缩并纠正相机方向（EXIF Orientation）。

**第 2 步：写进 data.json**

在 `trips` 数组里加一条：

```json
{
  "id": "xinjiang2019",
  "year": "2019",
  "date": "2019.06.13 — 06.15",
  "dateShort": "06.13 — 06.15",
  "place": "新疆",
  "title": "六月的绿",
  "subtitle": "天山天池 · 那拉提草原 · 赛里木湖",
  "cover": "assets/photos/xinjiang2019/t/10.jpg",
  "lead": [
    "第一段导语。",
    "第二段导语。"
  ],
  "photos": [
    {
      "src": "assets/photos/xinjiang2019/01.jpg",
      "thumb": "assets/photos/xinjiang2019/t/01.jpg",
      "orient": "portrait",
      "caption": "照片标题",
      "note": "照片下面想说的话，可留空"
    }
  ]
}
```

**字段说明**

| 字段 | 作用 |
|---|---|
| `id` | 唯一标识，决定网址 `trip.html?id=` |
| `year` | 首页时间轴按它分组 |
| `cover` | 首页卡片封面图，建议用缩略图（`t/` 里的） |
| `lead` | 行程页的导语，数组，每个元素一段 |
| `orient` | 照片朝向：`portrait` 竖图（限宽居中）/ `landscape` 横图 / `square` 方图 |
| `photos[].thumb` | 缩略图，当前版本未使用，留着备用 |

### 加一条随想

在 `notes` 数组里加：

```json
{ "date": "2026-09-23", "text": "想说的话" }
```

> 按时间倒序显示，最新的在最上面。当前为空，首页会显示占位提示。

### 改完推送

```bash
cd C:\Users\Administrator\blog_repo
git add -A
git commit -m "更新相册"
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
| 域名 | `yonghaihao.ccwu.cc`（DNSHE 免费二级域名，有效期至 2036-09-23） |
| DNS | CNAME `@` → `gzgouyongqiang.github.io` |

## 文件结构

```
blog_repo/
├── index.html                首页（年份时间轴）
├── trip.html                 行程详情页（读 ?id= 参数）
├── data.json                 ★ 内容数据（只改这里）
├── CNAME                     自定义域名
├── README.md                 本说明
└── assets/
    ├── blog.css              日系胶片感样式
    ├── blog.js               渲染脚本（首页 + 行程页共用）
    └── photos/
        └── xinjiang2019/     每次行程一个文件夹
            ├── 01.jpg …      大图（长边 1600）
            └── t/01.jpg …    缩略图（长边 700）
```

## 设计说明

- **风格**：日系胶片感 — 米白纸底（`#f7f5f0`）、大留白、细衬线标题、照片轻微暖调
- **标题**：《山高路远，家在身边》
- **定位**：完全公开（内容无隐私顾虑）

## 照片处理备忘

- 相机原图普遍带 **EXIF Orientation 旋转标记**，直接上网会变成横躺的。导出时必须用 `ImageOps.exif_transpose()` 转正。
- 早期照片的 EXIF 时间可能是**相机没设日期的假时间**（如 `2002:01:01 00:00:xx`），遇到这种要以文件夹名/人工判断为准。
- 地点线索优先看：① 你自己命名的文件（如 `赛里木湖.jpg`）② 文件夹名 ③ EXIF 时间聚类。
