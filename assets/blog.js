/* ============================================================
   山高路远，家在身边 — 渲染脚本
   内容全部来自 data.json，改 JSON 即可更新
   同一份脚本同时服务：首页(index.html) 与 行程页(trip.html)

   照片版式（photos[].layout）：
     full    全宽          center  居中（8/12）
     narrow  窄居中（6/12） left    偏左（8/12）
     right   偏右（8/12）   aside   图文并排
     duo     与下一张并排（两张都写 duo）
   ============================================================ */

(function () {
  'use strict';

  var timeline = document.getElementById('timeline');
  var flow     = document.getElementById('flow');

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function param(name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }
  function empty(mark, text) {
    return '<div class="empty"><div class="empty-mark">' + esc(mark) + '</div>' + esc(text) + '</div>';
  }

  /* ---------- 灯箱（支持键盘翻页 + 切换动画） ---------- */
  var lb      = document.getElementById('lightbox');
  var lbImg   = document.getElementById('lightboxImg');
  var lbCap   = document.getElementById('lbCap');
  var lbNote  = document.getElementById('lbNote');
  var lbDate  = document.getElementById('lbDate');
  var lbPrev  = document.getElementById('lbPrev');
  var lbNext  = document.getElementById('lbNext');
  var lbClose = document.getElementById('lbClose');
  var lbList = null, lbIdx = -1, lbDateText = '';

  function lbRender() {
    if (!lbList || lbIdx < 0) return;
    var p = lbList[lbIdx];
    lbImg.classList.add('switching');
    var im = new Image();
    im.onload = function () {
      lbImg.src = p.src;
      lbImg.alt = p.caption || '';
      lbImg.classList.remove('switching');
    };
    im.src = p.src;
    lbCap.textContent  = p.caption || '';
    lbNote.textContent = p.note || '';
    lbDate.textContent = lbDateText ? (lbDateText + ' · ' + String(lbIdx + 1).padStart(2, '0') + ' / ' + String(lbList.length).padStart(2, '0')) : '';
    if (lbPrev) lbPrev.classList.toggle('hide', lbIdx <= 0);
    if (lbNext) lbNext.classList.toggle('hide', lbIdx >= lbList.length - 1);
  }
  function openLightbox(photos, idx, dateText) {
    if (!lb) return;
    lbList = photos; lbIdx = idx; lbDateText = dateText || '';
    lbRender();
    lb.classList.add('on');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove('on');
    lbImg.src = '';
    lbList = null; lbIdx = -1;
    document.body.style.overflow = '';
  }
  function lbStep(d) {
    if (!lbList) return;
    var n = lbIdx + d;
    if (n < 0 || n >= lbList.length) return;
    lbIdx = n;
    lbRender();
  }
  if (lb) {
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target === lbImg) closeLightbox();
    });
    lbClose && lbClose.addEventListener('click', closeLightbox);
    lbPrev && lbPrev.addEventListener('click', function (e) { e.stopPropagation(); lbStep(-1); });
    lbNext && lbNext.addEventListener('click', function (e) { e.stopPropagation(); lbStep(1); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') lbStep(-1);
      else if (e.key === 'ArrowRight') lbStep(1);
    });
  }

  /* ============================================
     首页：胶片长卷（横向滚筒）
     ============================================ */
  function cardHTML(t) {
    var intro = (t.lead && t.lead.length) ? t.lead[0] : '';
    return '<a class="trip-card" href="trip.html?id=' + encodeURIComponent(t.id) + '" draggable="false">' +
      '<div class="trip-cover"><img src="' + esc(t.cover) + '" alt="" loading="lazy" draggable="false"></div>' +
      '<div class="trip-body">' +
        '<div class="trip-date">' + esc(t.dateShort || t.date || '') + '</div>' +
        '<div class="trip-title">' + esc(t.title || '') + '</div>' +
        (t.subtitle ? '<div class="trip-sub">' + esc(t.subtitle) + '</div>' : '') +
        (intro ? '<div class="trip-intro">' + esc(intro) + '</div>' : '') +
        '<div class="trip-more">走进这段行程</div>' +
      '</div>' +
    '</a>';
  }

  function renderTimeline(trips) {
    if (!trips || !trips.length) {
      timeline.innerHTML = empty('— — —', '相册正在整理中');
      return;
    }

    var byYear = {};
    trips.forEach(function (t) {
      var y = String(t.year || '未标注');
      (byYear[y] = byYear[y] || []).push(t);
    });

    /* 年份从早到晚：这是一本家庭史，从第一次出门开始往后读 */
    var years = Object.keys(byYear).sort(function (a, b) { return a - b; });
    var html = '';

    years.forEach(function (y) {
      var list = byYear[y].slice().sort(function (a, b) {
        return String(a.date || '').localeCompare(String(b.date || ''));
      });

      html +=
        '<div class="era" data-year="' + esc(y) + '">' +
          '<div class="era-year">' + esc(y) + '</div>' +
          '<div class="era-count">' + list.length + ' 段</div>' +
        '</div>';
      list.forEach(function (t) { html += cardHTML(t); });
    });

    timeline.innerHTML = html;
    setupReel();

    /* 总览时间线：年份速达 + 当前可视年份高亮 */
    var line = document.getElementById('erasLine');
    if (line) {
      var eras = timeline.querySelectorAll('.era');
      var btns = {};
      eras.forEach(function (era) {
        var y = era.dataset.year;
        var b = document.createElement('button');
        b.textContent = y;
        b.addEventListener('click', function () {
          timeline.scrollTo({ left: era.offsetLeft - 20, behavior: 'smooth' });
        });
        btns[y] = b;
        line.appendChild(b);
      });
      /* 滚动时高亮当前年份 */
      var curYear = null;
      timeline.addEventListener('scroll', function () {
        var x = timeline.scrollLeft + 60;
        var y = null;
        eras.forEach(function (era) {
          if (era.offsetLeft <= x) y = era.dataset.year;
        });
        if (y && y !== curYear) {
          curYear = y;
          Object.keys(btns).forEach(function (k) { btns[k].classList.toggle('cur', k === y); });
        }
      }, { passive: true });
    }
  }

  /* 长卷交互：滚轮映射横向 / 鼠标拖拽 / 箭头 / 进度条 */
  function setupReel() {
    var reel = timeline;
    if (!reel || reel.dataset.reelBound) return;
    reel.dataset.reelBound = '1';

    /* 滚轮：竖向滚轮量映射为横向滚动；到卷头卷尾时放行页面滚动 */
    reel.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; /* 触控板横滑走原生 */
      var max = reel.scrollWidth - reel.clientWidth;
      if (max <= 0) return;
      var going = e.deltaY > 0 ? 1 : -1;
      var canGo = (going > 0 && reel.scrollLeft < max - 1) ||
                  (going < 0 && reel.scrollLeft > 1);
      if (!canGo) return; /* 到头了，放行页面滚动 */
      e.preventDefault();
      reel.scrollLeft += e.deltaY;
    }, { passive: false });

    /* 鼠标拖拽（触屏用原生滑动）
       注意：pointerdown 时不能立刻 setPointerCapture，
       否则 click 会被重定向到容器、卡片链接失效；
       只在真正拖动超过阈值后才 capture。 */
    var down = false, sx = 0, sl = 0, moved = false;
    reel.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false;
      sx = e.clientX; sl = reel.scrollLeft;
    });
    reel.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        reel.classList.add('dragging');
        try { reel.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
      }
      if (moved) reel.scrollLeft = sl - dx;
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      reel.addEventListener(ev, function () {
        down = false;
        reel.classList.remove('dragging');
      });
    });
    /* 拖拽结束的那一下不触发卡片跳转 */
    reel.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);

    /* 箭头 */
    var prev = document.getElementById('reelPrev');
    var next = document.getElementById('reelNext');
    if (prev) prev.addEventListener('click', function () { reel.scrollBy({ left: -700, behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { reel.scrollBy({ left: 700, behavior: 'smooth' }); });

    /* 进度条 + 箭头淡出 */
    var bar = document.getElementById('reelBar');
    function upd() {
      var max = reel.scrollWidth - reel.clientWidth;
      var r = max > 0 ? reel.scrollLeft / max : 0;
      if (bar) bar.style.width = (8 + r * 92) + '%';
      if (prev) prev.style.opacity = (max > 0 && reel.scrollLeft > 4) ? 1 : .3;
      if (next) next.style.opacity = (max > 0 && reel.scrollLeft < max - 4) ? 1 : .3;
    }
    reel.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }

  function renderStats(trips) {
    var photos = 0, places = {};
    (trips || []).forEach(function (t) {
      photos += (t.photos || []).length;
      if (t.place) places[t.place] = 1;
    });
    countUp('statTrips',  (trips || []).length);
    countUp('statPhotos', photos);
    countUp('statPlaces', Object.keys(places).length);
  }

  function countUp(id, val) {
    var el = document.getElementById(id);
    if (!el) return;
    if (!val) { el.textContent = '0'; return; }
    var n = 0;
    var step = Math.max(1, Math.ceil(val / 16));
    el.textContent = '0';
    var timer = setInterval(function () {
      n += step;
      if (n >= val) { n = val; clearInterval(timer); }
      el.textContent = n;
    }, 40);
  }

  /* ============================================
     行程详情页
     ============================================ */

  /* 单张照片的 HTML */
  function figureHTML(p, i) {
    var cls = 'flow-item';
    if (p.orient === 'portrait') cls += ' is-portrait';

    return '<figure class="' + cls + '">' +
      '<div class="flow-pic" data-idx="' + i + '">' +
        '<img src="' + esc(p.src) + '" alt="' + esc(p.caption || '') + '" loading="lazy">' +
      '</div>' +
      '<figcaption class="flow-cap">' +
        '<div class="flow-cap-head">' +
          '<span class="flow-cap-no">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<span class="flow-cap-main">' + esc(p.caption || '') + '</span>' +
        '</div>' +
        (p.note ? '<div class="flow-cap-note">' + esc(p.note) + '</div>' : '') +
      '</figcaption>' +
    '</figure>';
  }

  var LAYOUT_CLASS = {
    hero:   'f-hero',
    full:   'f-full',
    center: 'f-center',
    narrow: 'f-narrow',
    left:   'f-left',
    right:  'f-right'
  };

  /* 照片流：按 layout 编排 */
  function renderFlow(photos) {
    var h = '', i = 0;

    while (i < photos.length) {
      var p    = photos[i];
      var lay  = p.layout || 'full';
      var next = photos[i + 1];

      /* 两张并排 */
      if (lay === 'duo' && next && (next.layout || 'full') === 'duo') {
        h += '<div class="f-duo">' + figureHTML(p, i) + figureHTML(next, i + 1) + '</div>';
        i += 2;
        continue;
      }
      /* 图文并排 */
      if (lay === 'aside') {
        h += '<div class="f-aside">' + figureHTML(p, i) + '</div>';
        i += 1;
        continue;
      }
      /* 单张 */
      h += '<div class="' + (LAYOUT_CLASS[lay] || 'f-full') + '">' + figureHTML(p, i) + '</div>';
      i += 1;
    }
    return h;
  }

  function renderTrip(data, id) {
    var trips = data.trips || [];
    var idx = -1;
    trips.forEach(function (t, i) { if (t.id === id) idx = i; });

    if (idx < 0) {
      document.getElementById('flow').innerHTML = empty('！', '没有找到这段行程');
      return;
    }

    var t = trips[idx];
    document.title = (t.title || '行程') + ' · 山高路远，家在身边';

    /* 开篇：编号 + 大年份 */
    var noEl = document.getElementById('tNo');
    var yrEl = document.getElementById('tYear');
    if (noEl) noEl.textContent = 'No.' + String(idx + 1).padStart(2, '0') + ' — ' + String(trips.length).padStart(2, '0');
    if (yrEl) yrEl.textContent = t.year || '';

    var cover = document.getElementById('tCover');
    if (cover) { cover.src = t.coverBig || t.cover || ''; cover.alt = t.title || ''; }

    document.getElementById('tDate').textContent  = t.date || '';
    document.getElementById('tTitle').textContent = t.title || '';
    document.getElementById('tPlace').textContent = (t.place ? t.place + '　' : '') + (t.subtitle || '');

    var leadEl = document.getElementById('tLead');
    leadEl.innerHTML = (t.lead || []).map(function (p) {
      return '<p>' + esc(p) + '</p>';
    }).join('');

    /* --- 照片流 --- */
    var photos = t.photos || [];
    if (!photos.length) {
      flow.innerHTML = empty('— — —', '这段行程还没有照片');
    } else {
      flow.innerHTML = renderFlow(photos);

      flow.querySelectorAll('.flow-pic').forEach(function (box) {
        box.addEventListener('click', function () {
          var i = parseInt(box.dataset.idx, 10);
          openLightbox(photos, i, t.date || '');
        });
      });

      /* 照片进入视口时淡入上浮 */
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add('seen');
              io.unobserve(en.target);
            }
          });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
        flow.querySelectorAll('.flow-item').forEach(function (el) { io.observe(el); });
      } else {
        flow.querySelectorAll('.flow-item').forEach(function (el) { el.classList.add('seen'); });
      }
    }

    /* --- 下一段预览卡 --- */
    var next = idx + 1 < trips.length ? trips[idx + 1] : null;
    var nt = document.getElementById('nextTrip');
    if (nt) {
      nt.innerHTML = next
        ? '<a href="trip.html?id=' + encodeURIComponent(next.id) + '">' +
            '<div class="nt-pic"><img src="' + esc(next.cover || '') + '" alt="" loading="lazy"></div>' +
            '<div class="nt-body">' +
              '<div class="nt-label">Next Journey</div>' +
              '<div class="nt-title">' + esc(next.title || '') + '</div>' +
              '<div class="nt-date">' + esc(next.date || '') + (next.place ? '　' + esc(next.place) : '') + '</div>' +
              '<div class="nt-more">翻开下一段</div>' +
            '</div>' +
          '</a>'
        : '';
    }

    /* --- 上一段 / 下一段（数组按时间从早到晚） --- */
    var prev = idx - 1 >= 0 ? trips[idx - 1] : null;
    var parts = [];
    parts.push(prev
      ? '<a href="trip.html?id=' + encodeURIComponent(prev.id) + '">← ' + esc(prev.title) + '</a>'
      : '<span class="dim">← 已是第一段</span>');
    parts.push('<a href="index.html#albums">回到相册</a>');
    parts.push(next
      ? '<a href="trip.html?id=' + encodeURIComponent(next.id) + '">' + esc(next.title) + ' →</a>'
      : '<span class="dim">已是最后一段 →</span>');
    document.getElementById('tripEnd').innerHTML = parts.join('');

    var hero = document.querySelector('.trip-hero');
    if (hero) hero.classList.add('fade-in');
  }

  /* ============================================
     启动
     ============================================ */
  /* 取数据：线上优先读 data.json（改了立刻生效）；
     本地双击打开时 file:// 禁止 fetch，自动回落到 assets/data.js 内联数据。 */
  function loadData() {
    /* 本地双击打开是 file:// 协议，浏览器直接禁止 fetch 本地文件，
       干脆不发这个请求，免得控制台一片红 —— 直接用内联数据。 */
    if (location.protocol === 'file:' && window.__BLOG_DATA__) {
      return Promise.resolve(window.__BLOG_DATA__);
    }
    return fetch('data.json?v=' + Date.now())
      .then(function (r) {
        if (!r.ok) throw new Error('读取失败 (' + r.status + ')');
        return r.json();
      })
      .catch(function (err) {
        if (window.__BLOG_DATA__) {
          console.warn('data.json 读取失败，改用本地内联数据：' + err.message);
          return window.__BLOG_DATA__;
        }
        throw err;
      });
  }

  loadData()
    .then(function (data) {
      if (timeline) {
        renderTimeline(data.trips);
        renderStats(data.trips);
      }
      if (flow) {
        renderTrip(data, param('id'));
      }
    })
    .catch(function (err) {
      console.error(err);
      var box = timeline || flow;
      if (box) box.innerHTML = empty('！', '内容加载失败：' + err.message);
    });

})();
