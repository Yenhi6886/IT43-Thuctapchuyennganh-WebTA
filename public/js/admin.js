document.addEventListener('DOMContentLoaded', () => {
  // Auth check
  const saved = localStorage.getItem('user');
  const currentUser = saved ? JSON.parse(saved) : null;
  if (!currentUser || currentUser.role !== 'role_admin') { window.location.href = '/'; return; }

  document.getElementById('admin-name').textContent = currentUser.display_name || 'Admin';

  const sidebar = document.getElementById('sidebar');
  document.getElementById('toggle-sidebar').addEventListener('click', () => {
    window.innerWidth <= 768 ? sidebar.classList.toggle('mobile-open') : sidebar.classList.toggle('collapsed');
  });

  // Navigation
  const navLinks = document.querySelectorAll('.nav-links li:not(.logout)');
  const views = document.querySelectorAll('.view');
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      navLinks.forEach(l => l.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const viewId = `view-${e.currentTarget.dataset.view}`;
      document.getElementById(viewId).classList.add('active');
      if (window.innerWidth <= 768) sidebar.classList.remove('mobile-open');
      loadView(e.currentTarget.dataset.view);
    });
  });

  loadView('dashboard');
});

function loadView(v) {
  const loaders = { dashboard: loadDashboard, users: loadUsers, vocabulary: loadVocabulary, grammar: loadGrammar, exercises: loadReading, listening: loadListening, speaking: loadSpeaking, writing: loadWriting, roles: loadRoles };
  (loaders[v] || loadDashboard)();
}

// ==================== MODAL ====================
function openModal(html) { document.getElementById('modal-content').innerHTML = html; document.getElementById('modal-overlay').classList.remove('hidden'); }
function closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); }
document.addEventListener('click', e => { if (e.target.id === 'modal-overlay') closeModal(); });

// ==================== DASHBOARD ====================
function loadDashboard() {
  fetch('/api/admin/dashboard').then(r => r.json()).then(d => {
    setText('stat-visits', d.totalVisits);
    setText('stat-users', d.totalUsers);
    setText('stat-vocab', d.totalVocab);
    setText('stat-tests', d.totalTests);
    setText('stat-grammar', d.totalGrammar);
    setText('stat-reading', d.totalReading);
    setText('stat-listening', d.totalListening);
    setText('stat-speaking', d.totalSpeaking);
  }).catch(e => console.error(e));
}

// ==================== USERS ====================
function loadUsers() {
  const tbody = document.getElementById('users-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="text-center">Đang tải...</td></tr>';
  fetch('/api/admin/users').then(r => r.json()).then(users => {
    tbody.innerHTML = '';
    if (!users.length) { tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không có user nào.</td></tr>'; return; }
    users.forEach(u => {
      const roleName = u.role === 'role_admin' ? 'Admin' : (u.role === 'role_teacher' ? 'Teacher' : 'Student');
      const roleColor = roleName === 'Admin' ? '#f59e0b' : roleName === 'Teacher' ? '#4f46e5' : '#10b981';
      tbody.innerHTML += `<tr>
        <td><strong>${u.display_name || u.username}</strong></td>
        <td class="text-muted">@${u.username}</td>
        <td style="color:${roleColor};font-weight:700">${roleName}</td>
        <td><span style="background:#e5e7eb;padding:2px 8px;border-radius:12px;font-size:0.8rem">${u.english_level || 'N/A'}</span></td>
        <td><i class="fa-solid fa-fire" style="color:orange"></i> ${u.streak_days || 0}</td>
        <td>
          <select onchange="updateUserRole('${u.id}', this.value)" style="padding:4px 8px;border-radius:6px;border:1px solid #e5e7eb;font-size:0.8rem">
            <option value="user" ${u.role!=='role_admin'&&u.role!=='role_teacher'?'selected':''}>Student</option>
            <option value="role_teacher" ${u.role==='role_teacher'?'selected':''}>Teacher</option>
            <option value="role_admin" ${u.role==='role_admin'?'selected':''}>Admin</option>
          </select>
          <button class="btn btn-icon danger" onclick="deleteUser('${u.id}')"><i class="fa-solid fa-trash"></i></button>
        </td></tr>`;
    });
  });
}

function updateUserRole(id, role) {
  fetch(`/api/admin/users/${id}/role`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) })
    .then(r => r.json()).then(() => loadUsers());
}

