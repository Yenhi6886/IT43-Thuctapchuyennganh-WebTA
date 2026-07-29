/* Admin content CRUD: vocab, grammar, reading, listening, speaking, writing */
const _store = { vocab: {}, lessons: {}, grammar: {}, reading: {}, listening: {}, speaking: {}, writing: {} };

function storeItems(type, items) {
  _store[type] = {};
  (items || []).forEach(it => { if (it && it.id != null) _store[type][it.id] = it; });
}
function getItem(type, id) { return _store[type][id]; }

function actionBtns(type, id) {
  return `<div class="item-actions">
    <button class="btn btn-icon" title="Xem" onclick="viewItem('${type}',${id})"><i class="fa-solid fa-eye"></i></button>
    <button class="btn btn-icon" title="Sửa" onclick="editItem('${type}',${id})"><i class="fa-solid fa-pen"></i></button>
    <button class="btn btn-icon danger" title="Xóa" onclick="deleteItem('${type}',${id})"><i class="fa-solid fa-trash"></i></button>
  </div>`;
}

function valAttr(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function nl(s) { return esc(s).replace(/\n/g, '<br>'); }

function parseQuestionsField(raw) {
  if (!raw || !String(raw).trim()) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    alert('Questions JSON không hợp lệ: ' + e.message);
    return null;
  }
}

function formatQuestionsHtml(qs) {
  if (!Array.isArray(qs) || !qs.length) return '<p class="text-muted">Chưa có câu hỏi.</p>';
  return qs.map((q, i) => {
    const opts = Array.isArray(q.options) ? q.options : [];
    const ans = typeof q.answer === 'number' ? opts[q.answer] : (q.answer ?? q.correct ?? '');
    return `<div style="background:#f9fafb;padding:0.75rem;border-radius:8px;margin-bottom:0.5rem">
      <strong>Q${i + 1}.</strong> ${esc(q.q || q.question || '')}
      <ul style="margin:0.4rem 0 0 1.2rem;color:#6b7280">${opts.map(o => `<li>${esc(o)}</li>`).join('')}</ul>
      <div style="margin-top:0.35rem;color:#059669;font-size:0.85rem">Đáp án: ${esc(String(ans))}</div>
    </div>`;
  }).join('');
}

