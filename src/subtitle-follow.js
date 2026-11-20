/*!
 * Subtitle Follow — a bookmarklet that shows a lecture's subtitles in a panel that follows the video
 * (any playback speed, seeking, pop-out window), with one-click translation, a vocabulary book and export.
 * Made for Echo360 lecture recordings; works on most pages with an HTML5 <video>.
 * Unofficial; not affiliated with Echo360. MIT License.
 */
(function () {
  var ID = 'subsync-panel';
  var old = document.getElementById(ID) || window.__subsyncPanel;
  if (old) {
    if (window.__subsyncPip && !window.__subsyncPip.closed) { window.__subsyncPip.focus(); return; }
    old.style.display = old.style.display === 'none' ? 'flex' : 'none'; return;
  }

  /* ---------- i18n ---------- */
  var ZH = /^zh/i.test(navigator.language || '');
  var T = ZH ? {
    title: '字幕跟随', load: '📂', loadTip: '载入本地 .vtt / .srt 字幕文件', fetch: '⟳', fetchTip: '从当前 Echo360 页面重新获取字幕',
    pip: '🪟', pipTip: '弹出成独立的置顶小窗口（再点一次放回网页）', fm: '缩小字体', fp: '放大字体', close: '关闭（再点书签可重新打开）',
    translate: '🌐 翻译', vocab: '📒 生词', exportB: '⤓ 导出',
    finding: '正在寻找视频…', offset: '偏移', merge: '合并成句', mergeTip: '把碎片字幕合并成整句（翻译更通顺）',
    drop1: '在 Echo360 页面会自动获取字幕。<br>其他网站：点 <b>📂</b> 或把 <b>VTT / SRT</b> 字幕文件拖到这里',
    drop2: '（TXT 没有时间轴，无法同步）', back: '⤓ 回到当前',
    noTiming: '⚠️ 文件里没有时间轴，请使用 VTT 或 SRT', connected: '✅ 已连接视频', manual: '⏱ 未找到视频，手动计时',
    noPip: '⚠️ 独立窗口需要 Chrome 或 Edge（116+）', pipErr: '⚠️ 无法打开独立窗口：',
    fetching: '⏳ 正在从页面获取字幕…', fetched: function (n) { return '✅ 已自动获取字幕（' + n + ' 条）'; },
    fetchFail: '⚠️ 没能自动获取字幕，请手动下载 VTT 后点 📂 载入', notEcho: '⚠️ 当前不是 Echo360 课程页面',
    engine: '翻译引擎', google: 'Google 免费翻译（无需设置）', api: 'AI 大模型（自己的 API Key，质量更好）', to: '翻译成',
    base: 'API 地址', key: 'API Key', model: '模型名', start: '▶ 开始翻译', stop: '■ 停止', clearTr: '清除译文',
    auto: '打开课程时自动翻译', view: '显示', vBi: '双语', vDst: '仅译文', vSrc: '仅原文',
    googleNote: '免费、无需注册，但专业术语可能翻得不准。字幕文本会发送给 Google 翻译。',
    apiNote: '支持 OpenAI / DeepSeek / 阿里云百炼 / 硅基流动 / Gemini 等任何 OpenAI 兼容接口。Key 只保存在你这个浏览器里。',
    needCues: '⚠️ 先载入字幕再翻译', needApi: '⚠️ 请填写 API 地址、Key 和模型名',
    trProg: function (d, n) { return '🌐 翻译中 ' + d + '/' + n; }, trDone: function (n) { return '✅ 翻译完成（' + n + ' 句）'; },
    trStop: '⏹ 已停止翻译（已翻好的会保留）', trErr: '⚠️ 翻译出错：', tokens: function (p, c) { return ' · token ' + (p + c).toLocaleString(); },
    addWord: '＋ 生词', added: function (w) { return '📒 已加入生词本：' + w; },
    vocabEmpty: '还没有生词。在字幕里<b>选中一个词或短语</b>，点「＋ 生词」就会收藏到这里，并附上原句和翻译。',
    vocabCount: function (n) { return n + ' 个生词'; }, csv: '导出 CSV（可导入 Anki）', clearV: '清空', confirmClear: '再点一次确认清空',
    exVtt: '双语字幕 VTT', exVttTip: '原文 + 译文，带时间轴，可再次载入或用于播放器',
    exMd: '双语讲稿 Markdown', exMdTip: '整节课的文字稿，可放进笔记软件复习', exCsv: '生词本 CSV', exCsvTip: '可导入 Anki / Excel',
    nothing: '⚠️ 还没有可导出的内容',
    ov: '🎬', ovTip: '在视频画面上显示字幕（拖动调位置，滚轮调大小；可点 ✕ 关掉面板只留字幕）',
    mini: '▭', miniTip: '字幕条模式：只显示当前这句（配合 🪟 独立窗口可放到任何位置）', miniExit: '⤢ 展开',
    data: '数据', resetLesson: '♻︎ 清除这节课的字幕和译文', resetLessonTip: '恢复成第一次打开的状态，并重新从页面获取字幕',
    resetAll: '⚠️ 全部重置', resetAllTip: '清除所有课程的字幕、译文、生词本和设置（包括 API Key）', confirm: '再点一次确认', resetDone: '♻︎ 已重置'
  } : {
    title: 'Subtitle Follow', load: '📂', loadTip: 'Load a local .vtt / .srt file', fetch: '⟳', fetchTip: 'Re-fetch subtitles from this Echo360 page',
    pip: '🪟', pipTip: 'Pop out into a floating always-on-top window (click again to dock)', fm: 'Smaller text', fp: 'Larger text', close: 'Close (click the bookmark again to reopen)',
    translate: '🌐 Translate', vocab: '📒 Words', exportB: '⤓ Export',
    finding: 'Looking for the video…', offset: 'Offset', merge: 'Sentences', mergeTip: 'Join caption fragments into full sentences (better translations)',
    drop1: 'On Echo360 the subtitles load automatically.<br>Elsewhere: click <b>📂</b> or drop a <b>VTT / SRT</b> file here',
    drop2: '(TXT has no timestamps and can\'t be synced)', back: '⤓ Back to now',
    noTiming: '⚠️ No timestamps found — please use VTT or SRT', connected: '✅ Video connected', manual: '⏱ No video found — manual timer',
    noPip: '⚠️ Pop-out needs Chrome or Edge 116+', pipErr: '⚠️ Could not open window: ',
    fetching: '⏳ Fetching subtitles from the page…', fetched: function (n) { return '✅ Subtitles loaded from the page (' + n + ' cues)'; },
    fetchFail: '⚠️ Could not fetch subtitles automatically — download the VTT and load it with 📂', notEcho: '⚠️ This is not an Echo360 lesson page',
    engine: 'Engine', google: 'Google Translate (free, no setup)', api: 'AI model (your own API key, better quality)', to: 'Translate into',
    base: 'API base URL', key: 'API key', model: 'Model', start: '▶ Translate', stop: '■ Stop', clearTr: 'Clear translations',
    auto: 'Translate automatically when a lecture opens', view: 'Show', vBi: 'Both', vDst: 'Translation', vSrc: 'Original',
    googleNote: 'Free and no sign-up, but technical terms may be off. Subtitle text is sent to Google Translate.',
    apiNote: 'Works with any OpenAI-compatible API: OpenAI, DeepSeek, Gemini, OpenRouter, Alibaba Cloud… Your key stays in this browser.',
    needCues: '⚠️ Load subtitles first', needApi: '⚠️ Please fill in the API URL, key and model',
    trProg: function (d, n) { return '🌐 Translating ' + d + '/' + n; }, trDone: function (n) { return '✅ Translated (' + n + ' sentences)'; },
    trStop: '⏹ Stopped (finished lines are kept)', trErr: '⚠️ Translation error: ', tokens: function (p, c) { return ' · ' + (p + c).toLocaleString() + ' tokens'; },
    addWord: '＋ Save word', added: function (w) { return '📒 Saved: ' + w; },
    vocabEmpty: 'No words yet. <b>Select a word or phrase</b> in the subtitles and click "＋ Save word" — it is saved here with its sentence and translation.',
    vocabCount: function (n) { return n + ' words'; }, csv: 'Export CSV (Anki)', clearV: 'Clear', confirmClear: 'Click again to clear',
    exVtt: 'Bilingual VTT', exVttTip: 'Original + translation with timestamps',
    exMd: 'Bilingual transcript (Markdown)', exMdTip: 'The whole lecture as text, for your notes', exCsv: 'Vocabulary CSV', exCsvTip: 'For Anki / Excel',
    nothing: '⚠️ Nothing to export yet',
    ov: '🎬', ovTip: 'Show subtitles on the video itself (drag to move, scroll to resize; close the panel with ✕ to keep only the subtitles)',
    mini: '▭', miniTip: 'Subtitle-bar mode: show only the current line (combine with 🪟 to place it anywhere)', miniExit: '⤢ Expand',
    data: 'Data', resetLesson: '♻︎ Clear this lecture', resetLessonTip: 'Forget its subtitles and translations and fetch them again from the page',
    resetAll: '⚠️ Reset everything', resetAllTip: 'Delete all lectures, translations, vocabulary and settings (including your API key)', confirm: 'Click again to confirm', resetDone: '♻︎ Reset done'
  };
  var LANGS = [['zh-CN', '简体中文', 'Simplified Chinese'], ['zh-TW', '繁體中文', 'Traditional Chinese'], ['en', 'English', 'English'],
    ['ja', '日本語', 'Japanese'], ['ko', '한국어', 'Korean'], ['vi', 'Tiếng Việt', 'Vietnamese'], ['th', 'ไทย', 'Thai'],
    ['id', 'Bahasa Indonesia', 'Indonesian'], ['hi', 'हिन्दी', 'Hindi'], ['ar', 'العربية', 'Arabic'], ['tr', 'Türkçe', 'Turkish'],
    ['es', 'Español', 'Spanish'], ['pt', 'Português', 'Portuguese'], ['fr', 'Français', 'French'], ['de', 'Deutsch', 'German'],
    ['it', 'Italiano', 'Italian'], ['ru', 'Русский', 'Russian']];
  function langName(code) { for (var i = 0; i < LANGS.length; i++) if (LANGS[i][0] === code) return LANGS[i][2]; return code; }

  /* ---------- storage & state ---------- */
  var LS = function (k, v) { try { if (v === undefined) return localStorage.getItem('subsync:' + k); localStorage.setItem('subsync:' + k, v); } catch (e) { return null; } };
  var LSJ = function (k, v) { if (v === undefined) { try { return JSON.parse(LS(k) || 'null'); } catch (e) { return null; } } LS(k, JSON.stringify(v)); };
  var PATH = location.pathname;
  var cfg = LSJ('cfg') || {};
  if (!cfg.engine) cfg.engine = 'google';
  if (!cfg.target) cfg.target = ZH ? 'zh-CN' : ((navigator.language || 'en').split('-')[0] === 'en' ? 'zh-CN' : (navigator.language || 'en').split('-')[0]);
  if (!cfg.view) cfg.view = 'bi';
  // Auto-translate on by default for anyone whose browser isn't in English (English users pick a language first)
  if (cfg.auto === undefined) cfg.auto = ZH || (navigator.language || 'en').split('-')[0] !== 'en';
  var state = {
    raw: [], cues: [], bilingualFile: false, idx: -1, offset: 0, follow: true, merge: LS('merge') !== '0', userScrollAt: 0,
    font: parseInt(LS('font') || '20', 10), clock: { t: 0, playing: false, rate: 1.5, last: 0 },
    ov: LS('ov') === '1', ovY: parseFloat(LS('ovy') || '0.09'), ovScale: parseFloat(LS('ovs') || '1'), mini: false, ovDirty: true,
    tr: {}, trRun: null, usage: { p: 0, c: 0 }, vocab: LSJ('vocab') || [], drawer: '', warnAt: 0
  };

  /* ---------- styles ---------- */
  var css = document.createElement('style');
  css.textContent =
    '#subsync-panel{position:fixed;top:70px;right:16px;width:480px;height:74vh;min-width:280px;min-height:220px;z-index:2147483646;display:flex;flex-direction:column;background:#fffdf8;color:#222;border:1px solid #d9d4c7;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.25);font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Helvetica Neue","Segoe UI",sans-serif;resize:both;overflow:hidden;line-height:1.5;text-align:left;font-size:13px}' +
    '#subsync-panel *{box-sizing:border-box}' +
    '#subsync-head{display:flex;align-items:center;gap:5px;padding:7px 9px;background:#f3efe4;border-bottom:1px solid #e3ddcd;cursor:move;user-select:none;flex-wrap:wrap}' +
    '#subsync-head b{font-size:14px;margin-right:auto;color:#5a4a2a}' +
    '#subsync-panel button,#subsync-panel select,#subsync-panel input{font:12.5px/1.2 -apple-system,"Segoe UI",sans-serif;padding:5px 8px;border:1px solid #cfc7b3;background:#fff;color:#333;border-radius:6px}' +
    '#subsync-panel button{cursor:pointer}' +
    '#subsync-panel button:hover{background:#faf6ea}' +
    '#subsync-panel button.on{background:#c8102e;color:#fff;border-color:#c8102e}' +
    '#subsync-panel button.pri{background:#c8102e;color:#fff;border-color:#c8102e;font-weight:600}' +
    '#subsync-bar{display:flex;align-items:center;gap:5px;padding:5px 9px;font-size:12px;color:#666;border-bottom:1px solid #eee;flex-wrap:wrap}' +
    '#subsync-st{margin-right:auto;max-width:100%}' +
    '#subsync-head,#subsync-bar{flex:0 0 auto}' +
    '#subsync-drawer{flex:0 0 auto;display:none;padding:10px 12px;border-bottom:1px solid #e3ddcd;background:#fbf8f0;max-height:48%;overflow:auto;font-size:12.5px}' +
    '#subsync-drawer .row{display:flex;gap:6px;align-items:center;margin:5px 0;flex-wrap:wrap}' +
    '#subsync-drawer .row>label{min-width:72px;color:#777}' +
    '#subsync-drawer .row>input,#subsync-drawer .row>select{flex:1;min-width:120px}' +
    '#subsync-drawer .hint{color:#8a8170;font-size:11.5px;margin-top:6px}' +
    '#subsync-drawer .w{padding:7px 0;border-bottom:1px solid #eee6d6}' +
    '#subsync-drawer .w b{font-size:14px}' +
    '#subsync-drawer .w .wt{color:#c8102e;margin-left:6px}' +
    '#subsync-drawer .w .wc{color:#888;font-size:11.5px;margin-top:2px}' +
    '#subsync-drawer .w .tm{color:#b5ab95;cursor:pointer;margin-right:6px}' +
    '#subsync-drawer .w .del{float:right;border:none;background:none;color:#bbb;padding:0 4px}' +
    '#subsync-drawer .ex{display:block;width:100%;text-align:left;margin:5px 0;padding:8px 10px}' +
    '#subsync-drawer .ex small{display:block;color:#999;font-size:11px;margin-top:2px}' +
    '#subsync-list{flex:1 1 auto;min-height:60px;overflow-y:auto;padding:30vh 14px 40vh;scroll-behavior:auto}' +
    '#subsync-list .c{padding:6px 8px;margin:2px 0;border-radius:8px;cursor:pointer;color:#9a9a9a;transition:background .15s,color .15s}' +
    '#subsync-list .c.f{color:#555}' +
    '#subsync-list .c:hover{background:#f6f1e3}' +
    '#subsync-list .c.a{background:#fff1c9;color:#111;box-shadow:inset 3px 0 0 #c8102e}' +
    '#subsync-list .t{font-size:11px;color:#b5ab95;margin-right:6px;font-variant-numeric:tabular-nums}' +
    '#subsync-list .src,#subsync-list .dst{display:block}' +
    '#subsync-list .c.ht .src{font-size:.8em;opacity:.8}' +
    '#subsync-panel.v-dst #subsync-list .c.ht .src{display:none}' +
    '#subsync-panel.v-src #subsync-list .dst{display:none}' +
    '#subsync-panel.v-src #subsync-list .c.ht .src{font-size:1em;opacity:1}' +
    '#subsync-drop{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#777;font-size:14px;padding:20px;text-align:center}' +
    '#subsync-drop.over{background:#fff6dc}' +
    '#subsync-back{position:absolute;right:16px;bottom:14px;display:none;background:#c8102e!important;color:#fff!important;border:none!important;border-radius:16px!important;padding:7px 12px!important;box-shadow:0 2px 8px rgba(0,0,0,.2)}' +
    '#subsync-mini{display:none;flex:1;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:10px 16px;background:#141414;color:#fff;cursor:move;position:relative;overflow:hidden}' +
    '#subsync-mini .s{font-size:.8em;opacity:.75;display:block}' +
    '#subsync-mini .d{display:block;font-weight:500}' +
    '#subsync-mini .x{position:absolute;z-index:2;top:6px;right:6px;opacity:0;transition:opacity .2s;background:rgba(255,255,255,.15)!important;color:#fff!important;border:none!important}' +
    '#subsync-mini:hover .x{opacity:1}' +
    '#subsync-panel.mini{min-height:60px;background:#141414;border-color:#141414}' +
    '#subsync-panel.mini #subsync-head,#subsync-panel.mini #subsync-bar,#subsync-panel.mini #subsync-drawer,#subsync-panel.mini #subsync-list,#subsync-panel.mini #subsync-drop,#subsync-panel.mini #subsync-back{display:none!important}' +
    '#subsync-panel.mini #subsync-mini{display:flex}' +
    '#subsync-add{position:absolute;display:none;z-index:3;background:#2a2620!important;color:#fff!important;border:none!important;border-radius:14px!important;padding:5px 10px!important;box-shadow:0 2px 8px rgba(0,0,0,.25)}';
  css.textContent +=
    '#subsync-ov{position:fixed;z-index:2147483645;pointer-events:none;display:none;text-align:center;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Helvetica Neue","Segoe UI",sans-serif}' +
    '#subsync-ov .box{display:inline-block;pointer-events:auto;cursor:move;max-width:92%;padding:.25em .7em;border-radius:.45em;background:rgba(0,0,0,.62);color:#fff;line-height:1.35;text-shadow:0 1px 2px rgba(0,0,0,.5);user-select:none}' +
    '#subsync-ov .box:empty,#subsync-ov.blank .box{display:none}' +
    '#subsync-ov .s{display:block;font-size:.72em;opacity:.88}' +
    '#subsync-ov .s:empty,#subsync-mini .s:empty{display:none}' +
    '#subsync-ov .d{display:block}';
  document.head.appendChild(css);

  /* ---------- panel ---------- */
  var NT = ' translate="no" class="notranslate"';
  var p = document.createElement('div');
  p.id = ID;
  p.className = 'v-' + cfg.view;
  p.innerHTML =
    '<div id="subsync-head"' + NT + '><b>' + T.title + '</b>' +
    '<button data-a="d-tr">' + T.translate + '</button><button data-a="d-voc">' + T.vocab + '</button><button data-a="d-exp">' + T.exportB + '</button>' +
    '<button data-a="ov" id="subsync-ovbtn" title="' + T.ovTip + '">' + T.ov + '</button>' +
    '<button data-a="mini" title="' + T.miniTip + '">' + T.mini + '</button>' +
    '<button data-a="pip" id="subsync-pipbtn" title="' + T.pipTip + '">' + T.pip + '</button>' +
    '<button data-a="fm" title="' + T.fm + '">A−</button><button data-a="fp" title="' + T.fp + '">A+</button>' +
    '<button data-a="x" title="' + T.close + '">✕</button></div>' +
    '<div id="subsync-bar"' + NT + '><span id="subsync-st">' + T.finding + '</span>' +
    '<button data-a="load" title="' + T.loadTip + '">' + T.load + '</button>' +
    '<button data-a="fetch" id="subsync-fetch" title="' + T.fetchTip + '" style="display:none">' + T.fetch + '</button>' +
    '<span>' + T.offset + '</span><button data-a="om">−.5s</button><span id="subsync-off">0.0s</span><button data-a="op">+.5s</button>' +
    '<button data-a="merge" id="subsync-merge" title="' + T.mergeTip + '">' + T.merge + '</button>' +
    '<span id="subsync-clock" style="display:none;gap:5px;align-items:center">' +
    '<button data-a="play" id="subsync-play">▶</button><select id="subsync-rate"><option>1</option><option>1.25</option><option selected>1.5</option><option>1.75</option><option>2</option></select></span></div>' +
    '<div id="subsync-drawer"' + NT + '></div>' +
    '<div id="subsync-drop"' + NT + '><div style="font-size:32px">🎧</div><div>' + T.drop1 + '</div>' +
    '<div style="font-size:12px;color:#999">' + T.drop2 + '</div></div>' +
    '<div id="subsync-list" style="display:none" translate="yes"></div>' +
    '<button id="subsync-back"' + NT + ' data-a="back">' + T.back + '</button>' +
    '<div id="subsync-mini"' + NT + '><button class="x" data-a="mini">' + T.miniExit + '</button><span class="s"></span><span class="d"></span></div>' +
    '<button id="subsync-add"' + NT + '>' + T.addWord + '</button>' +
    '<input type="file" id="subsync-file" accept=".vtt,.srt,text/vtt" style="display:none">';
  document.body.appendChild(p);
  window.__subsyncPanel = p;
  var ov = document.createElement('div');
  ov.id = 'subsync-ov'; ov.setAttribute('translate', 'no'); ov.className = 'notranslate v-' + cfg.view;
  ov.innerHTML = '<div class="box" title="' + T.ovTip + '"><span class="s"></span><span class="d"></span></div>';
  document.body.appendChild(ov);
  var $ = function (s) { return p.querySelector(s); };
  var list = $('#subsync-list'), drop = $('#subsync-drop'), st = $('#subsync-st'), back = $('#subsync-back'), drawer = $('#subsync-drawer'), addBtn = $('#subsync-add');
  list.style.fontSize = state.font + 'px';

  function warn(msg) { st.textContent = msg; state.warnAt = Date.now(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- drag panel by header ---------- */
  (function () {
    var h = $('#subsync-head'), sx, sy, ox, oy, on = false;
    h.addEventListener('mousedown', function (e) {
      if (e.target.tagName === 'BUTTON' || p.ownerDocument !== document) return;
      on = true; sx = e.clientX; sy = e.clientY; var r = p.getBoundingClientRect(); ox = r.left; oy = r.top; e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
      if (!on) return;
      p.style.left = Math.max(0, ox + e.clientX - sx) + 'px'; p.style.top = Math.max(0, oy + e.clientY - sy) + 'px'; p.style.right = 'auto';
    });
    window.addEventListener('mouseup', function () { on = false; });
  })();

  /* ---------- parsing ---------- */
  function ts(s) {
    var m = s.trim().replace(',', '.').split(':');
    var sec = 0; for (var i = 0; i < m.length; i++) sec = sec * 60 + parseFloat(m[i]);
    return sec;
  }
  function parse(text) {
    text = text.replace(/\r/g, '').replace(/^﻿/, '');
    var out = [];
    text.split(/\n\s*\n/).forEach(function (b) {
      var lines = b.split('\n'), k = -1;
      for (var i = 0; i < lines.length; i++) if (lines[i].indexOf('-->') > -1) { k = i; break; }
      if (k < 0) return;
      var parts = lines[k].split('-->');
      var body = lines.slice(k + 1).map(function (l) { return l.replace(/<[^>]+>/g, '').trim(); }).filter(Boolean);
      if (!body.length) return;
      out.push({ s: ts(parts[0]), e: ts(parts[1].trim().split(/\s+/)[0]), lines: body });
    });
    out.sort(function (a, b) { return a.s - b.s; });
    return out;
  }
  var CJK = /[㐀-鿿぀-ヿ가-힯]/;
  function mergeSentences(cues) {
    var out = [], cur = null;
    cues.forEach(function (c) {
      var t = c.src;
      if (cur && (c.s - cur.e > 2.5)) { out.push(cur); cur = null; }
      if (!cur) cur = { s: c.s, e: c.e, src: t };
      else { cur.src += ' ' + t; cur.e = c.e; }
      if (/[.?!]["')\]]?$/.test(t) || cur.src.length > 260) { out.push(cur); cur = null; }
    });
    if (cur) out.push(cur);
    return out;
  }
  function fmt(t) { t = Math.max(0, Math.floor(t)); var m = Math.floor(t / 60), s = t % 60; return m + ':' + (s < 10 ? '0' : '') + s; }
  function vttTime(t) {
    var ms = Math.round(t * 1000), h = Math.floor(ms / 3600000); ms %= 3600000;
    var m = Math.floor(ms / 60000); ms %= 60000; var s = Math.floor(ms / 1000); ms %= 1000;
    var z = function (n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; };
    return z(h, 2) + ':' + z(m, 2) + ':' + z(s, 2) + '.' + z(ms, 3);
  }

  /* ---------- rendering ---------- */
  function dstOf(c) { return c.dst || state.tr[c.src] || ''; }
  function fillCue(d, c) {
    var dst = dstOf(c);
    d.innerHTML = '<span class="t notranslate" translate="no">' + fmt(c.s) + '</span><span class="src">' + esc(c.src) + '</span>' +
      (dst ? '<span class="dst notranslate" translate="no">' + esc(dst) + '</span>' : '');
    d.classList.toggle('ht', !!dst);
  }
  function render() {
    var canMerge = !state.bilingualFile && !state.raw.some(function (c) { return CJK.test(c.src); });
    $('#subsync-merge').style.display = canMerge ? '' : 'none';
    $('#subsync-merge').classList.toggle('on', state.merge);
    state.cues = (canMerge && state.merge) ? mergeSentences(state.raw) : state.raw;
    list.innerHTML = '';
    var frag = document.createDocumentFragment();
    state.cues.forEach(function (c, i) {
      var d = document.createElement('div'); d.className = 'c f'; d.dataset.i = i;
      fillCue(d, c); frag.appendChild(d);
    });
    list.appendChild(frag);
    drop.style.display = 'none'; list.style.display = 'block';
    state.idx = -1;
  }
  function refreshTranslations() {
    state.ovDirty = true;
    var kids = list.children;
    for (var i = 0; i < kids.length; i++) { var c = state.cues[i]; if (c) fillCue(kids[i], c); }
    state.idx = -2;
  }

  function loadTr() { state.tr = LSJ('tr:' + PATH + ':' + cfg.target) || {}; }
  function saveTr() { LSJ('tr:' + PATH + ':' + cfg.target, state.tr); }

  function loadText(text, name, quiet) {
    var cues = parse(text);
    if (!cues.length) { warn(T.noTiming); return 0; }
    var multi = cues.filter(function (c) { return c.lines.length > 1; }).length;
    state.bilingualFile = multi >= cues.length * 0.6;
    state.raw = cues.map(function (c) {
      return state.bilingualFile && c.lines.length > 1
        ? { s: c.s, e: c.e, src: c.lines[0], dst: c.lines.slice(1).join(' ') }
        : { s: c.s, e: c.e, src: c.lines.join(' ') };
    });
    loadTr(); render();
    LS('subs:' + PATH, text); LS('name:' + PATH, name || '');
    maybeAutoTranslate();
    return cues.length;
  }
  function readFile(f) { var r = new FileReader(); r.onload = function () { loadText(r.result, f.name); }; r.readAsText(f, 'utf-8'); }

  $('#subsync-file').addEventListener('change', function (e) { if (e.target.files[0]) readFile(e.target.files[0]); e.target.value = ''; });
  ['dragover', 'dragenter'].forEach(function (ev) { p.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
  p.addEventListener('dragleave', function () { drop.classList.remove('over'); });
  p.addEventListener('drop', function (e) { e.preventDefault(); drop.classList.remove('over'); var f = e.dataTransfer.files[0]; if (f) readFile(f); });

  /* ---------- Echo360: fetch the lesson's transcript automatically ---------- */
  var UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
  // lesson ids come in two shapes: /lesson/{uuid}/... and /lesson/G_{uuid}_{uuid}_{date}...
  var lessonMatch = PATH.match(/\/lesson\/([^\/?#]+)/i);
  var LESSON = lessonMatch && new RegExp(UUID, 'i').test(lessonMatch[1]) ? decodeURIComponent(lessonMatch[1]) : null;
  if (LESSON) $('#subsync-fetch').style.display = '';
  function resNames() {
    var names = (performance.getEntriesByType ? performance.getEntriesByType('resource') : []).map(function (e) { return e.name; });
    [].forEach.call(document.querySelectorAll('[src],[href]'), function (el) { names.push(el.getAttribute('src') || el.getAttribute('href') || ''); });
    return names;
  }
  function mediaIds() {
    // best source: the player's own API calls, which carry the exact lesson id it uses
    var pairs = [], ids = [], names = resNames();
    var pre = new RegExp('/lessons/([^/?#]+)/medias?/(' + UUID + ')', 'ig');
    names.forEach(function (n) { var m; pre.lastIndex = 0; while ((m = pre.exec(n))) { var k = m[1] + '|' + m[2].toLowerCase(); if (pairs.indexOf(k) < 0) pairs.push(k); } });
    if (pairs.length) return pairs.map(function (k) { var a = k.split('|'); return { lesson: decodeURIComponent(a[0]), id: a[1] }; });
    var re = new RegExp('/medias?/(' + UUID + ')', 'ig'), low = LESSON.toLowerCase();
    names.forEach(function (n) { var m; re.lastIndex = 0; while ((m = re.exec(n))) { var id = m[1].toLowerCase(); if (low.indexOf(id) < 0 && ids.indexOf(id) < 0) ids.push(id); } });
    return ids.map(function (id) { return { lesson: LESSON, id: id }; });
  }
  function fetchEcho(tries) {
    if (!LESSON) { warn(T.notEcho); return; }
    warn(T.fetching);
    var ids = mediaIds();
    if (!ids.length) {
      if ((tries || 0) < 6) { setTimeout(function () { fetchEcho((tries || 0) + 1); }, 1500); } else warn(T.fetchFail);
      return;
    }
    var best = null, pending = ids.length;
    ids.forEach(function (x) {
      fetch(location.origin + '/api/ui/echoplayer/lessons/' + encodeURIComponent(x.lesson) + '/medias/' + x.id + '/transcript-file?format=vtt', { credentials: 'include' })
        .then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; })
        .then(function (t) {
          var n = /^\s*WEBVTT/.test(t) ? (t.match(/-->/g) || []).length : 0;
          if (n && (!best || n > best.n)) best = { t: t, n: n };
          if (--pending === 0) {
            if (best) { var k = loadText(best.t, 'Echo360'); warn(T.fetched(k)); }
            else warn(T.fetchFail);
          }
        });
    });
  }

  /* ---------- video ---------- */
  function findVideo() {
    var vids = [].slice.call(document.querySelectorAll('video'));
    [].forEach.call(document.querySelectorAll('iframe'), function (f) {
      try { vids = vids.concat([].slice.call(f.contentDocument.querySelectorAll('video'))); } catch (e) {}
    });
    vids = vids.filter(function (v) { return v.duration > 0 || v.readyState > 0; });
    if (!vids.length) return null;
    vids.sort(function (a, b) {
      return (b.paused ? 0 : 1) - (a.paused ? 0 : 1) || (b.clientWidth * b.clientHeight) - (a.clientWidth * a.clientHeight);
    });
    return vids[0];
  }
  var video = null;
  function now() {
    if (video) return video.currentTime;
    var c = state.clock;
    if (c.playing) { var n = performance.now(); c.t += (n - c.last) / 1000 * c.rate; c.last = n; }
    return c.t;
  }
  function seek(t) {
    if (video) {
      // Echo360 can show two synced streams (camera + slides); seek every long video so they stay together
      [].forEach.call(document.querySelectorAll('video'), function (v) { if (Math.abs(v.duration - video.duration) < 2) v.currentTime = Math.max(0, t); });
      video.currentTime = Math.max(0, t);
    } else state.clock.t = Math.max(0, t);
    state.userScrollAt = 0;
  }
  function updateStatus() {
    var v = findVideo();
    if (v !== video) video = v;
    $('#subsync-clock').style.display = video ? 'none' : 'inline-flex';
    if (state.trRun || Date.now() - state.warnAt < 6000) return;
    st.textContent = video ? (T.connected + ' · ' + (video.playbackRate !== 1 ? video.playbackRate + '× · ' : '') + fmt(video.currentTime))
                           : T.manual + ' · ' + fmt(now());
  }
  setInterval(updateStatus, 1000); updateStatus();

  /* ---------- sync loop ---------- */
  function find(t) {
    var a = state.cues, lo = 0, hi = a.length - 1, r = -1;
    while (lo <= hi) { var m = (lo + hi) >> 1; if (a[m].s <= t) { r = m; lo = m + 1; } else hi = m - 1; }
    return r;
  }
  function scrollTo(el, smooth) {
    var top = el.offsetTop - list.clientHeight * 0.35;
    if (smooth && list.scrollTo) list.scrollTo({ top: top, behavior: 'smooth' }); else list.scrollTop = top;
  }
  /* ---------- on-video subtitles & subtitle bar ---------- */
  state.ovFrame = 0;
  function cueText(i) {
    var c = state.cues[i];
    if (!c || now() + state.offset > c.e + 1.5) return null;
    return { s: c.src, d: dstOf(c) };
  }
  function setLines(root, t) {
    // .s = small line (original, bilingual only), .d = main line
    var small = '', main = '';
    if (t) {
      if (cfg.view === 'src') main = t.s;
      else if (cfg.view === 'dst') main = t.d || t.s;
      else { main = t.d || t.s; small = t.d ? t.s : ''; }
    }
    root.querySelector('.s').textContent = small; root.querySelector('.d').textContent = main;
  }
  function updateOverlay(i) {
    var t = cueText(i);
    if (state.mini) {
      var m = $('#subsync-mini');
      m.style.fontSize = Math.max(14, Math.min(44, Math.min(p.clientHeight * 0.2, p.clientWidth / 18))) + 'px';
      setLines(m, t);
    }
    if (!state.ov || !video) { ov.style.display = 'none'; return; }
    var fs = document.fullscreenElement || document.webkitFullscreenElement;
    var host = fs && fs.tagName !== 'VIDEO' ? fs : document.body;
    if (ov.parentNode !== host) host.appendChild(ov);
    var r = video.getBoundingClientRect();
    if (r.width < 50 || r.height < 50) { ov.style.display = 'none'; return; }
    ov.style.display = 'block';
    ov.style.left = r.left + 'px'; ov.style.width = r.width + 'px';
    ov.style.top = 'auto'; ov.style.bottom = Math.max(0, window.innerHeight - r.bottom + r.height * state.ovY) + 'px';
    ov.style.fontSize = Math.max(13, Math.min(46, r.height * 0.05 * state.ovScale)) + 'px';
    ov.classList.toggle('blank', !t);
    if (t) setLines(ov, t);
  }
  (function () {
    var box = ov.querySelector('.box'), dragging = false, sy = 0, y0 = 0;
    box.addEventListener('mousedown', function (e) { dragging = true; sy = e.clientY; y0 = state.ovY; e.preventDefault(); });
    window.addEventListener('mousemove', function (e) {
      if (!dragging || !video) return;
      var h = video.getBoundingClientRect().height || 1;
      state.ovY = Math.max(0, Math.min(0.9, y0 - (e.clientY - sy) / h)); state.ovDirty = true;
    });
    window.addEventListener('mouseup', function () { if (dragging) { dragging = false; LS('ovy', state.ovY.toFixed(3)); } });
    box.addEventListener('wheel', function (e) {
      e.preventDefault(); state.ovScale = Math.max(0.5, Math.min(2.5, state.ovScale * (e.deltaY < 0 ? 1.08 : 0.93)));
      LS('ovs', state.ovScale.toFixed(2)); state.ovDirty = true;
    }, { passive: false });
    // drag the panel by the subtitle bar when it is in the page
    var mini = $('#subsync-mini'), on = false, sx, sy2, ox, oy;
    mini.addEventListener('mousedown', function (e) {
      if (e.target.tagName === 'BUTTON' || p.ownerDocument !== document) return;
      on = true; sx = e.clientX; sy2 = e.clientY; var rr = p.getBoundingClientRect(); ox = rr.left; oy = rr.top; e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) { if (!on) return; p.style.left = Math.max(0, ox + e.clientX - sx) + 'px'; p.style.top = Math.max(0, oy + e.clientY - sy2) + 'px'; p.style.right = 'auto'; });
    window.addEventListener('mouseup', function () { on = false; });
  })();
  function setOverlay(onOff) { state.ov = onOff; LS('ov', onOff ? '1' : '0'); $('#subsync-ovbtn').classList.toggle('on', onOff); state.ovDirty = true; if (!onOff) ov.style.display = 'none'; }
  function setMini(onOff) {
    state.mini = onOff; p.classList.toggle('mini', onOff); state.ovDirty = true;
    if (onOff) { state.prevH = p.style.height; if (p.ownerDocument === document) p.style.height = '120px'; }
    else { p.style.height = state.prevH || ''; state.idx = -2; }
  }

  function tick() {
    if (state.cues.length) {
      var i = find(now() + state.offset);
      var userLock = Date.now() - state.userScrollAt < 4000;
      if (i !== state.idx) {
        var kids = list.children;
        if (state.idx >= 0 && kids[state.idx]) kids[state.idx].classList.remove('a');
        var lo = Math.min(i, state.idx), hi = Math.max(i, state.idx);
        for (var k = Math.max(0, lo); k <= hi && k < kids.length; k++) kids[k].classList.toggle('f', k > i);
        if (state.idx < 0) for (var j = 0; j < kids.length; j++) kids[j].classList.toggle('f', j > i);
        if (i >= 0 && kids[i]) { kids[i].classList.add('a'); if (state.follow && !userLock) scrollTo(kids[i], Math.abs(i - state.idx) < 4); }
        state.idx = i; state.ovDirty = true;
      }
      if (state.ovDirty || ++state.ovFrame % 6 === 0) { updateOverlay(i); state.ovDirty = false; }
      back.style.display = userLock ? 'block' : 'none';
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  ['wheel', 'touchmove'].forEach(function (ev) { list.addEventListener(ev, function () { state.userScrollAt = Date.now(); addBtn.style.display = 'none'; }, { passive: true }); });
  list.addEventListener('mousedown', function (e) { if (e.offsetX > list.clientWidth) state.userScrollAt = Date.now(); });

  list.addEventListener('click', function (e) {
    var c = e.target.closest('.c'); if (!c) return;
    var sel = p.ownerDocument.getSelection && p.ownerDocument.getSelection();
    if (sel && String(sel).trim().length) return;
    seek(state.cues[+c.dataset.i].s - state.offset + 0.01);
  });

  /* ---------- translation ---------- */
  function googleTranslate(texts, target, signal) {
    var u = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + encodeURIComponent(target) + '&dt=t&q=' + encodeURIComponent(texts.join('\n'));
    return fetch(u, { signal: signal }).then(function (r) {
      if (!r.ok) throw new Error('Google HTTP ' + r.status);
      return r.json();
    }).then(function (d) {
      var joined = (d && d[0] || []).map(function (s) { return s[0] || ''; }).join('');
      return joined.split('\n').map(function (s) { return s.trim(); });
    });
  }
  function apiTranslate(texts, ctx, signal) {
    var url = String(cfg.base || '').trim().replace(/\/+$/, '');
    if (!/\/chat\/completions$/.test(url)) url += '/chat/completions';
    var tl = langName(cfg.target);
    var body = {
      model: cfg.model, temperature: 0.3, messages: [
        { role: 'system', content: 'You translate university lecture transcripts into natural, fluent ' + tl + ' for an international student.\n' +
          'Input: a JSON object {"context": [...previous sentences, for reference only], "sentences": [...]}.\n' +
          'Output: ONLY a JSON array of strings with exactly the same number of items as "sentences", each the ' + tl + ' translation of the sentence at the same position. No explanations, no markdown.\n' +
          'Rules: do not merge or split items; drop filler words (um, uh, you know) and false starts; keep numbers, formulas and variable names; translate academic terms accurately.' +
          (document.title ? '\nThe lecture page title is: ' + document.title : '') },
        { role: 'user', content: JSON.stringify({ context: ctx, sentences: texts }) }]
    };
    return fetch(url, { method: 'POST', signal: signal, headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.key }, body: JSON.stringify(body) })
      .then(function (r) {
        return r.json().catch(function () { return null; }).then(function (d) {
          if (!r.ok) { var e = new Error('HTTP ' + r.status + ' ' + ((d && d.error && (d.error.message || d.error)) || '')); e.fatal = r.status < 500 && r.status !== 429; throw e; }
          if (d && d.usage) { state.usage.p += d.usage.prompt_tokens || 0; state.usage.c += d.usage.completion_tokens || 0; }
          var txt = String(d && d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content || '').replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
          try { var j = JSON.parse(txt); if (Array.isArray(j)) return j.map(String); for (var k in j) if (Array.isArray(j[k])) return j[k].map(String); } catch (e) {}
          var a = txt.indexOf('['), b = txt.lastIndexOf(']');
          if (a > -1 && b > a) { try { return JSON.parse(txt.slice(a, b + 1)).map(String); } catch (e) {} }
          return null;
        });
      });
  }
  function translateAll() {
    if (state.trRun) return;
    if (!state.cues.length) { warn(T.needCues); return; }
    readCfg();
    if (cfg.engine === 'api' && (!cfg.base || !cfg.key || !cfg.model)) { warn(T.needApi); return; }
    var srcs = [], seen = {};
    state.cues.forEach(function (c) { if (!c.dst && !state.tr[c.src] && !seen[c.src]) { seen[c.src] = 1; srcs.push(c.src); } });
    var total = state.cues.length;
    if (!srcs.length) { warn(T.trDone(total)); return; }
    var run = state.trRun = { abort: window.AbortController ? new AbortController() : null, stopped: false };
    var sig = run.abort && run.abort.signal;
    var google = cfg.engine === 'google', maxChars = google ? 1800 : 2500, maxN = google ? 40 : 30;
    var batches = [], cur = [], len = 0;
    srcs.forEach(function (s) { if (cur.length && (len + s.length > maxChars || cur.length >= maxN)) { batches.push(cur); cur = []; len = 0; } cur.push(s); len += s.length; });
    if (cur.length) batches.push(cur);
    var doneCount = function () { return state.cues.filter(function (c) { return dstOf(c); }).length; };
    var progress = function () { st.textContent = T.trProg(doneCount(), total) + (google ? '' : T.tokens(state.usage.p, state.usage.c)); };
    var dirty = 0;
    var apply = function (texts, out) { texts.forEach(function (s, k) { if (out[k]) state.tr[s] = out[k]; }); if (++dirty % 3 === 0) saveTr(); refreshTranslations(); progress(); };
    function one(texts, depth) {
      if (run.stopped) return Promise.resolve();
      var ctx = [];
      var p0 = google ? googleTranslate(texts, cfg.target, sig) : apiTranslate(texts, ctx, sig);
      return p0.then(function (out) {
        if (out && out.length === texts.length) { apply(texts, out); return; }
        if (texts.length > 1 && depth < 5) { var h = Math.ceil(texts.length / 2); return one(texts.slice(0, h), depth + 1).then(function () { return one(texts.slice(h), depth + 1); }); }
        if (out && out[0]) apply(texts, [out.join(' ')]);
      }, function (e) {
        if (e && e.name === 'AbortError') return;
        if (e && e.fatal) { run.stopped = true; run.error = e.message; return; }
        if (texts.length > 1 && depth < 5) { var h = Math.ceil(texts.length / 2); return one(texts.slice(0, h), depth + 1).then(function () { return one(texts.slice(h), depth + 1); }); }
        run.error = e && e.message;
      });
    }
    var queue = batches.slice(), workers = [];
    var worker = function () { if (run.stopped || !queue.length) return Promise.resolve(); return one(queue.shift(), 0).then(worker); };
    progress();
    for (var w = 0; w < (google ? 2 : 3); w++) workers.push(worker());
    Promise.all(workers).then(function () {
      saveTr(); refreshTranslations(); state.trRun = null; drawerUpdate();
      if (run.error) warn(T.trErr + run.error);
      else if (run.stopped) warn(T.trStop);
      else warn(T.trDone(doneCount()) + (google ? '' : T.tokens(state.usage.p, state.usage.c)));
    });
    drawerUpdate();
  }
  function maybeAutoTranslate() {
    if (!cfg.auto || state.trRun) return;
    if (cfg.engine === 'api' && (!cfg.base || !cfg.key || !cfg.model)) return;
    if (!state.cues.some(function (c) { return !dstOf(c); })) return;
    setTimeout(translateAll, 600);
  }
  function stopTranslate() { if (state.trRun) { state.trRun.stopped = true; if (state.trRun.abort) state.trRun.abort.abort(); } }

  /* ---------- vocabulary ---------- */
  function hideAdd() { addBtn.style.display = 'none'; }
  list.addEventListener('mouseup', function () {
    setTimeout(function () {
      var sel = p.ownerDocument.getSelection();
      var txt = sel ? String(sel).trim() : '';
      if (!txt || txt.length > 80 || /\n/.test(txt) || !sel.rangeCount) { hideAdd(); return; }
      var node = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentNode);
      var cue = node && node.closest && node.closest('.c');
      if (!cue || !list.contains(cue)) { hideAdd(); return; }
      var r = sel.getRangeAt(0).getBoundingClientRect(), pr = p.getBoundingClientRect();
      addBtn.style.left = Math.max(6, Math.min(pr.width - 110, r.left - pr.left)) + 'px';
      addBtn.style.top = (r.bottom - pr.top + 6) + 'px';
      addBtn.style.display = 'block';
      addBtn._w = txt; addBtn._i = +cue.dataset.i;
    }, 0);
  });
  addBtn.addEventListener('mousedown', function (e) {
    e.preventDefault(); e.stopPropagation();
    var w = addBtn._w, c = state.cues[addBtn._i]; hideAdd();
    if (!w || !c) return;
    var item = { w: w, t: '', ctx: c.src, ctxT: dstOf(c), time: c.s, title: document.title, url: location.href, at: Date.now() };
    state.vocab.unshift(item); LSJ('vocab', state.vocab);
    var sel = p.ownerDocument.getSelection(); if (sel) sel.removeAllRanges();
    warn(T.added(w)); drawerUpdate();
    googleTranslate([w], cfg.target).then(function (out) { item.t = out[0] || ''; LSJ('vocab', state.vocab); drawerUpdate(); }, function () {});
  });

  /* ---------- export ---------- */
  function baseName() { return (document.title || 'lecture').replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || 'lecture'; }
  function download(name, content, mime) {
    var blob = new Blob([content], { type: mime + ';charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function csvCell(s) { return '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"'; }
  function exportAs(kind) {
    if (kind === 'csv') {
      if (!state.vocab.length) { warn(T.nothing); return; }
      var rows = [['word', 'translation', 'sentence', 'sentence_translation', 'time', 'lecture', 'url']].concat(state.vocab.map(function (v) { return [v.w, v.t, v.ctx, v.ctxT, fmt(v.time), v.title, v.url]; }));
      download('vocabulary.csv', '﻿' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n'), 'text/csv');
      return;
    }
    if (!state.cues.length) { warn(T.nothing); return; }
    if (kind === 'vtt') {
      var out = 'WEBVTT\n\n';
      state.cues.forEach(function (c, i) { var d = dstOf(c); out += (i + 1) + '\n' + vttTime(c.s) + ' --> ' + vttTime(c.e) + '\n' + c.src + (d ? '\n' + d : '') + '\n\n'; });
      download(baseName() + '.bilingual.vtt', out, 'text/vtt');
    } else {
      var md = '# ' + (document.title || 'Lecture') + '\n\n' + location.href + '\n\n';
      state.cues.forEach(function (c) { var d = dstOf(c); md += '**[' + fmt(c.s) + ']** ' + c.src + '\n' + (d ? '> ' + d + '\n' : '') + '\n'; });
      download(baseName() + '.md', md, 'text/markdown');
    }
  }

  /* ---------- reset ---------- */
  function resetData(all) {
    stopTranslate();
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf('subsync:') !== 0) return;
        var key = k.slice(8);
        if (all || key === 'subs:' + PATH || key === 'name:' + PATH || key.indexOf('tr:' + PATH + ':') === 0) localStorage.removeItem(k);
      });
    } catch (e) {}
    if (all) { cfg = { engine: 'google', target: cfg.target, view: 'bi', auto: ZH || (navigator.language || 'en').split('-')[0] !== 'en' }; state.vocab = []; state.merge = true; p.className = 'v-bi' + (state.mini ? ' mini' : ''); ov.className = 'notranslate v-bi'; }
    state.raw = []; state.cues = []; state.tr = {}; state.bilingualFile = false; state.idx = -1;
    list.innerHTML = ''; list.style.display = 'none'; drop.style.display = '';
    state.drawer = ''; drawer.innerHTML = ''; drawerUpdate();
    warn(T.resetDone);
    if (LESSON) setTimeout(fetchEcho, 300);
  }

  /* ---------- drawers ---------- */
  function readCfg() {
    var g = function (id) { var el = $('#' + id); return el ? el.value.trim() : null; };
    if ($('#ss-engine')) { cfg.engine = g('ss-engine'); cfg.target = g('ss-target'); cfg.base = g('ss-base'); cfg.key = g('ss-key'); cfg.model = g('ss-model'); }
    LSJ('cfg', cfg);
  }
  function drawerUpdate() {
    var d = state.drawer;
    [].forEach.call(p.querySelectorAll('#subsync-head [data-a^="d-"]'), function (b) { b.classList.toggle('on', b.dataset.a === 'd-' + d); });
    drawer.style.display = d ? 'block' : 'none';
    if (d === 'tr') {
      if ($('#ss-engine')) { $('#ss-go').style.display = state.trRun ? 'none' : ''; $('#ss-stop').style.display = state.trRun ? '' : 'none'; return; }
      var opts = LANGS.map(function (l) { return '<option value="' + l[0] + '"' + (l[0] === cfg.target ? ' selected' : '') + '>' + l[1] + '</option>'; }).join('');
      drawer.innerHTML =
        '<div class="row"><label>' + T.engine + '</label><select id="ss-engine"><option value="google">' + T.google + '</option><option value="api">' + T.api + '</option></select></div>' +
        '<div class="row"><label>' + T.to + '</label><select id="ss-target">' + opts + '</select></div>' +
        '<div id="ss-apif"><div class="row"><label>' + T.base + '</label><input id="ss-base" placeholder="https://api.deepseek.com/v1"></div>' +
        '<div class="row"><label>' + T.key + '</label><input id="ss-key" type="password" placeholder="sk-..." autocomplete="off"></div>' +
        '<div class="row"><label>' + T.model + '</label><input id="ss-model" placeholder="deepseek-chat / qwen-plus / gpt-4o-mini"></div></div>' +
        '<div class="row"><label style="min-width:0;color:#444"><input type="checkbox" id="ss-auto" style="width:auto;padding:0;margin:0 6px 0 0;vertical-align:-2px">' + T.auto + '</label></div>' +
        '<div class="row"><button class="pri" id="ss-go" data-a="go">' + T.start + '</button><button id="ss-stop" data-a="stoptr" style="display:none">' + T.stop + '</button>' +
        '<label style="min-width:0;margin-left:auto">' + T.view + '</label><select id="ss-view"><option value="bi">' + T.vBi + '</option><option value="dst">' + T.vDst + '</option><option value="src">' + T.vSrc + '</option></select>' +
        '<button data-a="cleartr" title="' + T.clearTr + '">🗑</button></div>' +
        '<div class="hint" id="ss-note"></div>';
      $('#ss-auto').checked = !!cfg.auto;
      $('#ss-auto').addEventListener('change', function () { cfg.auto = this.checked; LSJ('cfg', cfg); if (cfg.auto) maybeAutoTranslate(); });
      $('#ss-engine').value = cfg.engine; $('#ss-base').value = cfg.base || ''; $('#ss-key').value = cfg.key || ''; $('#ss-model').value = cfg.model || ''; $('#ss-view').value = cfg.view;
      var sync = function () { $('#ss-apif').style.display = $('#ss-engine').value === 'api' ? '' : 'none'; $('#ss-note').textContent = $('#ss-engine').value === 'api' ? T.apiNote : T.googleNote; };
      $('#ss-engine').addEventListener('change', function () { sync(); readCfg(); });
      $('#ss-target').addEventListener('change', function () { readCfg(); loadTr(); refreshTranslations(); });
      ['ss-base', 'ss-key', 'ss-model'].forEach(function (id) { $('#' + id).addEventListener('change', readCfg); });
      $('#ss-view').addEventListener('change', function () { cfg.view = this.value; p.className = 'v-' + cfg.view + (state.mini ? ' mini' : ''); ov.className = 'notranslate v-' + cfg.view; LSJ('cfg', cfg); state.ovDirty = true; });
      sync(); drawerUpdate();
    } else if (d === 'voc') {
      var v = state.vocab;
      drawer.innerHTML = '<div class="row"><b style="margin-right:auto">' + T.vocabCount(v.length) + '</b><button data-a="csv">' + T.csv + '</button><button data-a="clearv">' + T.clearV + '</button></div>' +
        (v.length ? v.map(function (x, i) {
          return '<div class="w"><button class="del" data-a="delw" data-i="' + i + '">✕</button><b>' + esc(x.w) + '</b><span class="wt">' + esc(x.t || '') + '</span>' +
            '<div class="wc">' + (x.url === location.href ? '<span class="tm" data-a="seekw" data-t="' + x.time + '">' + fmt(x.time) + '</span>' : '') + esc(x.ctx) + (x.ctxT ? '<br>' + esc(x.ctxT) : '') + '</div></div>';
        }).join('') : '<div class="hint">' + T.vocabEmpty + '</div>');
    } else if (d === 'exp') {
      drawer.innerHTML = '<button class="ex" data-a="ex-vtt">⤓ ' + T.exVtt + '<small>' + T.exVttTip + '</small></button>' +
        '<button class="ex" data-a="ex-md">⤓ ' + T.exMd + '<small>' + T.exMdTip + '</small></button>' +
        '<button class="ex" data-a="ex-csv">⤓ ' + T.exCsv + '<small>' + T.exCsvTip + '</small></button>' +
        '<div class="hint" style="margin:10px 0 2px">' + T.data + '</div>' +
        '<button class="ex" data-a="reset1">' + T.resetLesson + '<small>' + T.resetLessonTip + '</small></button>' +
        '<button class="ex" data-a="resetall">' + T.resetAll + '<small>' + T.resetAllTip + '</small></button>';
    } else drawer.innerHTML = '';
  }
  function toggleDrawer(name) { state.drawer = state.drawer === name ? '' : name; drawer.innerHTML = ''; drawerUpdate(); }

  /* ---------- buttons ---------- */
  p.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]'); if (!b || !p.contains(b)) return;
    var a = b.dataset.a;
    if (a === 'load') $('#subsync-file').click();
    else if (a === 'fetch') fetchEcho();
    else if (a === 'fp' || a === 'fm') { state.font = Math.max(12, Math.min(40, state.font + (a === 'fp' ? 2 : -2))); list.style.fontSize = state.font + 'px'; LS('font', state.font); }
    else if (a === 'x') { if (window.__subsyncPip) window.__subsyncPip.close(); else p.style.display = 'none'; }
    else if (a === 'pip') popOut();
    else if (a === 'ov') setOverlay(!state.ov);
    else if (a === 'mini') setMini(!state.mini);
    else if (a === 'om' || a === 'op') { state.offset += a === 'op' ? 0.5 : -0.5; $('#subsync-off').textContent = state.offset.toFixed(1) + 's'; state.idx = -2; }
    else if (a === 'merge') { state.merge = !state.merge; LS('merge', state.merge ? '1' : '0'); render(); }
    else if (a === 'back') { state.userScrollAt = 0; state.idx = -2; }
    else if (a === 'play') { var c = state.clock; now(); c.playing = !c.playing; c.last = performance.now(); b.textContent = c.playing ? '⏸' : '▶'; }
    else if (a.indexOf('d-') === 0) toggleDrawer(a.slice(2));
    else if (a === 'go') translateAll();
    else if (a === 'stoptr') stopTranslate();
    else if (a === 'cleartr') { state.tr = {}; saveTr(); refreshTranslations(); }
    else if (a === 'csv' || a === 'ex-csv') exportAs('csv');
    else if (a === 'ex-vtt') exportAs('vtt');
    else if (a === 'ex-md') exportAs('md');
    else if (a === 'delw') { state.vocab.splice(+b.dataset.i, 1); LSJ('vocab', state.vocab); drawerUpdate(); }
    else if (a === 'seekw') seek(+b.dataset.t);
    else if (a === 'reset1' || a === 'resetall') {
      if (!b._armed) { b._armed = true; b.firstChild.textContent = T.confirm + ' · '; return; }
      resetData(a === 'resetall');
    }
    else if (a === 'clearv') {
      if (b._armed) { state.vocab = []; LSJ('vocab', state.vocab); drawerUpdate(); }
      else { b._armed = true; b.textContent = T.confirmClear; }
    }
  });
  $('#subsync-rate').addEventListener('change', function (e) { now(); state.clock.rate = parseFloat(e.target.value); });

  /* ---------- independent always-on-top window (Document Picture-in-Picture) ---------- */
  function popOut() {
    if (window.__subsyncPip) { window.__subsyncPip.close(); return; }
    if (!('documentPictureInPicture' in window)) { warn(T.noPip); return; }
    var r = p.getBoundingClientRect();
    documentPictureInPicture.requestWindow({ width: Math.round(r.width), height: Math.round(r.height) }).then(function (w) {
      window.__subsyncPip = w;
      w.document.head.appendChild(css.cloneNode(true));
      var extra = w.document.createElement('style');
      extra.textContent = 'html,body{margin:0;height:100%;background:#fffdf8}#subsync-panel{position:relative!important;left:0!important;top:0!important;width:100vw!important;height:100vh!important;border:none!important;border-radius:0!important;box-shadow:none!important;resize:none!important;display:flex!important}#subsync-head{cursor:default!important}';
      w.document.head.appendChild(extra);
      w.document.title = T.title;
      w.document.body.appendChild(p);
      $('#subsync-pipbtn').classList.add('on');
      state.idx = -2;
      w.addEventListener('pagehide', function () {
        document.body.appendChild(p);
        window.__subsyncPip = null;
        $('#subsync-pipbtn').classList.remove('on');
        state.idx = -2;
      });
    }).catch(function (e) { warn(T.pipErr + e.message); });
  }

  if (state.ov) $('#subsync-ovbtn').classList.add('on');

  /* ---------- start: restore this lecture, or fetch it from Echo360 ---------- */
  var saved = LS('subs:' + PATH);
  if (saved) loadText(saved, LS('name:' + PATH));
  else if (LESSON) fetchEcho();
})();