function deleteUser(id) {
  if (!confirm('Xóa user này? Tất cả dữ liệu học tập sẽ bị mất!')) return;
  fetch(`/api/admin/users/${id}`, { method: 'DELETE' }).then(r => r.json()).then(() => { loadUsers(); loadDashboard(); });
}

// ==================== VOCABULARY ====================
function loadVocabulary() {
  // Load categories for filter
  fetch('/api/admin/vocabulary/categories').then(r => r.json()).then(cats => {
    const sel = document.getElementById('vocab-cat-filter');
    const currentVal = sel.value;
    sel.innerHTML = '<option value="">Tất cả danh mục</option>';
    cats.forEach(c => sel.innerHTML += `<option value="${c.category}" ${c.category===currentVal?'selected':''}>${c.category} (${c.count})</option>`);
  });

  const cat = document.getElementById('vocab-cat-filter').value;
  const search = document.getElementById('vocab-search').value;
  let url = '/api/admin/vocabulary?';
  if (cat) url += `category=${encodeURIComponent(cat)}&`;
  if (search) url += `search=${encodeURIComponent(search)}&`;

  const tbody = document.getElementById('vocab-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="text-center">Đang tải...</td></tr>';
  fetch(url).then(r => r.json()).then(data => {
    tbody.innerHTML = '';
    if (!data.length) { tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không có từ vựng.</td></tr>'; return; }
    data.forEach(w => {
      tbody.innerHTML += `<tr>
        <td><strong>${w.term}</strong></td>
        <td>${w.word_type || 'n.'}</td>
        <td title="${w.definition_en || ''}">${w.definition_vi || ''}</td>
        <td><span style="background:#e0e7ff;color:#4f46e5;padding:3px 8px;border-radius:10px;font-size:0.75rem">${w.category}</span></td>
        <td>Day ${w.day_number}</td>
        <td style="min-width:90px">
          <button class="btn btn-icon" onclick='editVocab(${JSON.stringify(w)})'><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-icon danger" onclick="deleteVocab(${w.id})"><i class="fa-solid fa-trash"></i></button>
        </td></tr>`;
    });
  });
}

function showAddVocabModal(v) {
  const isEdit = !!v;
  openModal(`<button class="close-modal" onclick="closeModal()">✕</button>
    <h2>${isEdit ? 'Sửa Từ Vựng' : 'Thêm Từ Vựng Mới'}</h2>
    <div class="form-group"><label>Từ vựng (EN)</label><input id="m-term" value="${v?.term||''}"></div>
    <div class="form-group"><label>Loại từ</label><input id="m-type" value="${v?.word_type||'n.'}"></div>
    <div class="form-group"><label>Nghĩa (VN)</label><input id="m-defvi" value="${v?.definition_vi||''}"></div>
    <div class="form-group"><label>Nghĩa (EN)</label><input id="m-defen" value="${v?.definition_en||''}"></div>
    <div class="form-group"><label>Category</label><input id="m-cat" value="${v?.category||''}"></div>
    <div class="form-group"><label>Ví dụ 1</label><input id="m-ex1" value="${v?.example1||''}"></div>
    <div class="form-group"><label>Ví dụ 2</label><input id="m-ex2" value="${v?.example2||''}"></div>
    <div class="form-group"><label>Ví dụ 3</label><input id="m-ex3" value="${v?.example3||''}"></div>
    <div class="form-group"><label>Day Number</label><input type="number" id="m-day" value="${v?.day_number||1}"></div>
    <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Hủy</button>
    <button class="btn btn-primary" onclick="saveVocab(${v?.id||0})">${isEdit?'Cập nhật':'Thêm'}</button></div>`);
}
function editVocab(v) { showAddVocabModal(v); }

function saveVocab(id) {
  const body = { term: gv('m-term'), word_type: gv('m-type'), definition_vi: gv('m-defvi'), definition_en: gv('m-defen'), category: gv('m-cat'), example1: gv('m-ex1'), example2: gv('m-ex2'), example3: gv('m-ex3'), day_number: parseInt(gv('m-day')) || 1 };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/admin/vocabulary/${id}` : '/api/admin/vocabulary';
  fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(r => r.json()).then(() => { closeModal(); loadVocabulary(); loadDashboard(); });
}

function deleteVocab(id) {
  if (!confirm('Xóa từ vựng này?')) return;
  fetch(`/api/admin/vocabulary/${id}`, { method: 'DELETE' }).then(() => { loadVocabulary(); loadDashboard(); });
}

// ==================== GRAMMAR (Lessons + Exercises) ====================
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

function loadGrammar() { loadGrammarLessons(); }

function loadGrammarLessons() {
  const area = document.getElementById('grammar-lessons-area');
  area.innerHTML = '<p class="text-center">Đang tải...</p>';
  fetch('/api/admin/grammar-lessons').then(r => r.json()).then(lessons => {
    if (!lessons.length) { area.innerHTML = '<div class="empty-state"><p>Chưa có bài lý thuyết nào.</p></div>'; return; }
    area.innerHTML = `<div style="display:flex;justify-content:flex-end;margin-bottom:1rem"><button class="btn btn-primary" onclick="showAddLessonModal()"><i class="fa-solid fa-plus"></i> Thêm Bài Lý Thuyết</button></div>` +
    lessons.map(l => `<div class="admin-item">
      <div style="min-width:40px;height:40px;border-radius:50%;background:#e0e7ff;display:flex;align-items:center;justify-content:center;font-weight:800;color:#4f46e5">D${l.day_number}</div>
      <div class="item-body">
        <h4>📖 ${l.title}</h4>
        <p>${l.content.substring(0, 150)}...</p>
        <div class="item-meta"><span>Topic: ${l.topic}</span><span>Day ${l.day_number}</span></div>
      </div>
      <div class="item-actions">
        <button class="btn btn-icon" onclick='editLesson(${JSON.stringify(l).replace(/'/g,"&#39;")})'><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-icon danger" onclick="deleteLesson(${l.id})"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`).join('');
  });
}