function viewItem(type, id) {
  const it = getItem(type, id);
  if (!it) { alert('Không tìm thấy dữ liệu. Hãy tải lại trang.'); return; }
  let body = '';
  if (type === 'vocab') {
    body = `<p><strong>Từ:</strong> ${esc(it.term)} <em>(${esc(it.word_type || '')})</em></p>
      <p><strong>VN:</strong> ${esc(it.definition_vi || '')}</p>
      <p><strong>EN:</strong> ${esc(it.definition_en || '')}</p>
      <p><strong>Category:</strong> ${esc(it.category || '')} · Day ${it.day_number}</p>
      <p><strong>Ví dụ:</strong></p><ul style="margin-left:1.2rem">
        ${[it.example1, it.example2, it.example3].filter(Boolean).map(x => `<li>${esc(x)}</li>`).join('') || '<li class="text-muted">—</li>'}
      </ul>`;
  } else if (type === 'lessons') {
    body = `<p><strong>Day ${it.day_number}</strong> · ${esc(it.topic || '')}</p>
      <h3 style="margin:1rem 0 0.5rem">🇻🇳 ${esc(it.title_vi || '')}</h3>
      <div style="white-space:pre-wrap;margin-bottom:1rem">${esc(it.content_vi || '')}</div>
      ${it.examples_vi ? `<p><strong>Ví dụ:</strong></p><div style="white-space:pre-wrap">${esc(it.examples_vi)}</div>` : ''}
      ${it.tips_vi ? `<p><strong>Tips:</strong></p><div style="white-space:pre-wrap">${esc(it.tips_vi)}</div>` : ''}
      ${it.title_en ? `<h3 style="margin:1.5rem 0 0.5rem">🇬🇧 ${esc(it.title_en)}</h3><div style="white-space:pre-wrap">${esc(it.content_en || '')}</div>` : ''}`;
  } else if (type === 'grammar') {
    const opts = Array.isArray(it.options) ? it.options : [];
    body = `<p><strong>Câu hỏi:</strong> ${esc(it.question)}</p>
      <p><strong>Options:</strong> ${esc(opts.join(' | '))}</p>
      <p><strong>Đáp án:</strong> ${esc(it.correct_answer)}</p>
      <p><strong>Giải thích:</strong> ${esc(it.explanation || '—')}</p>
      <p><strong>Topic:</strong> ${esc(it.grammar_topic || '')} · Day ${it.day_number}</p>`;
  } else if (type === 'reading') {
    body = `<p><strong>${esc(it.title)}</strong></p>
      <p class="text-muted">${esc(it.category || '')} · Day ${it.day_number}</p>
      <div style="white-space:pre-wrap;background:#f9fafb;padding:1rem;border-radius:8px;max-height:240px;overflow:auto;margin:1rem 0">${esc(it.content || '')}</div>
      <h4>Câu hỏi</h4>${formatQuestionsHtml(it.questions)}`;
  } else if (type === 'listening') {
    body = `<p><strong>${esc(it.title)}</strong></p>
      <p class="text-muted">${esc(it.category || '')} · Day ${it.day_number}</p>
      <div style="white-space:pre-wrap;background:#f9fafb;padding:1rem;border-radius:8px;max-height:240px;overflow:auto;margin:1rem 0">${esc(it.dialogue || '')}</div>
      <h4>Câu hỏi</h4>${formatQuestionsHtml(it.questions)}`;
  } else if (type === 'speaking') {
    body = `<p><strong>Prompt:</strong></p><div style="white-space:pre-wrap">${esc(it.prompt || '')}</div>
      <p style="margin-top:1rem"><strong>Key phrases:</strong> ${esc(it.key_phrases || '—')}</p>
      <p><strong>Sample:</strong></p><div style="white-space:pre-wrap">${esc(it.sample_answer || '—')}</div>
      <p class="text-muted">${esc(it.category || '')} · Day ${it.day_number}</p>`;
  } else if (type === 'writing') {
    body = `<p><strong>${esc(it.title)}</strong></p>
      <p><strong>Prompt:</strong></p><div style="white-space:pre-wrap">${esc(it.prompt || '')}</div>
      <p style="margin-top:1rem"><strong>Sample:</strong></p><div style="white-space:pre-wrap">${esc(it.sample_answer || '—')}</div>
      <p class="text-muted">${esc(it.category || '')} · Day ${it.day_number} · Limit ${it.word_limit} words</p>`;
  }
  openModal(`<button class="close-modal" onclick="closeModal()">✕</button>
    <h2>Chi tiết</h2>
    <div style="max-height:65vh;overflow:auto">${body}</div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Đóng</button>
      <button class="btn btn-primary" onclick="closeModal();editItem('${type}',${id})"><i class="fa-solid fa-pen"></i> Sửa</button>
    </div>`);
}

function editItem(type, id) {
  const it = getItem(type, id);
  if (!it) { alert('Không tìm thấy dữ liệu.'); return; }
  if (type === 'vocab') return showVocabForm(it);
  if (type === 'lessons') return showLessonForm(it);
  if (type === 'grammar') return showExerciseForm(it);
  if (type === 'reading') return showReadingForm(it);
  if (type === 'listening') return showListeningForm(it);
  if (type === 'speaking') return showSpeakingForm(it);
  if (type === 'writing') return showWritingForm(it);
}

function deleteItem(type, id) {
  if (!confirm('Xóa mục này?')) return;
  const map = {
    vocab: [`/api/admin/vocabulary/${id}`, () => loadVocabulary()],
    lessons: [`/api/admin/grammar-lessons/${id}`, () => loadGrammarLessons()],
    grammar: [`/api/admin/grammar/${id}`, () => loadGrammarExercises()],
    reading: [`/api/admin/reading/${id}`, () => loadReading()],
    listening: [`/api/admin/listening/${id}`, () => loadListening()],
    speaking: [`/api/admin/speaking/${id}`, () => loadSpeaking()],
    writing: [`/api/admin/writing/${id}`, () => loadWriting()]
  };
  const cfg = map[type];
  if (!cfg) return;
  fetch(cfg[0], { method: 'DELETE' }).then(r => r.json()).then(() => { cfg[1](); if (typeof loadDashboard === 'function') loadDashboard(); })
    .catch(e => alert('Lỗi xóa: ' + e.message));
}

