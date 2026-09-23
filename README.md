# 山高路远，家在身边

一家人的生活记录 — 相册。
线上地址：**https://yonghaihao.ccwu.cc**

---

## 页面结构

```
首页 index.html          年份时间轴 → 每段行程一张卡片
  └─ 点卡片进入
行程页 trip.html?id=xxx   一段行程的完整相册（多版式照片流 + 配文）
```

---

## 怎么更新内容（不用写代码）

所有内容都在 **`data.json`** 里。

> ⚠️ **改完 data.json 记得同步一份给本地预览用**：
> ```bash
> cd C:\Users\Administrator\blog_repo
> python tools/sync_data.py
> ```
> 这一步生成 `assets/data.js`。原因是：本地双击 `index.html` 时浏览器是 `file://` 协议，
> 禁止网页读取本地 `data.json`，页面会一片空白（照片全不显示）；`data.js` 是同一份数据的内联版，专门兜底。
> 线上（https）不受影响，永远优先读 `data.json`。

### 本地预览

双击 `index.html` 即可看效果。若照片不显示，说明忘了跑上面的 `sync_data.py`。

### 加一段行程

**第 1 步：准备照片**

在 `assets/photos/` 下新建文件夹（用行程 id 命名，如 `meizhou2020/`），再建 `t/` 放缩略图：

```
assets/photos/meizhou2020/
├── 01.jpg … 12.jpg     大图（长边 1800）
└── t/01.jpg … t/12.jpg  缩略图（长边 700，首页卡片用）
```

**第 2 步：写进 data.json**

在 `trips` 数组里加一条：

```json
{
  "id": "meizhou2020",
  "year": "2020",
  "date": "2020.01.22 — 01.29",
  "dateShort": "01.22 — 01.29",
  "place": "梅州 · 漳州",
  "title": "围龙屋与海",
  "subtitle": "梅州 · 围龙屋　→　漳州 · 海",
  "cover": "assets/photos/meizhou2020/t/10.jpg",
  "coverBig": "assets/photos/meizhou2020/10.jpg",
  "lead": ["第一段导语。", "第二段导语。"],
  "photos": [
    {
      "src": "assets/photos/meizhou2020/01.jpg",
      "thumb": "assets/photos/meizhou2020/t/01.jpg",
      "orient": "portrait",
      "layout": "aside",
      "caption": "照片标题",
      "note": "照片下面想说的话"
    }
  ]
}
```

### 字段说明

| 字段 | 作用 |
|---|---|
| `id` | 唯一标识，决定网址 `trip.html?id=` |
| `year` | 首页时间轴按它分组 |
| `cover` | 首页卡片封面，用 `t/` 里的缩略图 |
| `coverBig` | 行程页顶部大图，用**大图**（用缩略图会被拉开发虚） |
| `lead` | 行程页导语，数组，每项一段 |
| `orient` | 朝向：`portrait` 竖（限高居中）/ `landscape` 横 / `wide` 宽幅 |
| `layout` | **版式**，见下表 ★ |

---

## 照片版式系统 ★

行程页是 **12 列栅格**，每张照片通过 `layout` 决定排版，交替使用才不会呆板。

| layout | 占位 | 适合 |
|---|---|---|
| `full` | 全宽（12 列） | 横图、宽幅、压轴 |
| `center` | 居中（8 列） | 横图重点，两侧留白 |
| `narrow` | 窄居中（6 列） | 竖图、单张小品 |
| `left` | 偏左（8 列） | 与下一张错开 |
| `right` | 偏右（8 列） | 与上一张错开 |
| `aside` | 全宽内分栏（图 7 + 文 4） | 竖图 + 长配文，像相册的左图右记 |
| `duo` | 与**下一张**并排（各半宽） | 两张成对；**连续两张都要写 `duo`** |

**编排建议**：不要连着用同一种版式。一段行程 10–12 张，按下面的节奏交替最耐看：

```
aside → narrow → duo → full → center → full → duo → right → left → full
```

---

## 照片处理流水线 ★

脚本：`_grade.py`（美化核心）+ `_export2.py`（导出）

**三步**：

1. **方向转正** — `ImageOps.exif_transpose()`。相机原图带旋转标记，不转会上网后横躺。**必须从原图读**（二次压缩的图已丢 EXIF）。
2. **温和调色**（`grade(im, strength=0.6)`）
   - 自动色阶（各裁 0.3% 极值）
   - 亮度 +1.2%、对比 +4.2%、饱和 +7.8%
   - 分通道曲线：红提暗部、蓝压暗部 → 胶片暖调 + 柔和 S 形
   - ⚠️ **strength 别超过 0.7**，到 1.0 绿植会发荧光，很假
3. **保守裁剪**（`crop_to(im, ratio, focus, max_loss=0.12)`）
   - 只裁竖图到 4:5、横图到 3:2、宽幅到 16:9
   - **裁切量超过 12% 就放弃**，保住原貌（裁掉主体比不裁糟）

**输出**：大图长边 1800 / q86，缩略图长边 700 / q82。一段 12 张约 4–5 MB。

---

## 改完推送

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
├── trip.html                 行程页（读 ?id= 参数）
├── data.json                 ★ 内容数据（只改这里）
├── tools/
│   └── sync_data.py          把 data.json 同步成 assets/data.js（本地预览兜底）
├── CNAME                     自定义域名
├── README.md                 本说明
└── assets/
    ├── blog.css              日系胶片感样式（含 12 列版式系统）
    ├── blog.js               渲染脚本（首页 + 行程页共用）
    ├── data.js               自动生成，勿手改（本地 file:// 预览用）
    └── photos/
        └── <行程id>/          每段行程一个文件夹
            ├── 01.jpg …      大图（长边 1800）
            └── t/01.jpg …    缩略图（长边 700）
```

## 设计说明

- **风格**：日系胶片感 — 米白纸底（`#f7f5f0`）、大留白、细衬线标题、照片暖调
- **标题**：《山高路远，家在身边》
- **定位**：一家人的生活片段。老家在远处，日子在路上 —— 日常生活也像一段行程
- **选片原则**：**以人物为主**。纯风景少选，或只作点缀
- **公开性**：完全公开（内容无隐私顾虑）

## 照片处理备忘

- 相机原图普遍带 **EXIF Orientation 旋转标记**，导出时必须 `ImageOps.exif_transpose()` 转正。
- 早期照片的 EXIF 时间可能是**相机没设日期的假时间**（如 `2002:01:01 00:00:xx`），遇到这种要以文件夹名/人工判断为准。
- 地点线索优先级：① 你自己命名的文件（如 `赛里木湖.jpg`）② 画面里的匾额招牌 ③ 文件夹名 ④ EXIF 时间聚类。
- **文件夹名不可全信**：`2004年10月海陵岛` 里混着 2002–2005 年、6 台相机的照片，是多次出游混装的。
