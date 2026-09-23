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

  /* ---------- 灯箱 ---------- */
  var lb    = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightboxImg');
  var lbCap = document.getElementById('lightboxCap');

  function openLightbox(src, cap) {
    if (!lb) return;
    lbImg.src = src;
    lbImg.alt = cap || '';
    lbCap.textContent = cap || '';
    lb.classList.add('on');
  }
  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove('on');
    lbImg.src = '';
  }
  if (lb) {
    lb.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ============================================
     首页：年份时间轴
     ============================================ */
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

    var years = Object.keys(byYear).sort(function (a, b) { return b - a; });
    var html = '';

    years.forEach(function (y) {
      var list = byYear[y].slice().sort(function (a, b) {
        return String(b.date || '').localeCompare(String(a.date || ''));
      });

      html +=
        '<div class="year-block">' +
          '<div class="year-line">' +
            '<div class="year-num">' + esc(y) + '</div>' +
            '<div class="year-rule"></div>' +
            '<div class="year-count">' + list.length + ' 段行程</div>' +
          '</div>' +
          '<div class="trip-list">';

      list.forEach(function (t) {
        var intro = (t.lead && t.lead.length) ? t.lead[0] : '';
        html +=
          '<a class="trip-card" href="trip.html?id=' + encodeURIComponent(t.id) + '">' +
            '<div class="trip-cover"><img src="' + esc(t.cover) + '" alt="" loading="lazy"></div>' +
            '<div class="trip-body">' +
              '<div class="trip-date">' + esc(t.dateShort || t.date || '') + '</div>' +
              '<div class="trip-title">' + esc(t.title || '') + '</div>' +
              (t.subtitle ? '<div class="trip-sub">' + esc(t.subtitle) + '</div>' : '') +
              (intro ? '<div class="trip-intro">' + esc(intro) + '</div>' : '') +
              '<div class="trip-more">走进这段行程</div>' +
            '</div>' +
          '</a>';
      });

      html += '</div></div>';
    });

    timeline.innerHTML = html;
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

    var cover = document.getElementById('tCover');
    if (cover) { cover.src = t.cover || ''; cover.alt = t.title || ''; }

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
          var p = photos[parseInt(box.dataset.idx, 10)];
          openLightbox(p.src, p.caption);
        });
      });
    }

    /* --- 上一段 / 下一段（数组按新→旧） --- */
    var prev = idx + 1 < trips.length ? trips[idx + 1] : null;
    var next = idx - 1 >= 0 ? trips[idx - 1] : null;
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
  fetch('data.json?v=' + Date.now())
    .then(function (r) {
      if (!r.ok) throw new Error('读取失败 (' + r.status + ')');
      return r.json();
    })
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
