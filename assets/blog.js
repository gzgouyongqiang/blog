/* ===== 山高路远，家在身边 — 渲染脚本 ===== */
/* 内容全部来自 data.json，改 JSON 即可更新 */

(function () {
  'use strict';

  var grid = document.getElementById('photoGrid');
  var noteList = document.getElementById('noteList');
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCap = document.getElementById('lightboxCap');

  /* ---------- 灯箱 ---------- */
  function openLightbox(src, cap) {
    lightboxImg.src = src;
    lightboxImg.alt = cap || '';
    lightboxCap.textContent = cap || '';
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

  /* ---------- 转义，防注入 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---------- 照片 ---------- */
  function renderPhotos(photos) {
    if (!photos || !photos.length) {
      grid.outerHTML =
        '<div class="empty"><div class="empty-mark">— — —</div>' +
        '照片正在整理中</div>';
      return;
    }

    var html = '';
    photos.forEach(function (p, i) {
      html +=
        '<a class="photo-card" href="javascript:void(0)" data-idx="' + i + '">' +
          '<div class="photo-frame">' +
            '<div class="photo-thumb">' +
              '<img src="' + esc(p.src) + '" alt="' + esc(p.caption) + '" loading="lazy">' +
            '</div>' +
            '<div class="photo-body">' +
              (p.place ? '<div class="photo-place">' + esc(p.place) + '</div>' : '') +
              '<div class="photo-caption">' + esc(p.caption) + '</div>' +
              (p.note ? '<div class="photo-note">' + esc(p.note) + '</div>' : '') +
            '</div>' +
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

  /* ---------- 随想 ---------- */
  function renderNotes(notes) {
    if (!notes || !notes.length) {
      noteList.innerHTML =
        '<div class="empty"><div class="empty-mark">— — —</div>' +
        '还没有写下什么</div>';
      return;
    }

    var html = '';
    notes.slice().reverse().forEach(function (n) {
      html +=
        '<div class="note-item">' +
          (n.date ? '<div class="note-date">' + esc(n.date) + '</div>' : '') +
          '<div class="note-text">' + esc(n.text) + '</div>' +
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
    if (!val) { el.textContent = '0'; return; }
    var n = 0;
    var step = Math.max(1, Math.ceil(val / 16));
    var timer = setInterval(function () {
      n += step;
      if (n >= val) { n = val; clearInterval(timer); }
      el.textContent = n;
    }, 38);
  }

  /* ---------- 启动 ---------- */
  fetch('data.json?v=' + Date.now())
    .then(function (r) {
      if (!r.ok) throw new Error('读取失败 (' + r.status + ')');
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
        '<div class="empty"><div class="empty-mark">！</div>' +
        '内容加载失败：' + esc(err.message) + '</div>';
    });
})();