// ---------- VOCAB ----------
function loadVocabulary(page) {
  if (page) _vocabPage = page;
  const sel = document.getElementById('vocab-cat-filter');
  const tbody = document.getElementById('vocab-tbody');
  if (!tbody) return;

  fetch('/api/admin/vocabulary/categories').then(r => r.json()).then(cats => {
    const list = asList(cats);
    const cv = sel.value;
    sel.innerHTML = '<option value="">Tất cả danh mục</option>';
    list.forEach(c => {
      const cat = c.category || '';
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = `${cat} (${c.count})`;
      if (cat === cv) opt.selected = true;
      sel.appendChild(opt);
    });
  }).catch(() => {});

  const cat = sel.value;
  const search = document.getElementById('vocab-search').value.trim();
  let url = `/api/admin/vocabulary?page=${_vocabPage}&limit=${VOCAB_PAGE_SIZE}`;
  if (cat) url += `&category=${encodeURIComponent(cat)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  tbody.innerHTML = '<tr><td colspan="6" class="text-center">Đang tải...</td></tr>';
  fetch(url).then(async r => {
    const res = await r.json();
    if (!r.ok) throw new Error(res.error || ('HTTP ' + r.status));
    return res;
  }).then(res => {
    const data = asList(res);
    storeItems('vocab', data);
    const total = asTotal(res, data);
    const totalPages = Math.max(1, Math.ceil(total / VOCAB_PAGE_SIZE));
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không có kết quả.</td></tr>';
    } else {
      tbody.innerHTML = data.map(w => `<tr>
        <td><strong>${esc(w.term)}</strong></td>
        <td>${esc(w.word_type || 'n.')}</td>
        <td title="${valAttr(w.definition_en || '')}" style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(w.definition_vi || '')}</td>
        <td><span style="background:#e0e7ff;color:#4f46e5;padding:3px 8px;border-radius:10px;font-size:0.75rem">${esc(w.category || '')}</span></td>
        <td>Day ${w.day_number ?? ''}</td>
        <td style="min-width:120px">${actionBtns('vocab', w.id)}</td>
      </tr>`).join('');
    }
    const pager = document.getElementById('vocab-pager');
    if (pager) {
      pager.innerHTML = `<span class="text-muted">Hiển thị ${data.length ? ((_vocabPage - 1) * VOCAB_PAGE_SIZE + 1) : 0}–${Math.min(_vocabPage * VOCAB_PAGE_SIZE, total)} / ${Number(total).toLocaleString()} từ</span>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <button class="btn btn-outline" ${_vocabPage <= 1 ? 'disabled' : ''} onclick="loadVocabulary(${_vocabPage - 1})">← Trước</button>
          <span>Trang ${_vocabPage}/${totalPages}</span>
          <button class="btn btn-outline" ${_vocabPage >= totalPages ? 'disabled' : ''} onclick="loadVocabulary(${_vocabPage + 1})">Sau →</button>
        </div>`;
    }
  }).catch(e => {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color:red">Lỗi tải từ vựng: ${esc(e.message)}</td></tr>`;
  });
}

function showVocabForm(v) {
  const e = !!v;
  openModal(`<button class="close-modal" onclick="closeModal()">✕</button>
    <h2>${e ? 'Sửa' : 'Thêm'} Từ Vựng</h2>
    <div class="form-group"><label>Từ (EN) *</label><input id="m-term" value="${valAttr(v?.term || '')}"></div>
    <div class="form-group"><label>Loại từ</label><input id="m-type" value="${valAttr(v?.word_type || 'n.')}"></div>
    <div class="form-group"><label>Nghĩa (VN)</label><input id="m-defvi" value="${valAttr(v?.definition_vi || '')}"></div>
    <div class="form-group"><label>Nghĩa (EN)</label><input id="m-defen" value="${valAttr(v?.definition_en || '')}"></div>
    <div class="form-group"><label>Category</label><input id="m-cat" value="${valAttr(v?.category || 'General')}"></div>
    <div class="form-group"><label>Ví dụ 1</label><input id="m-ex1" value="${valAttr(v?.example1 || '')}"></div>
    <div class="form-group"><label>Ví dụ 2</label><input id="m-ex2" value="${valAttr(v?.example2 || '')}"></div>
    <div class="form-group"><label>Ví dụ 3</label><input id="m-ex3" value="${valAttr(v?.example3 || '')}"></div>
    <div class="form-group"><label>Day Number</label><input type="number" id="m-day" value="${v?.day_number || 1}"></div>
    <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Hủy</button>
    <button class="btn btn-primary" onclick="saveVocab(${v?.id || 0})">${e ? 'Cập nhật' : 'Thêm mới'}</button></div>`);
}