function showAddLessonModal(l) {
  const isEdit = !!l;
  openModal(`<button class="close-modal" onclick="closeModal()">✕</button>
    <h2>${isEdit ? 'Sửa Bài Lý Thuyết' : 'Thêm Bài Lý Thuyết'}</h2>
    <div class="form-group"><label>Topic (ví dụ: Conditionals)</label><input id="ml-topic" value="${l?.topic||''}"></div>
    <div class="form-group"><label>Tiêu đề</label><input id="ml-title" value="${l?.title||''}"></div>
    <div class="form-group"><label>Nội dung lý thuyết</label><textarea id="ml-content" rows="8">${l?.content||''}</textarea></div>
    <div class="form-group"><label>Ví dụ minh họa</label><textarea id="ml-examples" rows="4">${l?.examples||''}</textarea></div>
    <div class="form-group"><label>Mẹo / Tips</label><textarea id="ml-tips" rows="2">${l?.tips||''}</textarea></div>
    <div class="form-group"><label>Day Number</label><input type="number" id="ml-day" value="${l?.day_number||1}"></div>
    <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Hủy</button>
    <button class="btn btn-primary" onclick="saveLesson(${l?.id||0})">${isEdit?'Cập nhật':'Thêm'}</button></div>`);
}
function editLesson(l) { showAddLessonModal(l); }

