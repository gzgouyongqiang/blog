# -*- coding: utf-8 -*-
"""
把 data.json 同步生成 assets/data.js（本地双击预览用的兜底数据）。

用法（在 blog_repo 目录下）：
    python tools/sync_data.py

为什么需要它：
    线上（https://yonghaihao.ccwu.cc）用 fetch 读 data.json，没问题；
    但本地直接双击 index.html 打开时是 file:// 协议，浏览器禁止 fetch 本地文件，
    页面就一片空白。data.js 把同一份数据内联成一个 <script>，本地也能正常显示。
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "data.json"
DST = ROOT / "assets" / "data.js"

HEAD = (
    "/* 自动生成，请勿手改：源文件是 data.json，运行 tools/sync_data.py 重新生成。\n"
    "   作用：本地直接双击 index.html 时浏览器禁止 fetch 本地文件，用这份内联数据兜底。 */\n"
)


def main():
    if not SRC.exists():
        sys.exit("找不到 data.json：%s" % SRC)
    data = json.loads(SRC.read_text(encoding="utf-8"))
    DST.parent.mkdir(parents=True, exist_ok=True)
    DST.write_text(
        HEAD + "window.__BLOG_DATA__ = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    n = len(data.get("trips", []))
    print("已同步 -> %s（%d 段行程）" % (DST.relative_to(ROOT), n))


if __name__ == "__main__":
    main()