function saveVocab(id) {
  const body = { term: gv('m-term'), word_type: gv('m-type'), definition_vi: gv('m-defvi'), definition_en: gv('m-defen'), category: gv('m-cat'), example1: gv('m-ex1'), example2: gv('m-ex2'), example3: gv('m-ex3'), day_number: parseInt(gv('m-day')) || 1 };
  if (!body.term) { alert('Vui lòng nhập từ vựng!'); return; }
  fetch(id ? `/api/admin/vocabulary/${id}` : '/api/admin/vocabulary', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(r => r.json()).then(d => { if (d.error) { alert(d.error); return; } closeModal(); loadVocabulary(); loadDashboard(); });
}

// ---------- GRAMMAR ----------
function loadGrammar() { loadGrammarLessons(); }

function switchGrammarTab(tab) {
  document.querySelectorAll('#view-grammar .tab-btn').forEach(b => b.classList.remove('active'));
  if (tab === 'lessons') {
    document.querySelectorAll('#view-grammar .tab-btn')[0].classList.add('active');
    document.getElementById('grammar-lessons-area').style.display = '';
    document.getElementById('grammar-exercises-area').style.display = 'none';
    loadGrammarLessons();
  } else {
    document.querySelectorAll('#view-grammar .tab-btn')[1].classList.add('active');
    document.getElementById('grammar-lessons-area').style.display = 'none';
    document.getElementById('grammar-exercises-area').style.display = '';
    loadGrammarExercises();
  }
}

function loadGrammarLessons() {
  const area = document.getElementById('grammar-lessons-area');
  area.innerHTML = '<p class="text-center" style="padding:2rem">Đang tải...</p>';
  fetch(`/api/admin/grammar-lessons?limit=${LIST_LIMIT}`).then(async r => {
    const res = await r.json();
    if (!r.ok) throw new Error(res.error || ('HTTP ' + r.status));
    return res;
  }).then(res => {
    const lessons = asList(res);
    storeItems('lessons', lessons);
    const total = asTotal(res, lessons);
    area.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <span class="text-muted">${total} bài lý thuyết</span>
      <button class="btn btn-primary" onclick="showLessonForm()"><i class="fa-solid fa-plus"></i> Thêm Bài Lý Thuyết</button></div>`;
    if (!lessons.length) { area.innerHTML += '<div class="empty-state"><p>Chưa có bài lý thuyết.</p></div>'; return; }
    lessons.forEach(l => {
      const title = l.title_vi || l.title || '(Không tiêu đề)';
      const content = l.content_vi || l.content || '';
      area.innerHTML += `<div class="admin-item">
        <div style="min-width:40px;height:40px;border-radius:50%;background:#e0e7ff;display:flex;align-items:center;justify-content:center;font-weight:800;color:#4f46e5">D${l.day_number}</div>
        <div class="item-body"><h4>📖 ${esc(title)}</h4><p>${esc(String(content).substring(0, 140))}...</p>
          <div class="item-meta"><span>Topic: ${esc(l.topic || 'N/A')}</span><span>Day ${l.day_number}</span></div></div>
        ${actionBtns('lessons', l.id)}
      </div>`;
    });
  }).catch(e => { area.innerHTML = `<p style="color:red;padding:2rem">Lỗi: ${esc(e.message)}</p>`; });
}

function showLessonForm(l) {
  const e = !!l;
  openModal(`<button class="close-modal" onclick="closeModal()">✕</button>
    <h2>${e ? 'Sửa' : 'Thêm'} Bài Lý Thuyết</h2>
    <div class="form-group"><label>Day Number</label><input type="number" id="ml-day" value="${l?.day_number || 1}"></div>
    <div class="form-group"><label>Topic</label><input id="ml-topic" value="${valAttr(l?.topic || '')}"></div>
    <div style="display:flex;gap:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:240px">
        <h4 style="margin-bottom:8px;color:#0369a1">🇻🇳 Tiếng Việt</h4>
        <div class="form-group"><label>Tiêu đề *</label><input id="ml-title-vi" value="${valAttr(l?.title_vi || '')}"></div>
        <div class="form-group"><label>Nội dung *</label><textarea id="ml-content-vi" rows="6">${esc(l?.content_vi || '')}</textarea></div>
        <div class="form-group"><label>Ví dụ</label><textarea id="ml-examples-vi" rows="3">${esc(l?.examples_vi || '')}</textarea></div>
        <div class="form-group"><label>Tips</label><textarea id="ml-tips-vi" rows="2">${esc(l?.tips_vi || '')}</textarea></div>
      </div>
      <div style="flex:1;min-width:240px">
        <h4 style="margin-bottom:8px;color:#be123c">🇬🇧 English</h4>
        <div class="form-group"><label>Title</label><input id="ml-title-en" value="${valAttr(l?.title_en || '')}"></div>
        <div class="form-group"><label>Content</label><textarea id="ml-content-en" rows="6">${esc(l?.content_en || '')}</textarea></div>
        <div class="form-group"><label>Examples</label><textarea id="ml-examples-en" rows="3">${esc(l?.examples_en || '')}</textarea></div>
        <div class="form-group"><label>Tips</label><textarea id="ml-tips-en" rows="2">${esc(l?.tips_en || '')}</textarea></div>
      </div>
    </div>
    <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Hủy</button>
    <button class="btn btn-primary" onclick="saveLesson(${l?.id || 0})">${e ? 'Cập nhật' : 'Thêm'}</button></div>`);
}

function saveLesson(id) {
  const body = {
    topic: gv('ml-topic'), day_number: parseInt(gv('ml-day')) || 1,
    title_vi: gv('ml-title-vi'), content_vi: gv('ml-content-vi'), examples_vi: gv('ml-examples-vi'), tips_vi: gv('ml-tips-vi'),
    title_en: gv('ml-title-en'), content_en: gv('ml-content-en'), examples_en: gv('ml-examples-en'), tips_en: gv('ml-tips-en')
  };
  if (!body.title_vi || !body.content_vi) { alert('Nhập tiêu đề và nội dung tiếng Việt!'); return; }
  fetch(id ? `/api/admin/grammar-lessons/${id}` : '/api/admin/grammar-lessons', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(r => r.json()).then(d => { if (d.error) { alert(d.error); return; } closeModal(); loadGrammarLessons(); });
}

function loadGrammarExercises() {
  const area = document.getElementById('grammar-exercises-area');
  area.innerHTML = '<p class="text-center" style="padding:2rem">Đang tải...</p>';
  fetch(`/api/admin/grammar?limit=${LIST_LIMIT}`).then(async r => {
    const res = await r.json();
    if (!r.ok) throw new Error(res.error || ('HTTP ' + r.status));
    return res;
  }).then(res => {
    const exs = asList(res);
    storeItems('grammar', exs);
    const total = asTotal(res, exs);
    area.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <span class="text-muted">${total} câu hỏi</span>
      <button class="btn btn-primary" onclick="showExerciseForm()"><i class="fa-solid fa-plus"></i> Thêm Câu Hỏi</button></div>`;
    if (!exs.length) { area.innerHTML += '<div class="empty-state"><p>Chưa có bài tập.</p></div>'; return; }
    exs.forEach((ex, i) => {
      const opts = Array.isArray(ex.options) ? ex.options : [];
      area.innerHTML += `<div class="admin-item">
        <div style="min-width:40px;height:40px;border-radius:50%;background:#fef3c7;display:flex;align-items:center;justify-content:center;font-weight:800;color:#d97706">${i + 1}</div>
        <div class="item-body"><h4>${esc(ex.question)}</h4><p>✅ <strong>${esc(ex.correct_answer)}</strong> · ${esc(opts.join(', '))}</p>
          <div class="item-meta"><span>${esc(ex.grammar_topic || '')}</span><span>Day ${ex.day_number}</span></div></div>
        ${actionBtns('grammar', ex.id)}
      </div>`;
    });
  }).catch(e => { area.innerHTML = `<p style="color:red;padding:2rem">Lỗi: ${esc(e.message)}</p>`; });
}

function showExerciseForm(ex) {
  const e = !!ex;
  const opts = Array.isArray(ex?.options) ? ex.options : ['', '', '', ''];
  openModal(`<button class="close-modal" onclick="closeModal()">✕</button>
    <h2>${e ? 'Sửa' : 'Thêm'} Câu Hỏi Ngữ Pháp</h2>
    <div class="form-group"><label>Câu hỏi *</label><input id="me-q" value="${valAttr(ex?.question || '')}"></div>
    <div class="form-group"><label>Đáp án A</label><input id="me-a" value="${valAttr(opts[0] || '')}"></div>
    <div class="form-group"><label>Đáp án B</label><input id="me-b" value="${valAttr(opts[1] || '')}"></div>
    <div class="form-group"><label>Đáp án C</label><input id="me-c" value="${valAttr(opts[2] || '')}"></div>
    <div class="form-group"><label>Đáp án D</label><input id="me-d" value="${valAttr(opts[3] || '')}"></div>
    <div class="form-group"><label>Đáp án đúng (copy đúng text)</label><input id="me-correct" value="${valAttr(ex?.correct_answer || '')}"></div>
    <div class="form-group"><label>Giải thích</label><textarea id="me-expl">${esc(ex?.explanation || '')}</textarea></div>
    <div class="form-group"><label>Grammar Topic</label><input id="me-topic" value="${valAttr(ex?.grammar_topic || '')}"></div>
    <div class="form-group"><label>Day Number</label><input type="number" id="me-day" value="${ex?.day_number || 1}"></div>
    <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Hủy</button>
    <button class="btn btn-primary" onclick="saveExercise(${ex?.id || 0})">${e ? 'Cập nhật' : 'Thêm'}</button></div>`);
}

function saveExercise(id) {
  const body = { question: gv('me-q'), options: [gv('me-a'), gv('me-b'), gv('me-c'), gv('me-d')], correct_answer: gv('me-correct'), explanation: gv('me-expl'), grammar_topic: gv('me-topic'), day_number: parseInt(gv('me-day')) || 1 };
  if (!body.question) { alert('Nhập câu hỏi!'); return; }
  fetch(id ? `/api/admin/grammar/${id}` : '/api/admin/grammar', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(r => r.json()).then(d => { if (d.error) { alert(d.error); return; } closeModal(); loadGrammarExercises(); loadDashboard(); });
}

// ---------- READING / LISTENING / SPEAKING / WRITING ----------
function loadContentList(type, areaId, emptyMsg, renderItem) {
  const area = document.getElementById(areaId);
  area.innerHTML = '<p class="text-center" style="padding:2rem">Đang tải...</p>';
  fetch(`/api/admin/${type}?limit=${LIST_LIMIT}`).then(async r => {
    const res = await r.json();
    if (!r.ok) throw new Error(res.error || ('HTTP ' + r.status));
    return res;
  }).then(res => {
    const items = asList(res);
    storeItems(type, items);
    const total = asTotal(res, items);
    if (!items.length) { area.innerHTML = `<div class="empty-state"><p>${emptyMsg}</p></div>`; return; }
    area.innerHTML = `<p class="text-muted" style="margin-bottom:1rem">${total} mục</p>` + items.map(renderItem).join('');
  }).catch(e => { area.innerHTML = `<p style="color:red;padding:2rem">Lỗi: ${esc(e.message)}</p>`; });
}

function loadReading() {
  loadContentList('reading', 'reading-list', 'Chưa có bài đọc.', it => {
    const qs = Array.isArray(it.questions) ? it.questions : [];
    return `<div class="admin-item">
      <div style="min-width:40px;height:40px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;color:#2563eb"><i class="fa-solid fa-book-open-reader"></i></div>
      <div class="item-body"><h4>${esc(it.title)}</h4><p>${esc(String(it.content || '').substring(0, 180))}...</p>
        <div class="item-meta"><span>${esc(it.category || '')}</span><span>Day ${it.day_number}</span><span>${qs.length} câu hỏi</span></div></div>
      ${actionBtns('reading', it.id)}</div>`;
  });
}

function loadListening() {
  loadContentList('listening', 'listening-list', 'Chưa có bài nghe.', it => {
    const qs = Array.isArray(it.questions) ? it.questions : [];
    return `<div class="admin-item">
      <div style="min-width:40px;height:40px;border-radius:50%;background:#fce4ec;display:flex;align-items:center;justify-content:center;color:#e11d48"><i class="fa-solid fa-headphones"></i></div>
      <div class="item-body"><h4>🎧 ${esc(it.title)}</h4><p>${esc(String(it.dialogue || '').substring(0, 180))}...</p>
        <div class="item-meta"><span>${esc(it.category || '')}</span><span>Day ${it.day_number}</span><span>${qs.length} câu hỏi</span></div></div>
      ${actionBtns('listening', it.id)}</div>`;
  });
}

function loadSpeaking() {
  loadContentList('speaking', 'speaking-list', 'Chưa có chủ đề nói.', it => `<div class="admin-item">
    <div style="min-width:40px;height:40px;border-radius:50%;background:#d1fae5;display:flex;align-items:center;justify-content:center;color:#059669"><i class="fa-solid fa-microphone"></i></div>
    <div class="item-body"><h4>🎤 ${esc(it.prompt)}</h4><p>${esc(it.key_phrases || 'N/A')}</p>
      <div class="item-meta"><span>${esc(it.category || '')}</span><span>Day ${it.day_number}</span></div></div>
    ${actionBtns('speaking', it.id)}</div>`);
}

function loadWriting() {
  loadContentList('writing', 'writing-list', 'Chưa có đề viết.', it => `<div class="admin-item">
    <div style="min-width:40px;height:40px;border-radius:50%;background:#fef3c7;display:flex;align-items:center;justify-content:center;color:#d97706"><i class="fa-solid fa-file-pen"></i></div>
    <div class="item-body"><h4>✍️ ${esc(it.title)}</h4><p>${esc(String(it.prompt || '').substring(0, 180))}...</p>
      <div class="item-meta"><span>${esc(it.category || '')}</span><span>Day ${it.day_number}</span><span>Limit: ${it.word_limit} words</span></div></div>
    ${actionBtns('writing', it.id)}</div>`);
}

function showReadingForm(it) {
  const e = !!it;
  const qs = JSON.stringify(it?.questions || [], null, 2);
  openModal(`<button class="close-modal" onclick="closeModal()">✕</button>
    <h2>${e ? 'Sửa' : 'Thêm'} Bài Đọc</h2>
    <div class="form-group"><label>Tiêu đề *</label><input id="mr-title" value="${valAttr(it?.title || '')}"></div>
    <div class="form-group"><label>Nội dung *</label><textarea id="mr-content" rows="8">${esc(it?.content || '')}</textarea></div>
    <div class="form-group"><label>Category</label><input id="mr-cat" value="${valAttr(it?.category || '')}"></div>
    <div class="form-group"><label>Day</label><input type="number" id="mr-day" value="${it?.day_number || 1}"></div>
    <div class="form-group"><label>Questions (JSON)</label><textarea id="mr-qs" rows="8" style="font-family:monospace;font-size:12px">${esc(qs)}</textarea></div>
    <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Hủy</button>
    <button class="btn btn-primary" onclick="saveReading(${it?.id || 0})">${e ? 'Cập nhật' : 'Thêm'}</button></div>`);
}

function saveReading(id) {
  const questions = parseQuestionsField(gv('mr-qs'));
  if (questions === null) return;
  const body = { title: gv('mr-title'), content: gv('mr-content'), category: gv('mr-cat'), day_number: parseInt(gv('mr-day')) || 1, questions };
  if (!body.title || !body.content) { alert('Nhập tiêu đề và nội dung!'); return; }
  fetch(id ? `/api/admin/reading/${id}` : '/api/admin/reading', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(r => r.json()).then(d => { if (d.error) { alert(d.error); return; } closeModal(); loadReading(); loadDashboard(); });
}

function showListeningForm(it) {
  const e = !!it;
  const qs = JSON.stringify(it?.questions || [], null, 2);
  openModal(`<button class="close-modal" onclick="closeModal()">✕</button>
    <h2>${e ? 'Sửa' : 'Thêm'} Bài Nghe</h2>
    <div class="form-group"><label>Tiêu đề *</label><input id="mli-title" value="${valAttr(it?.title || '')}"></div>
    <div class="form-group"><label>Dialogue *</label><textarea id="mli-dialogue" rows="8">${esc(it?.dialogue || '')}</textarea></div>
    <div class="form-group"><label>Category</label><input id="mli-cat" value="${valAttr(it?.category || '')}"></div>
    <div class="form-group"><label>Day</label><input type="number" id="mli-day" value="${it?.day_number || 1}"></div>
    <div class="form-group"><label>Questions (JSON)</label><textarea id="mli-qs" rows="8" style="font-family:monospace;font-size:12px">${esc(qs)}</textarea></div>
    <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Hủy</button>
    <button class="btn btn-primary" onclick="saveListening(${it?.id || 0})">${e ? 'Cập nhật' : 'Thêm'}</button></div>`);
}

function saveListening(id) {
  const questions = parseQuestionsField(gv('mli-qs'));
  if (questions === null) return;
  const body = { title: gv('mli-title'), dialogue: gv('mli-dialogue'), category: gv('mli-cat'), day_number: parseInt(gv('mli-day')) || 1, questions };
  if (!body.title || !body.dialogue) { alert('Nhập tiêu đề và dialogue!'); return; }
  fetch(id ? `/api/admin/listening/${id}` : '/api/admin/listening', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(r => r.json()).then(d => { if (d.error) { alert(d.error); return; } closeModal(); loadListening(); loadDashboard(); });
}

function showSpeakingForm(it) {
  const e = !!it;
  openModal(`<button class="close-modal" onclick="closeModal()">✕</button>
    <h2>${e ? 'Sửa' : 'Thêm'} Chủ Đề Speaking</h2>
    <div class="form-group"><label>Prompt *</label><textarea id="ms-prompt" rows="4">${esc(it?.prompt || '')}</textarea></div>
    <div class="form-group"><label>Key phrases</label><input id="ms-keys" value="${valAttr(it?.key_phrases || '')}"></div>
    <div class="form-group"><label>Sample answer</label><textarea id="ms-sample" rows="4">${esc(it?.sample_answer || '')}</textarea></div>
    <div class="form-group"><label>Category</label><input id="ms-cat" value="${valAttr(it?.category || '')}"></div>
    <div class="form-group"><label>Day</label><input type="number" id="ms-day" value="${it?.day_number || 1}"></div>
    <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Hủy</button>
    <button class="btn btn-primary" onclick="saveSpeaking(${it?.id || 0})">${e ? 'Cập nhật' : 'Thêm'}</button></div>`);
}

function saveSpeaking(id) {
  const body = { prompt: gv('ms-prompt'), key_phrases: gv('ms-keys'), sample_answer: gv('ms-sample'), category: gv('ms-cat'), day_number: parseInt(gv('ms-day')) || 1 };
  if (!body.prompt) { alert('Nhập prompt!'); return; }
  fetch(id ? `/api/admin/speaking/${id}` : '/api/admin/speaking', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(r => r.json()).then(d => { if (d.error) { alert(d.error); return; } closeModal(); loadSpeaking(); loadDashboard(); });
}

function showWritingForm(it) {
  const e = !!it;
  openModal(`<button class="close-modal" onclick="closeModal()">✕</button>
    <h2>${e ? 'Sửa' : 'Thêm'} Đề Writing</h2>
    <div class="form-group"><label>Tiêu đề *</label><input id="mw-title" value="${valAttr(it?.title || '')}"></div>
    <div class="form-group"><label>Prompt *</label><textarea id="mw-prompt" rows="5">${esc(it?.prompt || '')}</textarea></div>
    <div class="form-group"><label>Sample answer</label><textarea id="mw-sample" rows="4">${esc(it?.sample_answer || '')}</textarea></div>
    <div class="form-group"><label>Category</label><input id="mw-cat" value="${valAttr(it?.category || '')}"></div>
    <div class="form-group"><label>Word limit</label><input type="number" id="mw-limit" value="${it?.word_limit || 150}"></div>
    <div class="form-group"><label>Day</label><input type="number" id="mw-day" value="${it?.day_number || 1}"></div>
    <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Hủy</button>
    <button class="btn btn-primary" onclick="saveWriting(${it?.id || 0})">${e ? 'Cập nhật' : 'Thêm'}</button></div>`);
}

function saveWriting(id) {
  const body = { title: gv('mw-title'), prompt: gv('mw-prompt'), sample_answer: gv('mw-sample'), category: gv('mw-cat'), word_limit: parseInt(gv('mw-limit')) || 150, day_number: parseInt(gv('mw-day')) || 1 };
  if (!body.title || !body.prompt) { alert('Nhập tiêu đề và prompt!'); return; }
  fetch(id ? `/api/admin/writing/${id}` : '/api/admin/writing', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(r => r.json()).then(d => { if (d.error) { alert(d.error); return; } closeModal(); loadWriting(); loadDashboard(); });
}
