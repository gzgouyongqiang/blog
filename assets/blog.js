/* ===== 永好游记 — 渲染脚本 ===== */
/* 数据来自同目录下的 data.json，改 JSON 即可更新页面，无需动 HTML */

(function () {
  'use strict';

  var grid = document.getElementById('photoGrid');
  var noteList = document.getElementById('noteList');
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');

  /* ---------- 灯箱 ---------- */
  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('on');
  }
  function closeLightbox() {
    lightbox.classList.remove('on');
    lightboxImg.src = '';
  }
  lightbox.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ---------- 渲染照片 ---------- */
  function renderPhotos(photos) {
    if (!photos || !photos.length) {
      grid.outerHTML =
        '<div class="empty"><div class="empty-icon">📷</div>' +
        '还没有照片，把图片放进 photos/ 文件夹并在 data.json 里加一条吧</div>';
      return;
    }

    var html = '';
    photos.forEach(function (p, i) {
      html +=
        '<a class="photo-card" href="javascript:void(0)" data-idx="' + i + '">' +
          '<div class="photo-thumb">' +
            '<img src="' + p.src + '" alt="' + (p.caption || '') + '" loading="lazy">' +
          '</div>' +
          '<div class="photo-meta">' +
            (p.place ? '<div class="photo-place">📍 ' + p.place + '</div>' : '') +
            '<div class="photo-caption">' + (p.caption || '') + '</div>' +
            (p.note ? '<div class="photo-note">' + p.note + '</div>' : '') +
          '</div>' +
        '</a>';
    });
    grid.innerHTML = html;

    grid.querySelectorAll('.photo-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var p = photos[parseInt(card.dataset.idx, 10)];
        openLightbox(p.src, p.caption);
      });
    });
  }

  /* ---------- 渲染随想 ---------- */
  function renderNotes(notes) {
    if (!notes || !notes.length) {
      noteList.innerHTML =
        '<div class="empty"><div class="empty-icon">📝</div>' +
        '还没有随想记录</div>';
      return;
    }

    var html = '';
    notes.slice().reverse().forEach(function (n) {
      html +=
        '<div class="note-item">' +
          (n.date ? '<div class="note-date">' + n.date + '</div>' : '') +
          '<div class="note-text">' + n.text + '</div>' +
        '</div>';
    });
    noteList.innerHTML = html;
  }

  /* ---------- 统计 ---------- */
  function renderStats(photos, notes) {
    var places = {};
    (photos || []).forEach(function (p) {
      if (p.place) places[p.place] = 1;
    });
    setNum('statPhotos', (photos || []).length);
    setNum('statPlaces', Object.keys(places).length);
    setNum('statNotes', (notes || []).length);
  }

  function setNum(id, val) {
    var el = document.getElementById(id);
    if (!el) return;
    var n = 0;
    var timer = setInterval(function () {
      n += Math.max(1, Math.ceil(val / 18));
      if (n >= val) { n = val; clearInterval(timer); }
      el.textContent = n;
    }, 32);
  }

  /* ---------- 启动 ---------- */
  fetch('data.json?v=' + Date.now())
    .then(function (r) {
      if (!r.ok) throw new Error('data.json 读取失败: ' + r.status);
      return r.json();
    })
    .then(function (data) {
      renderPhotos(data.photos);
      renderNotes(data.notes);
      renderStats(data.photos, data.notes);
    })
    .catch(function (err) {
      console.error(err);
      grid.outerHTML =
        '<div class="empty"><div class="empty-icon">⚠️</div>' +
        '内容加载失败：' + err.message + '</div>';
    });
})();