function saveLesson(id) {
  const body = { topic: gv('ml-topic'), title: gv('ml-title'), content: gv('ml-content'), examples: gv('ml-examples'), tips: gv('ml-tips'), day_number: parseInt(gv('ml-day')) || 1 };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/admin/grammar-lessons/${id}` : '/api/admin/grammar-lessons';
  fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(r => r.json()).then(() => { closeModal(); loadGrammarLessons(); });
}

function deleteLesson(id) {
  if (!confirm('Xóa bài lý thuyết này?')) return;
  fetch(`/api/admin/grammar-lessons/${id}`, { method: 'DELETE' }).then(() => loadGrammarLessons());
}

function loadGrammarExercises() {
  const area = document.getElementById('grammar-exercises-area');
  area.innerHTML = '<p class="text-center">Đang tải...</p>';
  fetch('/api/admin/grammar').then(r => r.json()).then(exs => {
    if (!exs.length) { area.innerHTML = '<div class="empty-state"><p>Chưa có bài tập nào.</p></div>'; return; }
    area.innerHTML = `<div style="display:flex;justify-content:flex-end;margin-bottom:1rem"><button class="btn btn-primary" onclick="showAddExerciseModal()"><i class="fa-solid fa-plus"></i> Thêm Câu Hỏi</button></div>` +
    exs.map((ex, i) => `<div class="admin-item">
      <div style="min-width:40px;height:40px;border-radius:50%;background:#fef3c7;display:flex;align-items:center;justify-content:center;font-weight:800;color:#d97706">${i+1}</div>
      <div class="item-body">
        <h4>${ex.question}</h4>
        <p>Đáp án: <strong>${ex.correct_answer}</strong> | Options: ${(ex.options||[]).join(', ')}</p>
        <div class="item-meta"><span>${ex.grammar_topic||''}</span><span>Day ${ex.day_number}</span></div>
      </div>
      <div class="item-actions">
        <button class="btn btn-icon danger" onclick="deleteExercise(${ex.id})"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`).join('');
  });
}

function showAddExerciseModal() {
  openModal(`<button class="close-modal" onclick="closeModal()">✕</button>
    <h2>Thêm Câu Hỏi Ngữ Pháp</h2>
    <div class="form-group"><label>Câu hỏi</label><input id="me-q" placeholder="The team ___ on this feature since Monday."></div>
    <div class="form-group"><label>Đáp án A</label><input id="me-a"></div>
    <div class="form-group"><label>Đáp án B</label><input id="me-b"></div>
    <div class="form-group"><label>Đáp án C</label><input id="me-c"></div>
    <div class="form-group"><label>Đáp án D</label><input id="me-d"></div>
    <div class="form-group"><label>Đáp án đúng</label><input id="me-correct" placeholder="Nhập chính xác text đáp án đúng"></div>
    <div class="form-group"><label>Giải thích</label><textarea id="me-expl"></textarea></div>
    <div class="form-group"><label>Grammar Topic</label><input id="me-topic" placeholder="Tenses"></div>
    <div class="form-group"><label>Day Number</label><input type="number" id="me-day" value="1"></div>
    <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Hủy</button>
    <button class="btn btn-primary" onclick="saveExercise()">Thêm</button></div>`);
}

function saveExercise() {
  const body = { question: gv('me-q'), options: [gv('me-a'), gv('me-b'), gv('me-c'), gv('me-d')], correct_answer: gv('me-correct'), explanation: gv('me-expl'), grammar_topic: gv('me-topic'), day_number: parseInt(gv('me-day')) || 1 };
  fetch('/api/admin/grammar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(r => r.json()).then(() => { closeModal(); loadGrammarExercises(); loadDashboard(); });
}

function deleteExercise(id) {
  if (!confirm('Xóa câu hỏi này?')) return;
  fetch(`/api/admin/grammar/${id}`, { method: 'DELETE' }).then(() => { loadGrammarExercises(); loadDashboard(); });
}

// ==================== READING ====================
function loadReading() {
  const area = document.getElementById('reading-list');
  area.innerHTML = '<p class="text-center">Đang tải...</p>';
  fetch('/api/admin/reading').then(r => r.json()).then(items => {
    if (!items.length) { area.innerHTML = '<div class="empty-state"><p>Chưa có bài đọc nào.</p></div>'; return; }
    area.innerHTML = items.map(item => `<div class="admin-item">
      <div style="min-width:40px;height:40px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;color:#2563eb"><i class="fa-solid fa-book-open-reader"></i></div>
      <div class="item-body">
        <h4>${item.title}</h4>
        <p>${(item.content||'').substring(0, 200)}...</p>
        <div class="item-meta"><span>${item.category||''}</span><span>Day ${item.day_number}</span><span>${(item.questions||[]).length} câu hỏi</span></div>
      </div>
      <div class="item-actions">
        <button class="btn btn-icon danger" onclick="deleteReading(${item.id})"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`).join('');
  });
}

function deleteReading(id) {
  if (!confirm('Xóa bài đọc này?')) return;
  fetch(`/api/admin/reading/${id}`, { method: 'DELETE' }).then(() => { loadReading(); loadDashboard(); });
}

// ==================== LISTENING ====================
function loadListening() {
  const area = document.getElementById('listening-list');
  area.innerHTML = '<p class="text-center">Đang tải...</p>';
  fetch('/api/admin/listening').then(r => r.json()).then(items => {
    if (!items.length) { area.innerHTML = '<div class="empty-state"><p>Chưa có bài nghe nào.</p></div>'; return; }
    area.innerHTML = items.map(item => `<div class="admin-item">
      <div style="min-width:40px;height:40px;border-radius:50%;background:#fce4ec;display:flex;align-items:center;justify-content:center;color:#e11d48"><i class="fa-solid fa-headphones"></i></div>
      <div class="item-body">
        <h4>🎧 ${item.title}</h4>
        <p>${(item.dialogue||'').substring(0, 200)}...</p>
        <div class="item-meta"><span>${item.category||''}</span><span>Day ${item.day_number}</span><span>${(item.questions||[]).length} câu hỏi</span></div>
      </div>
      <div class="item-actions">
        <button class="btn btn-icon danger" onclick="deleteListening(${item.id})"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`).join('');
  });
}

function deleteListening(id) {
  if (!confirm('Xóa bài nghe này?')) return;
  fetch(`/api/admin/listening/${id}`, { method: 'DELETE' }).then(() => { loadListening(); loadDashboard(); });
}

// ==================== SPEAKING ====================
function loadSpeaking() {
  const area = document.getElementById('speaking-list');
  area.innerHTML = '<p class="text-center">Đang tải...</p>';
  fetch('/api/admin/speaking').then(r => r.json()).then(items => {
    if (!items.length) { area.innerHTML = '<div class="empty-state"><p>Chưa có chủ đề nói nào.</p></div>'; return; }
    area.innerHTML = items.map(item => `<div class="admin-item">
      <div style="min-width:40px;height:40px;border-radius:50%;background:#d1fae5;display:flex;align-items:center;justify-content:center;color:#059669"><i class="fa-solid fa-microphone"></i></div>
      <div class="item-body">
        <h4>🎤 ${item.prompt}</h4>
        <p>Key phrases: ${item.key_phrases || 'N/A'}</p>
        <div class="item-meta"><span>${item.category||''}</span><span>Day ${item.day_number}</span></div>
      </div>
      <div class="item-actions">
        <button class="btn btn-icon danger" onclick="deleteSpeaking(${item.id})"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`).join('');
  });
}

function deleteSpeaking(id) {
  if (!confirm('Xóa chủ đề nói này?')) return;
  fetch(`/api/admin/speaking/${id}`, { method: 'DELETE' }).then(() => { loadSpeaking(); loadDashboard(); });
}

// ==================== WRITING ====================
function loadWriting() {
  const area = document.getElementById('writing-list');
  area.innerHTML = '<p class="text-center">Đang tải...</p>';
  fetch('/api/admin/writing').then(r => r.json()).then(items => {
    if (!items.length) { area.innerHTML = '<div class="empty-state"><p>Chưa có đề viết nào.</p></div>'; return; }
    area.innerHTML = items.map(item => `<div class="admin-item">
      <div style="min-width:40px;height:40px;border-radius:50%;background:#fef3c7;display:flex;align-items:center;justify-content:center;color:#d97706"><i class="fa-solid fa-file-pen"></i></div>
      <div class="item-body">
        <h4>✍️ ${item.title}</h4>
        <p>${(item.prompt||'').substring(0, 200)}...</p>
        <div class="item-meta"><span>${item.category||''}</span><span>Day ${item.day_number}</span><span>Limit: ${item.word_limit} words</span></div>
      </div>
      <div class="item-actions">
        <button class="btn btn-icon danger" onclick="deleteWriting(${item.id})"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`).join('');
  });
}

function deleteWriting(id) {
  if (!confirm('Xóa đề viết này?')) return;
  fetch(`/api/admin/writing/${id}`, { method: 'DELETE' }).then(() => { loadWriting(); loadDashboard(); });
}

// ==================== ROLES ====================
function loadRoles() {
  fetch('/api/admin/users').then(r => r.json()).then(users => {
    const admins = users.filter(u => u.role === 'role_admin');
    const teachers = users.filter(u => u.role === 'role_teacher');
    const students = users.filter(u => u.role !== 'role_admin' && u.role !== 'role_teacher');
    document.getElementById('roles-grid').innerHTML = `
      <div class="role-card admin"><i class="fa-solid fa-crown role-icon"></i><h3>Administrator</h3><p>Full quyền quản trị toàn bộ hệ thống.</p><span>${admins.length} Users</span></div>
      <div class="role-card teacher"><i class="fa-solid fa-chalkboard-user role-icon"></i><h3>Teacher</h3><p>Tạo bài tập, chấm điểm, upload đề.</p><span>${teachers.length} Users</span></div>
      <div class="role-card student"><i class="fa-solid fa-user-graduate role-icon"></i><h3>Student</h3><p>Học tập, tracking tiến độ.</p><span>${students.length} Users</span></div>`;
  });
}

// ==================== HELPERS ====================
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = typeof val === 'number' ? val.toLocaleString() : (val || '0'); }
function gv(id) { return document.getElementById(id)?.value || ''; }
