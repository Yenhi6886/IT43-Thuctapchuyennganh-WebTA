// ===== STATE =====
let currentUser = null;
let currentPage = 'dashboard';
let currentDay = 1;

// ===== COMPANY DATA =====
const COMPANIES = [
  { name: 'FPT Software', salary: '$800 - $2,500/mo', rating: 3.8, stars: '★★★★☆', tags: ['Java', 'Spring Boot', 'AWS', 'Outsource'], review: 'Môi trường tốt cho fresher. Lương khởi điểm thấp nhưng có nhiều cơ hội training và đi onsite. Interview: 2-3 vòng, hỏi OOP, SQL, thuật toán cơ bản.', interviewQs: ['Tell me about OOP principles', 'What is polymorphism?', 'Write a SQL query with JOIN', 'Explain REST API'] },
  { name: 'VNG Corporation', salary: '$1,200 - $4,000/mo', rating: 4.2, stars: '★★★★☆', tags: ['Java', 'Go', 'Microservices', 'Gaming'], review: 'Lương competitive, văn hóa startup. Interview khá khó, focus vào system design và coding challenge. Yêu cầu tiếng Anh cao.', interviewQs: ['Design a URL shortener', 'Explain CAP theorem', 'How does Kafka work?', 'System design for chat app'] },
  { name: 'Tiki', salary: '$1,000 - $3,500/mo', rating: 4.0, stars: '★★★★☆', tags: ['Java', 'ReactJS', 'Kafka', 'E-commerce'], review: 'E-commerce lớn, nhiều bài toán scale. Interview hỏi sâu về distributed systems, database optimization.', interviewQs: ['Design an e-commerce cart', 'Explain database indexing', 'How to handle race conditions?', 'Describe your microservices experience'] },
  { name: 'Shopee Vietnam', salary: '$1,500 - $5,000/mo', rating: 4.1, stars: '★★★★☆', tags: ['Java', 'Go', 'Redis', 'Docker'], review: 'Lương top thị trường, work-life balance vừa. Interview 4-5 vòng rất challenging, focus algorithms và system design.', interviewQs: ['Implement LRU cache', 'Design a payment system', 'Explain eventual consistency', 'Binary search variations'] },
  { name: 'NashTech', salary: '$900 - $2,800/mo', rating: 3.9, stars: '★★★★☆', tags: ['Java', '.NET', 'Angular', 'Agile'], review: 'Outsource UK, môi trường chuyên nghiệp. Tiếng Anh là requirement bắt buộc, daily meeting với khách hàng.', interviewQs: ['Describe your project experience', 'How do you handle deadlines?', 'Explain SOLID principles', 'What is dependency injection?'] },
  { name: 'KMS Technology', salary: '$1,000 - $3,200/mo', rating: 4.3, stars: '★★★★☆', tags: ['Java', 'ReactJS', 'AWS', 'Healthcare'], review: 'Văn hóa tốt, lương fair. Focus healthcare domain. Interview professional, hỏi cả technical và behavioral.', interviewQs: ['Tell me about yourself', 'Design a REST API', 'Explain Spring Boot annotations', 'How do you ensure code quality?'] },
  { name: 'Momo', salary: '$1,200 - $4,500/mo', rating: 4.0, stars: '★★★★☆', tags: ['Java', 'Kafka', 'Redis', 'Fintech'], review: 'Fintech top VN, bài toán transaction processing rất hay. Interview focus backend, distributed systems.', interviewQs: ['Design a digital wallet', 'How to handle concurrent transactions?', 'Explain ACID properties', 'Rate limiting strategies'] },
  { name: 'Axon Active', salary: '$1,100 - $3,000/mo', rating: 4.4, stars: '★★★★★', tags: ['Java', 'Agile', 'TDD', 'Swiss quality'], review: 'Outsource Thụy Sĩ, chất lượng code rất cao. Team nhỏ, agile thuần. Work-life balance tuyệt vời.', interviewQs: ['Explain TDD', 'What is clean code?', 'Pair programming experience?', 'How do you write unit tests?'] },
  { name: 'TMA Solutions', salary: '$800 - $2,300/mo', rating: 3.7, stars: '★★★★☆', tags: ['Java', 'C++', 'Embedded', 'Telecom'], review: 'Công ty outsource lâu đời, ổn định. Nhiều dự án telecom và embedded. Training tốt cho junior.', interviewQs: ['OOP in Java', 'Thread safety', 'Memory management', 'Network protocols'] },
  { name: 'Grab Vietnam', salary: '$2,000 - $6,000/mo', rating: 4.3, stars: '★★★★☆', tags: ['Go', 'Java', 'Kafka', 'Microservices'], review: 'Big tech, lương rất cao. Interview cực kỳ competitive: 5+ vòng, coding + system design + behavioral.', interviewQs: ['Design ride-sharing system', 'Implement consistent hashing', 'Explain microservices patterns', 'Leadership principles'] },
  { name: 'Ến (ến) Techcombank', salary: '$1,500 - $4,000/mo', rating: 3.9, stars: '★★★★☆', tags: ['Java', 'Spring', 'Oracle', 'Banking'], review: 'Digital banking, dự án core banking transformation. Interview hỏi về banking domain + technical skills.', interviewQs: ['Explain transaction processing', 'Database normalization', 'Security best practices', 'REST vs SOAP'] },
  { name: 'VNPAY', salary: '$1,000 - $3,500/mo', rating: 3.8, stars: '★★★★☆', tags: ['Java', 'Spring Boot', 'PostgreSQL', 'Payment'], review: 'Payment gateway lớn nhất VN. Nhiều bài toán real-time processing. Interview focus Java core + system design.', interviewQs: ['Design a payment gateway', 'Explain idempotency', 'How does 2PC work?', 'Java concurrency'] }
];

// ===== LANDING PAGE =====
function showLanding() {
  $('landingPage').classList.remove('hidden');
  $('authScreen').classList.add('hidden');
  $('appLayout').classList.add('hidden');
  $('menuToggle').classList.add('hidden');
  renderLandingCompanies();
}

function showAuthScreen(mode) {
  $('landingPage').classList.add('hidden');
  $('authScreen').classList.remove('hidden');
  $('appLayout').classList.add('hidden');
  if (mode === 'register') { showRegister(); }
  else showLogin();
}

function renderLandingCompanies() {
  const grid = $('companyGrid');
  if (!grid) return;
  grid.innerHTML = COMPANIES.slice(0, 6).map(c => `
    <div class="company-card" style="cursor:pointer" onclick="showCompanyPreview(${c.id || 0}, '${c.name.replace(/'/g, "\\'")}')">
      <h4>${c.name}</h4>
      <div class="company-salary">${c.salary}</div>
      <div class="company-rating">${c.stars} (${c.rating}/5)</div>
      <div class="company-tags">${c.tags.map(t => `<span class="company-tag">${t}</span>`).join('')}</div>
      <div class="company-review">${c.review.substring(0, 100)}...</div>
      <div style="margin-top:10px;color:var(--sky);font-weight:800;font-size:13px;display:flex;align-items:center;gap:4px">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:var(--sky);color:white;font-size:12px">→</span>
        ${t('comp.click.detail')}
      </div>
    </div>`).join('');
}

async function showCompanyPreview(companyId, companyName) {
  // Try to load from API - works for DB companies
  try {
    const data = await API.getCompanyDetail(companyId || 1);
    const c = data.company;
    const reviews = data.reviews;
    const stars = r => { const n = parseFloat(r) || 0; return '★'.repeat(Math.floor(n)) + (n % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(n)); };
    const diffColors = { Easy: 'badge-algo', Medium: 'badge-data', Hard: 'badge-hw' };

    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `<div style="background:white;border-radius:20px;max-width:700px;width:100%;max-height:85vh;overflow-y:auto;padding:32px;position:relative">
      <button onclick="this.closest('div[style*=fixed]').remove()" style="position:absolute;top:12px;right:16px;border:none;background:none;font-size:24px;cursor:pointer">✕</button>
      <h2 style="font-weight:900;color:var(--green-800);margin-bottom:4px">${c.name}</h2>
      <div style="color:var(--leaf-dark);font-weight:800;font-size:16px">${c.salary_range || ''}</div>
      <div style="color:var(--gold);font-size:16px;margin:4px 0">${stars(c.avg_rating || c.rating)} (${c.avg_rating || c.rating}/5) · ${c.rating_count || 0} ${t('comp.ratings')}</div>
      <div class="company-tags" style="margin:8px 0">${(c.tags || '').split(',').filter(Boolean).map(tag => `<span class="company-tag">${tag.trim()}</span>`).join('')}</div>
      <p style="color:var(--text-secondary);margin-bottom:20px">${c.description || ''}</p>
      <h3 style="font-weight:800;color:var(--green-800);margin-bottom:12px">💬 ${reviews.length} ${t('comp.from.community')}</h3>
      ${reviews.length ? reviews.map(r => `
        <div style="border:2px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;border-left:4px solid ${r.result === 'Passed' ? 'var(--leaf)' : r.result === 'Failed' ? 'var(--fire)' : 'var(--gold)'}">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
            <span style="font-weight:800">${r.is_anonymous ? '🕵️ Anonymous' : '👤 ' + r.display_name}</span>
            <div style="display:flex;gap:6px"><span class="badge ${diffColors[r.difficulty] || 'badge-data'}">${r.difficulty}</span>${r.position ? `<span class="badge badge-algo">${r.position}</span>` : ''}</div>
          </div>
          <h4 style="margin-top:8px;font-size:15px">❓ ${r.interview_question}</h4>
          ${r.suggested_answer ? `<div style="margin-top:8px;padding:12px;background:var(--leaf-bg);border-radius:8px;font-size:13px"><strong>💡 ${t('speak.sample.title')}:</strong> ${r.suggested_answer}</div>` : ''}
        </div>`).join('') : `<p style="color:var(--text-muted);text-align:center">${t('comp.no.questions')}</p>`}
      <div style="margin-top:20px;text-align:center">
        <button class="btn btn-primary" onclick="this.closest('div[style*=fixed]').remove();showAuthScreen('register')">${t('landing.start')}</button>
      </div>
    </div>`;
    document.body.appendChild(modal);
  } catch (e) {
    // Fallback: show auth prompt
    showAuthScreen('login');
    toast(t('auth.login.btn') + ' to view details', 'info');
  }
}

// ===== HELPERS =====
function toast(msg, type = 'info') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function $(id) { return document.getElementById(id); }
function toggleSidebar() { 
  $('sidebar').classList.toggle('open'); 
  const overlay = $('sidebarOverlay');
  if (overlay) overlay.classList.toggle('active');
}

// ===== AUTH =====
function showRegister() { $('loginForm').classList.add('hidden'); $('registerForm').classList.remove('hidden'); }
function showLogin() { $('registerForm').classList.add('hidden'); $('loginForm').classList.remove('hidden'); }

async function login() {
  try {
    const u = $('loginUsername').value.trim();
    const p = $('loginPassword').value;
    if (!u || !p) return toast(t('general.fill.fields'), 'error');
    currentUser = await API.login(u, p);
    localStorage.setItem('user', JSON.stringify(currentUser));
    if (currentUser.language) i18n.setLang(currentUser.language);
    if (redirectAdminToPanel()) return;
    enterApp();
  } catch (e) {
    if (e.message.toLowerCase().includes('password') || e.message.toLowerCase().includes('user') || e.message.toLowerCase().includes('invalid')) {
      alert(t('auth.login.error'));
    } else {
      toast(e.message, 'error');
    }
  }
}

async function register() {
  try {
    const n = $('regName').value.trim();
    const u = $('regUsername').value.trim();
    const p = $('regPassword').value;
    if (!u || !p) return toast(t('general.fill.fields'), 'error');
    currentUser = await API.register(u, p, n, 'Intermediate', '', i18n.currentLang, []);
    localStorage.setItem('user', JSON.stringify(currentUser));
    // Show onboarding popup to choose level & topics (same as social login)
    showOnboardingPopup();
  } catch (e) { toast(e.message, 'error'); }
}

// ===== SOCIAL LOGIN =====
async function loginWithGoogle() {
  try {
    if (!window.google?.accounts?.oauth2) { toast(t('auth.social.google.not.ready'), 'error'); return; }
    
    // Fetch the credentials from /api/config
    const configRes = await fetch('/api/config');
    const { googleClientId } = await configRes.json();
    if (!googleClientId) {
      toast(t('auth.social.no.config'), 'error');
      return;
    }
    
    const client = google.accounts.oauth2.initTokenClient({
      client_id: googleClientId,
      scope: 'email profile',
      callback: async (response) => {
        if (response.error) { toast(t('auth.social.google.failed'), 'error'); return; }
        try {
          const result = await API.request('POST', '/api/auth/social', { provider: 'google', token: response.access_token });
          currentUser = result;
          localStorage.setItem('user', JSON.stringify(currentUser));
          if (currentUser.language) i18n.setLang(currentUser.language);
          if (redirectAdminToPanel()) return;
          if (result.isNewUser) {
            showOnboardingPopup();
          } else {
            enterApp();
          }
        } catch (e) { toast(e.message, 'error'); }
      }
    });
    client.requestAccessToken();
  } catch (e) { toast(t('auth.social.google.failed') + ': ' + e.message, 'error'); }
}

async function loginWithFacebook() {
  try {
    if (!window.FB) { toast(t('auth.social.fb.not.ready'), 'error'); return; }
    FB.login(function(response) {
      if (response.authResponse) {
        handleFacebookLogin(response.authResponse.accessToken);
      }
    }, { scope: 'email,public_profile' });
  } catch (e) { toast(t('auth.social.fb.failed') + ': ' + e.message, 'error'); }
}

async function handleFacebookLogin(accessToken) {
  try {
    const result = await API.request('POST', '/api/auth/social', { provider: 'facebook', token: accessToken });
    currentUser = result;
    localStorage.setItem('user', JSON.stringify(currentUser));
    if (currentUser.language) i18n.setLang(currentUser.language);
    if (redirectAdminToPanel()) return;
    if (result.isNewUser) {
      showOnboardingPopup();
    } else {
      enterApp();
    }
  } catch (e) { toast(e.message, 'error'); }
}

// ===== ONBOARDING POPUP (after first registration or social login) =====
async function showOnboardingPopup() {
  $('authScreen').classList.add('hidden');
  $('landingPage').classList.add('hidden');
  $('appLayout').classList.add('hidden');
  
  let topics = [];
  try { topics = await API.getTopics(); } catch(e) {}
  
  const overlay = document.createElement('div');
  overlay.id = 'onboardingOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `
    <div style="background:white;border-radius:24px;max-width:540px;width:100%;max-height:90vh;overflow-y:auto;padding:36px;text-align:center">
      <h2 style="font-size:28px;font-weight:900;color:var(--green-900);margin-bottom:8px">${t('onboard.welcome')} ${currentUser.display_name || 'bạn'}!</h2>
      <p style="color:var(--text-secondary);margin-bottom:24px">${t('onboard.subtitle')}</p>
      
      <div style="text-align:left;margin-bottom:20px">
        <label style="font-weight:700;font-size:14px;margin-bottom:8px;display:block">${t('onboard.level.label')}</label>
        <select id="onboardLevel" style="width:100%;padding:12px;border-radius:12px;border:2px solid var(--border);font-size:15px">
          <option value="Beginner">${t('onboard.level.beginner')}</option>
          <option value="Intermediate" selected>${t('onboard.level.intermediate')}</option>
          <option value="Advanced">${t('onboard.level.advanced')}</option>
        </select>
      </div>
      
      <div style="text-align:left;margin-bottom:24px">
        <label style="font-weight:700;font-size:14px;margin-bottom:8px;display:block">${t('onboard.topic.label')}</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${topics.map(tp => `
            <button type="button" class="topic-chip" data-topic-id="${tp.id}" onclick="this.classList.toggle('selected')" style="--chip-color:${tp.color||'#4f46e5'}">
              <span class="topic-chip-icon">${tp.icon||'🌍'}</span>
              <span class="topic-chip-name">${tp.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
      
      <button class="btn btn-primary btn-lg btn-block" onclick="saveOnboarding()" style="font-size:16px">${t('onboard.start')}</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

async function saveOnboarding() {
  const level = document.getElementById('onboardLevel')?.value || 'Intermediate';
  const selectedTopics = Array.from(document.querySelectorAll('#onboardingOverlay .topic-chip.selected')).map(c => parseInt(c.dataset.topicId));
  
  if (selectedTopics.length === 0) { toast(t('auth.topic.required'), 'error'); return; }
  
  try {
    // Update level
    await API.request('PUT', '/api/auth/language', { userId: currentUser.id, language: i18n.currentLang });
    // Update topics
    await API.updateTopics(currentUser.id, selectedTopics);
    // Update level in user record
    await API.request('PUT', '/api/auth/level', { userId: currentUser.id, level });
    
    currentUser.english_level = level;
    currentUser.topics = selectedTopics;
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    const overlay = document.getElementById('onboardingOverlay');
    if (overlay) overlay.remove();
    
    enterApp();
  } catch(e) { toast(e.message, 'error'); }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('user');
  showLanding();
}

/** Admin chỉ quản lý — không vào app học */
function redirectAdminToPanel() {
  if (currentUser && currentUser.role === 'role_admin') {
    window.location.href = '/admin.html';
    return true;
  }
  return false;
}

function enterApp() {
  if (redirectAdminToPanel()) return;
  $('landingPage').classList.add('hidden');
  $('authScreen').classList.add('hidden');
  $('appLayout').classList.remove('hidden');
  $('menuToggle').classList.remove('hidden');
  $('userDisplayName').textContent = currentUser.display_name || currentUser.username;
  
  // Show avatar or initial
  const avatarEl = $('userAvatar');
  if (currentUser.avatar) {
    avatarEl.innerHTML = `<img src="${currentUser.avatar}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
  } else {
    avatarEl.textContent = (currentUser.display_name || currentUser.username).charAt(0).toUpperCase();
  }
  
  $('userStreak').textContent = `🔥 ${currentUser.streak_days || 0} ${t('dash.streak.days')}`;
  i18n.updateStaticElements();
  
  // Check if email is required (no email set)
  if (!currentUser.email || currentUser.email.includes('@facebook.com')) {
    showEmailRequiredPopup();
  }
  
  // Setup study reminder notifications
  setupStudyReminder();
  
  const initialPage = location.pathname.substring(1) || 'dashboard';
  navigate(initialPage, true);
}

// ===== EMAIL REQUIRED POPUP =====
function showEmailRequiredPopup() {
  const overlay = document.createElement('div');
  overlay.id = 'emailRequiredOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `
    <div style="background:white;border-radius:24px;max-width:440px;width:100%;padding:36px;text-align:center">
      <div style="font-size:48px;margin-bottom:12px">📧</div>
      <h2 style="font-size:22px;font-weight:900;color:var(--green-900);margin-bottom:8px">${t('email.required.title') || 'Email Required'}</h2>
      <p style="color:var(--text-secondary);margin-bottom:24px;font-size:14px">${t('email.required.desc') || 'Please enter your email to continue using the app.'}</p>
      <input type="email" id="requiredEmailInput" placeholder="your@email.com" style="width:100%;padding:14px;border-radius:12px;border:2px solid var(--border);font-size:15px;margin-bottom:16px;box-sizing:border-box" />
      <button class="btn btn-primary btn-block" onclick="saveRequiredEmail()" style="font-size:16px;padding:14px">${t('email.required.save') || 'Continue'}</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

async function saveRequiredEmail() {
  const email = document.getElementById('requiredEmailInput')?.value?.trim();
  if (!email || !email.includes('@')) { toast(t('email.required.invalid') || 'Please enter a valid email', 'error'); return; }
  try {
    await API.request('PUT', '/api/auth/email', { userId: currentUser.id, email });
    currentUser.email = email;
    localStorage.setItem('user', JSON.stringify(currentUser));
    document.getElementById('emailRequiredOverlay')?.remove();
    toast(t('email.required.saved') || 'Email saved!', 'success');
  } catch (e) { toast(e.message, 'error'); }
}

// ===== STUDY REMINDER (8:30 PM) =====
function setupStudyReminder() {
  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  
  // Check every minute if it's 8:30 PM
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 20 && now.getMinutes() === 30) {
      // Only show once per day
      const lastReminder = localStorage.getItem('lastStudyReminder');
      const today = now.toISOString().split('T')[0];
      if (lastReminder !== today) {
        localStorage.setItem('lastStudyReminder', today);
        showStudyReminder();
      }
    }
  }, 60000);
}

function showStudyReminder() {
  // Browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('🦅 Eagle English', {
      body: t('reminder.body') || 'Time to study English! 📚 Keep your streak going!',
      icon: '/img/mascot.png'
    });
  }
  // In-app toast
  toast(t('reminder.toast') || '⏰ 8:30 PM - Time to study English! 🦅', 'info');
}

// Check saved session
window.addEventListener('DOMContentLoaded', () => {
  // Initialize language from localStorage
  const savedLang = localStorage.getItem('lang') || 'en';
  i18n.currentLang = savedLang;
  document.documentElement.lang = savedLang === 'vi' ? 'vi' : 'en';
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === savedLang));
  i18n.updateStaticElements();

  const saved = localStorage.getItem('user');
  if (saved) {
    currentUser = JSON.parse(saved);
    if (currentUser.language) { i18n.currentLang = currentUser.language; localStorage.setItem('lang', currentUser.language); i18n.updateStaticElements(); document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === currentUser.language)); }
    enterApp();
  } else { showLanding(); }
});

window.addEventListener('popstate', (e) => {
  if (e.state && e.state.page) navigate(e.state.page, true);
  else {
    const p = location.pathname.substring(1) || 'dashboard';
    navigate(p, true);
  }
});

// ===== NAVIGATION =====
function navigate(page, skipPush = false) {
  if (page === '') page = 'dashboard';
  // List of valid pages to avoid pushing garbage routes
  const validPages = ['dashboard', 'vocabulary', 'flashcards', 'grammar', 'reading', 'listening', 'speaking', 'writing', 'pronunciation', 'interview', 'scenarios', 'companies', 'dictation', 'video', 'profile'];
  if (!validPages.includes(page)) page = 'dashboard';

  if (!skipPush) history.pushState({ page }, '', '/' + (page === 'dashboard' ? '' : page));
  
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');
  if (window.innerWidth < 1024) {
    const sidebar = $('sidebar');
    const overlay = $('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }
  renderPage(page);
}

function renderPage(page) {
  const mc = $('mainContent');
  mc.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  const renderers = {
    dashboard: renderDashboard, vocabulary: renderVocabulary, flashcards: renderFlashcards,
    grammar: renderGrammar, reading: renderReading, listening: renderListening,
    speaking: renderSpeaking, writing: renderWriting, pronunciation: renderPronunciation,
    interview: renderInterview, scenarios: renderScenarios,
    companies: renderCompanies, dictation: renderDictation, video: renderVideo, profile: renderProfile
  };
  (renderers[page] || renderDashboard)();
}

// ===== DASHBOARD =====
async function renderDashboard() {
  try {
    const prog = await API.getProgress(currentUser.id);
    const mc = $('mainContent');
    const pct = prog.vocabTotal > 0 ? Math.round((prog.vocabLearned / prog.vocabTotal) * 100) : 0;
    const todayStats = prog.dailyStats?.[0] || {};
    const level = currentUser.english_level || 'Beginner';
    const role = currentUser.job_role || 'Developer';
    const levelBadge = { Beginner: '🌱', Intermediate: '📗', Advanced: '🚀' };
    const plan = generate30DayPlan(level, role);
    const today = prog.streak || 1;
    const planDay = Math.min(today, 30);

    mc.innerHTML = `
      <div class="page-header"><h1>${t('dash.hello')}, ${currentUser.display_name || currentUser.username}! 👋</h1>
        <p>${levelBadge[level]} ${level} · ${role} · ${t('dash.plan')}</p></div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon">🔥</div><div class="stat-value">${prog.streak || 0}</div><div class="stat-label">${t('dash.streak')}</div></div>
        <div class="stat-card"><div class="stat-icon">📚</div><div class="stat-value">${prog.vocabLearned || 0}/${prog.vocabTotal}</div><div class="stat-label">${t('dash.vocab.learned')}</div></div>
        <div class="stat-card"><div class="stat-icon">📝</div><div class="stat-value">${todayStats.exercises_completed || 0}</div><div class="stat-label">${t('dash.exercises')}</div></div>
        <div class="stat-card"><div class="stat-icon">🎯</div><div class="stat-value">${pct}%</div><div class="stat-label">${t('dash.progress')}</div></div>
      </div>
      <div class="card"><div class="card-header"><h3 class="card-title">${t('dash.vocab.progress')}</h3></div>
        <div class="progress-bar-container"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
        <p style="margin-top:8px;font-size:13px;color:var(--text-muted)">${prog.vocabLearned || 0} / ${prog.vocabTotal} ${t('dash.words.mastered')}</p>
      </div>

      <div class="card"><div class="card-header"><h3 class="card-title">${t('dash.roadmap')} - ${level} ${role}</h3></div>
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:16px">${t('dash.roadmap.desc')} ${planDay}.</p>
        <div style="display:grid;gap:8px;max-height:400px;overflow-y:auto;padding-right:8px">
          ${plan.map((d, i) => {
      const dayN = i + 1;
      const isPast = dayN < planDay;
      const isToday = dayN === planDay;
      const isFuture = dayN > planDay;
      return `<div style="display:flex;gap:12px;align-items:flex-start;padding:12px 16px;border-radius:12px;background:${isToday ? 'var(--green-50)' : 'var(--bg-card)'};border:${isToday ? '2px solid var(--leaf)' : '1px solid var(--border)'};opacity:${isFuture ? '0.6' : '1'};cursor:pointer" onclick="${isToday ? d.action : ''}">
              <div style="min-width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;background:${isPast ? 'var(--leaf)' : isToday ? 'var(--leaf-dark)' : 'var(--bg-secondary)'};color:${isPast || isToday ? 'white' : 'var(--text-muted)'}">
                ${isPast ? '✓' : dayN}
              </div>
              <div style="flex:1">
                <div style="font-weight:800;font-size:14px;color:${isToday ? 'var(--leaf-dark)' : 'var(--text-primary)'}">${isToday ? '▶ ' : ''}${t('plan.day')} ${dayN}: ${d.title}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${d.tasks.join(' · ')}</div>
              </div>
              <span style="font-size:11px;padding:4px 8px;border-radius:20px;background:${d.focus === 'vocab' ? '#e8f5e9' : d.focus === 'skills' ? '#e3f2fd' : d.focus === 'practice' ? '#fff3e0' : '#fce4ec'};color:${d.focus === 'vocab' ? '#2e7d32' : d.focus === 'skills' ? '#1565c0' : d.focus === 'practice' ? '#e65100' : '#c62828'};font-weight:700">${d.tag}</span>
            </div>`;
    }).join('')}
        </div>
      </div>

      <div class="card"><div class="card-header"><h3 class="card-title">${t('dash.quick.start')}</h3></div>
        <div class="stats-grid" style="margin-bottom:0">
          <div class="stat-card" onclick="navigate('vocabulary')" style="cursor:pointer"><div class="stat-icon" style="background:none;width:auto;height:auto"><img src="/img/icon_vocab.png" class="img-icon" alt="Vocab"></div><div class="stat-label">${t('dash.new.vocab')}</div></div>
          <div class="stat-card" onclick="navigate('reading')" style="cursor:pointer"><div class="stat-icon" style="background:none;width:auto;height:auto"><img src="/img/icon_dashboard.png" class="img-icon" alt="Reading"></div><div class="stat-label">${t('nav.reading')}</div></div>
          <div class="stat-card" onclick="navigate('listening')" style="cursor:pointer"><div class="stat-icon">🎧</div><div class="stat-label">${t('nav.listening')}</div></div>
          <div class="stat-card" onclick="navigate('pronunciation')" style="cursor:pointer"><div class="stat-icon" style="background:none;width:auto;height:auto"><img src="/img/icon_pronunciation.png" class="img-icon" alt="Pronunciation"></div><div class="stat-label">${t('nav.pronunciation')}</div></div>
          <div class="stat-card" onclick="navigate('grammar')" style="cursor:pointer"><div class="stat-icon">✏️</div><div class="stat-label">${t('nav.grammar')}</div></div>
          <div class="stat-card" onclick="navigate('scenarios')" style="cursor:pointer"><div class="stat-icon">💬</div><div class="stat-label">${t('nav.scenarios')}</div></div>
        </div>
      </div>

      <div id="checkinArea"></div>`;
    renderCheckinArea();
  } catch (e) { $('mainContent').innerHTML = `<p>Error: ${e.message}</p>`; }
}

// ===== 30-DAY LEARNING PLAN GENERATOR =====
function generate30DayPlan(level, role) {
  const plan = [];
  const isTest = role === 'Tester';
  const isDev = ['Developer', 'Full Stack', 'DevOps'].includes(role);

  // Difficulty scaling
  const vocabPerDay = level === 'Beginner' ? 5 : level === 'Intermediate' ? 10 : 15;
  const baseTasks = {
    Beginner: { vocab: 'Học từ vựng cơ bản', reading: 'Đọc hiểu cơ bản', listening: 'Nghe chậm + lặp lại', speaking: 'Luyện phát âm từ đơn', writing: 'Viết câu đơn giản', grammar: 'Ngữ pháp cơ bản' },
    Intermediate: { vocab: 'Từ vựng chuyên ngành', reading: 'Đọc tài liệu kỹ thuật', listening: 'Nghe meeting/standup', speaking: 'Nói theo tình huống', writing: 'Viết email/báo cáo', grammar: 'Ngữ pháp nâng cao' },
    Advanced: { vocab: 'Thuật ngữ nâng cao', reading: 'Đọc paper/design doc', listening: 'Nghe phỏng vấn thực tế', speaking: 'Thuyết trình kỹ thuật', writing: 'Viết proposal/RFC', grammar: 'Idioms & expressions' }
  }[level];

  for (let d = 1; d <= 30; d++) {
    let title, tasks, focus, tag, action;
    const week = Math.ceil(d / 7);

    if (d <= 7) { // Week 1: Foundation
      if (d % 3 === 1) {
        title = `Từ vựng ${isTest ? 'Testing & QA' : isDev ? 'Algorithms & Data' : 'IT cơ bản'}`;
        tasks = [`${vocabPerDay} từ mới`, baseTasks.vocab, 'Flashcards ôn tập'];
        focus = 'vocab'; tag = '📚 Từ vựng'; action = "navigate('vocabulary')";
      } else if (d % 3 === 2) {
        title = 'Luyện đọc & ngữ pháp';
        tasks = [baseTasks.reading, baseTasks.grammar, 'Quiz kiểm tra'];
        focus = 'skills'; tag = '📖 Kỹ năng'; action = "navigate('reading')";
      } else {
        title = 'Phát âm & nghe';
        tasks = [baseTasks.speaking, baseTasks.listening, 'Luyện phát âm 10 từ'];
        focus = 'practice'; tag = '🎤 Luyện tập'; action = "navigate('pronunciation')";
      }
    } else if (d <= 14) { // Week 2: Skills building
      if (d % 4 === 0) {
        title = 'Nghe & nói tình huống';
        tasks = [baseTasks.listening, 'Daily standup practice', isTest ? 'Bug report bằng tiếng Anh' : 'Code review bằng tiếng Anh'];
        focus = 'practice'; tag = '💬 Giao tiếp'; action = "navigate('scenarios')";
      } else if (d % 4 === 1) {
        title = `Từ vựng ${isTest ? 'QA Automation' : 'Database & DevOps'}`;
        tasks = [`${vocabPerDay} từ mới`, 'Ôn tập tuần trước', baseTasks.vocab];
        focus = 'vocab'; tag = '📚 Từ vựng'; action = "navigate('vocabulary')";
      } else if (d % 4 === 2) {
        title = 'Writing: Email & báo cáo';
        tasks = [baseTasks.writing, isTest ? 'Viết test report' : 'Viết technical email', 'Email mẫu'];
        focus = 'skills'; tag = '✍️ Viết'; action = "navigate('writing')";
      } else {
        title = 'Nghe video IT';
        tasks = ['Xem video kỹ thuật', 'Ghi chú từ mới', baseTasks.listening];
        focus = 'skills'; tag = '🎬 Video'; action = "navigate('videos')";
      }
    } else if (d <= 21) { // Week 3: Professional scenarios
      if (d % 3 === 0) {
        title = 'Tình huống dự án';
        tasks = [isTest ? 'Sprint testing discussion' : 'Sprint planning', baseTasks.speaking, 'Meeting practice'];
        focus = 'practice'; tag = '💼 Nghiệp vụ'; action = "navigate('scenarios')";
      } else if (d % 3 === 1) {
        title = `Từ vựng ${isTest ? 'Performance Testing' : 'Microservices & Cloud'}`;
        tasks = [`${vocabPerDay} từ nâng cao`, 'Review từ khó', 'Flashcard speed drill'];
        focus = 'vocab'; tag = '📚 Từ vựng'; action = "navigate('vocabulary')";
      } else {
        title = 'Luyện phỏng vấn';
        tasks = [baseTasks.speaking, isTest ? 'QA interview questions' : 'Technical interview prep', 'Nghe & trả lời'];
        focus = 'interview'; tag = '🎯 Phỏng vấn'; action = "navigate('interview')";
      }
    } else { // Week 4: Interview & mastery
      if (d % 3 === 0) {
        title = 'Mock interview';
        tasks = ['Phỏng vấn giả lập', 'System design discussion', level === 'Advanced' ? 'Behavioral questions' : 'Technical Q&A'];
        focus = 'interview'; tag = '🎯 Phỏng vấn'; action = "navigate('interview')";
      } else if (d % 3 === 1) {
        title = 'Ôn tập tổng hợp';
        tasks = ['Ôn tập tất cả từ vựng', 'Quiz kiểm tra', `Review ${isTest ? 'testing terms' : 'coding terms'}`];
        focus = 'vocab'; tag = '📚 Ôn tập'; action = "navigate('flashcards')";
      } else {
        title = 'Kỹ năng tổng hợp';
        tasks = [baseTasks.reading, baseTasks.writing, baseTasks.listening];
        focus = 'skills'; tag = '🌟 Tổng hợp'; action = "navigate('reading')";
      }
    }

    if (d === 30) {
      title = '🎓 Ngày tổng kết!';
      tasks = ['Đánh giá tiến độ 30 ngày', 'Kiểm tra từ vựng tổng', 'Lên kế hoạch giai đoạn tiếp theo'];
      focus = 'practice'; tag = '🏆 Tốt nghiệp';
    }

    plan.push({ title, tasks, focus, tag, action });
  }
  return plan;
}

// ===== DAY SELECTOR COMPONENT =====
function daySelector(total, active, onChange) {
  let html = '<div class="day-selector"><span style="font-size:14px;font-weight:600;color:var(--text-secondary);margin-right:8px">Day:</span>';
  for (let i = 1; i <= total; i++) {
    html += `<button class="day-btn ${i === active ? 'active' : ''}" onclick="${onChange}(${i})">${i}</button>`;
  }
  return html + '</div>';
}

// ===== VOCABULARY =====
async function renderVocabulary() {
  const mc = $('mainContent');
  mc.innerHTML = `<div class="page-header"><h1>${t('vocab.title')}</h1><p>${t('vocab.subtitle')}</p></div>
    ${daySelector(15, currentDay, 'loadVocabDay')}
    <div class="category-filter" id="vocabCategoryFilter">
      <button class="filter-btn active" onclick="filterVocab('')">${t('vocab.all')}</button>
    </div>
    <div id="vocabList" class="vocab-grid"><div class="loading"><div class="spinner"></div></div></div>`;
  // Load categories dynamically
  try {
    const allWords = await API.getDailyVocab(currentUser.id, currentDay);
    const categories = [...new Set(allWords.map(w => w.category).filter(Boolean))];
    const catIcons = { 'General': '🌍', 'Business': '💼', 'Technology': '💻', 'Education': '🎓', 'Healthcare': '🏥', 'Daily Life': '🏠', 'Travel': '✈️', 'Food': '🍕', 'Nature': '🌿', 'Sports': '⚽', 'Entertainment': '🎬', 'Science': '🔬', 'Algorithms': '🧮', 'Data Systems': '🗄️', 'Hardware & Infrastructure': '🖥️', 'Testing & QA': '🧪', 'DevOps': '⚙️', 'Frontend': '🎨', 'Backend': '🔧', 'Database': '🗃️', 'Security': '🔒', 'Networking': '🌐', 'Cloud': '☁️', 'Mobile': '📱', 'AI/ML': '🤖' };
    const filterEl = $('vocabCategoryFilter');
    categories.forEach(cat => {
      const icon = catIcons[cat] || '📂';
      filterEl.innerHTML += `<button class="filter-btn" onclick="filterVocab('${cat.replace(/'/g, "\\'")}')">${icon} ${cat}</button>`;
    });
  } catch(e) {}
  loadVocabDay(currentDay);
}

async function loadVocabDay(day) {
  currentDay = day;
  document.querySelectorAll('.day-btn').forEach((b, i) => b.classList.toggle('active', i + 1 === day));
  try {
    const words = await API.getDailyVocab(currentUser.id, day);
    window._vocabWords = words;
    renderVocabList(words);
  } catch (e) { $('vocabList').innerHTML = `<p>Error: ${e.message}</p>`; }
}

function filterVocab(cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  const words = cat ? window._vocabWords.filter(w => w.category === cat) : window._vocabWords;
  renderVocabList(words);
}

function renderVocabList(words) {
  const catClass = { 'Algorithms': 'badge-algo', 'Data Systems': 'badge-data', 'Hardware & Infrastructure': 'badge-hw', 'Testing & QA': 'badge-algo' };
  $('vocabList').innerHTML = words.length ? words.map((w, i) => `
    <div class="vocab-card ${w.learned ? 'learned' : ''}" onclick="this.classList.toggle('expanded')">
      <div class="flex-between"><span class="badge ${catClass[w.category] || ''}">${w.category}</span>
        ${w.mastery_level > 0 ? `<span class="mastery-stars">${'★'.repeat(w.mastery_level)}${'☆'.repeat(5 - w.mastery_level)}</span>` : ''}
      </div>
      <h3 class="vocab-term mt-16">${w.term}</h3>
      <div class="vocab-type">${w.word_type || 'n.'}</div>
      <div class="vocab-def">🇻🇳 ${w.definition_vi}</div>
      <div class="vocab-def">🇬🇧 ${w.definition_en || ''}</div>
      <div class="vocab-examples">
        ${w.example1 ? `<div class="vocab-example">${w.example1}</div>` : ''}
        ${w.example2 ? `<div class="vocab-example">${w.example2}</div>` : ''}
        ${w.example3 ? `<div class="vocab-example">${w.example3}</div>` : ''}
        <div class="vocab-actions">
          <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();speakWord('${w.term.replace(/'/g, "\\'")}')">🔊 Listen</button>
          <button class="btn btn-sm btn-success" onclick="event.stopPropagation();markLearned(${w.id}, true)">✓ Know it</button>
          <button class="btn btn-sm btn-warning" onclick="event.stopPropagation();markLearned(${w.id}, false)">✗ Review</button>
        </div>
      </div>
    </div>`).join('') : '<p style="color:var(--text-muted)">No words for this day yet.</p>';
}

async function markLearned(vocabId, correct) {
  try {
    await API.learnWord(currentUser.id, vocabId, correct);
    toast(correct ? t('vocab.marked.known') : t('vocab.added.review'), correct ? 'success' : 'info');
    loadVocabDay(currentDay);
  } catch (e) { toast(e.message, 'error'); }
}

function speakWord(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = 0.8;
  speechSynthesis.speak(u);
}

// ===== FLASHCARDS =====
async function renderFlashcards() {
  try {
    const words = await API.getDailyVocab(currentUser.id, currentDay);
    window._flashcardWords = words;
    window._flashcardIdx = 0;
    const mc = $('mainContent');
    mc.innerHTML = `<div class="page-header"><h1>${t('flash.title')}</h1><p>${t('flash.subtitle')}</p></div>
      ${daySelector(15, currentDay, 'loadFlashcardDay')}
      <div id="flashcardArea"></div>`;
    renderFlashcard();
  } catch (e) { $('mainContent').innerHTML = `<p>Error: ${e.message}</p>`; }
}

function loadFlashcardDay(day) { currentDay = day; renderFlashcards(); }

function renderFlashcard() {
  const words = window._flashcardWords;
  const idx = window._flashcardIdx;
  if (!words || !words.length) { $('flashcardArea').innerHTML = '<p class="text-center" style="color:var(--text-muted)">No words for this day.</p>'; return; }
  const w = words[idx];
  $('flashcardArea').innerHTML = `
    <p class="text-center mb-16" style="color:var(--text-muted)">${idx + 1} / ${words.length}</p>
    <div class="flashcard" onclick="this.classList.toggle('flipped')">
      <div class="flashcard-inner">
        <div class="flashcard-front"><h2>${w.term}</h2><p>${w.word_type || 'n.'}</p><p style="margin-top:16px;font-size:14px">Tap to see definition</p></div>
        <div class="flashcard-back"><h3>${w.definition_vi}</h3><p>${w.definition_en || ''}</p><p style="margin-top:12px;font-size:13px;color:var(--text-muted)">${w.example1 || ''}</p></div>
      </div>
    </div>
    <div class="flex gap-8" style="justify-content:center;margin-top:16px">
      <button class="btn btn-secondary" onclick="prevFlashcard()" ${idx === 0 ? 'disabled' : ''}>${t('flash.prev') || '← Previous'}</button>
      <button class="btn btn-primary" onclick="speakWord('${w.term.replace(/'/g, "\\'")}')">🔊 Listen</button>
      ${idx >= words.length - 1 ? 
        `<button class="btn" style="background:var(--success);color:#fff" onclick="startFlashcardQuiz()">${t('flash.practice.btn')}</button>` : 
        `<button class="btn btn-secondary" onclick="nextFlashcard()">${t('flash.next') || 'Next →'}</button>`}
    </div>
    <div class="flex gap-8" style="justify-content:center;margin-top:12px">
      <button class="btn btn-success btn-sm" onclick="markLearned(${w.id},true); ${idx >= words.length - 1 ? 'startFlashcardQuiz()' : 'nextFlashcard()'}">${t('flash.btn.know')}</button>
      <button class="btn btn-danger btn-sm" onclick="markLearned(${w.id},false); ${idx >= words.length - 1 ? 'startFlashcardQuiz()' : 'nextFlashcard()'}">${t('flash.btn.still')}</button>
    </div>`;
}

function nextFlashcard() { if (window._flashcardIdx < window._flashcardWords.length - 1) { window._flashcardIdx++; renderFlashcard(); } }
function prevFlashcard() { if (window._flashcardIdx > 0) { window._flashcardIdx--; renderFlashcard(); } }

function startFlashcardQuiz() {
  const words = window._flashcardWords;
  if (!words || words.length < 2) {
    alert(t('flash.practice.alert'));
    return;
  }
  
  // Create quiz questions
  window._fcQuiz = words.map(w => {
    let wrongOptions = words.filter(x => x.id !== w.id).sort(() => 0.5 - Math.random()).slice(0, 3);
    let options = [w, ...wrongOptions].sort(() => 0.5 - Math.random());
    return {
      word: w,
      options: options,
      correctId: w.id
    };
  }).sort(() => 0.5 - Math.random()); // Shuffle questions
  
  window._fcQuizIdx = 0;
  window._fcQuizScore = 0;
  renderFlashcardQuiz();
}

function renderFlashcardQuiz() {
  const quiz = window._fcQuiz;
  const idx = window._fcQuizIdx;
  
  if (idx >= quiz.length) {
    $('flashcardArea').innerHTML = `
      <div class="text-center" style="padding:40px; background:#fff; border-radius:12px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)">
        <h2 style="font-size:24px; color:var(--success); margin-bottom:16px">${t('flash.practice.finish')}</h2>
        <p style="font-size:18px; margin-bottom:24px">${t('flash.practice.score')} <strong>${window._fcQuizScore} / ${quiz.length}</strong></p>
        <button class="btn btn-primary" onclick="renderFlashcards()">${t('flash.practice.replay')}</button>
      </div>`;
    return;
  }
  
  const q = quiz[idx];
  
  let html = `
    <div style="background:#fff; padding:32px; border-radius:12px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); max-width:600px; margin:0 auto;">
      <p class="text-center" style="color:var(--text-muted); margin-bottom:16px">${t('flash.practice.q')} ${idx + 1} / ${quiz.length}</p>
      <h3 style="text-align:center; font-size:22px; margin-bottom:8px">${q.word.term}</h3>
      <p style="text-align:center; color:var(--text-muted); margin-bottom:24px">${t('flash.practice.choose')}</p>
      
      <div style="display:flex; flex-direction:column; gap:12px">
        ${q.options.map((opt, i) => `
          <button id="fc-opt-${i}" class="btn" style="text-align:left; padding:16px; background:#f8fafb; border:2px solid transparent; width:100%; transition:all 0.2s" 
                  onclick="checkFcQuiz(${opt.id}, ${q.correctId}, ${i})">
            ${opt.definition_vi}
          </button>
        `).join('')}
      </div>
      <div id="fc-quiz-next" style="display:none; text-align:center; margin-top:24px">
        <button class="btn btn-primary" onclick="window._fcQuizIdx++; renderFlashcardQuiz()">${t('flash.practice.next')}</button>
      </div>
    </div>
  `;
  $('flashcardArea').innerHTML = html;
}

function checkFcQuiz(selectedId, correctId, optIndex) {
  const isCorrect = selectedId === correctId;
  const btn = document.getElementById(`fc-opt-${optIndex}`);
  
  if (isCorrect) {
    btn.style.borderColor = 'var(--success)';
    btn.style.background = '#dcfce7'; // light green
    window._fcQuizScore++;
  } else {
    btn.style.borderColor = 'var(--danger)';
    btn.style.background = '#fee2e2'; // light red
    // Highlight correct
    const correctBtnIndex = window._fcQuiz[window._fcQuizIdx].options.findIndex(o => o.id === correctId);
    const correctBtn = document.getElementById(`fc-opt-${correctBtnIndex}`);
    if(correctBtn) {
      correctBtn.style.borderColor = 'var(--success)';
      correctBtn.style.color = 'var(--success)';
    }
  }
  
  // Disable all buttons
  window._fcQuiz[window._fcQuizIdx].options.forEach((_, i) => {
    document.getElementById(`fc-opt-${i}`).disabled = true;
  });
  
  $('fc-quiz-next').style.display = 'block';
}

// ===== GRAMMAR =====
async function renderGrammar() {
  const mc = $('mainContent');
  mc.innerHTML = `<div class="page-header"><h1>${t('gram.title')}</h1><p>${t('gram.subtitle')}</p></div>
    ${daySelector(15, currentDay, 'loadGrammarDay')}
    <div id="grammarLessons"></div>
    <div id="grammarList"></div>`;
  loadGrammarDay(currentDay);
}

async function loadGrammarDay(day) {
  currentDay = day;
  document.querySelectorAll('.day-btn').forEach((b, i) => b.classList.toggle('active', i + 1 === day));

  // 1. Load theory lessons for this day
  try {
    const lessons = await fetch(`/api/grammar/lessons/${day}`).then(r => r.json());
    if (lessons && lessons.length) {
      $('grammarLessons').innerHTML = `<div class="card" style="margin-bottom:20px;border-left:4px solid var(--leaf)">
        <div class="card-header"><h3 class="card-title">${t('gram.theory.title')} ${day}</h3></div>
        ${lessons.map(l => {
          const title = (i18n.currentLang === 'en' && l.title_en) ? l.title_en : l.title_vi;
          const content = (i18n.currentLang === 'en' && l.content_en) ? l.content_en : l.content_vi;
          const examples = (i18n.currentLang === 'en' && l.examples_en) ? l.examples_en : l.examples_vi;
          const tips = (i18n.currentLang === 'en' && l.tips_en) ? l.tips_en : l.tips_vi;
          return `
          <div style="padding:16px;border-bottom:1px solid var(--border)">
            <h4 style="cursor:pointer;display:flex;justify-content:space-between;align-items:center" onclick="this.parentElement.querySelector('.lesson-body').classList.toggle('hidden')">
              <span>📗 ${title}</span>
              <span style="font-size:12px;color:var(--text-muted)">${t('gram.theory.expand')}</span>
            </h4>
            <div class="lesson-body" style="margin-top:12px">
              <div style="white-space:pre-line;font-size:14px;line-height:1.8;color:var(--text-secondary)">${content}</div>
              ${examples ? `<div style="margin-top:12px;padding:12px;background:var(--green-50,#f0fdf4);border-radius:var(--radius);font-size:13px">
                <strong>${t('gram.theory.example')}</strong><br><span style="white-space:pre-line">${examples}</span></div>` : ''}
              ${tips ? `<div style="margin-top:8px;padding:12px;background:var(--info-bg,#eff6ff);border-radius:var(--radius);font-size:13px;color:var(--info,#1d4ed8)">
                💡 <strong>${t('gram.theory.tip')}</strong> ${tips}</div>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>`;
      // Add a 'Start Practice' button at the bottom of theory
      $('grammarLessons').innerHTML += `
        <div style="text-align:center; margin: 24px 0 32px 0;">
          <h3 style="margin-bottom:8px;color:#16a34a">${t('gram.practice.ready')}</h3>
          <p style="color:#666;margin-bottom:16px;font-size:14px">${t('gram.practice.desc')}</p>
          <button class="btn btn-primary" style="padding:12px 32px; font-size:16px; width:100%; max-width:400px; box-shadow:0 4px 12px rgba(22,163,74,0.3)" onclick="document.getElementById('grammarListCont').classList.remove('hidden');this.parentElement.style.display='none';window.scrollTo({top: document.getElementById('grammarListCont').offsetTop - 80, behavior: 'smooth'})">${t('gram.practice.start')}</button>
        </div>`;
    } else {
      $('grammarLessons').innerHTML = '';
    }
  } catch (e) { $('grammarLessons').innerHTML = ''; }

  // 2. Load exercises
  const hasTheory = $('grammarLessons').innerHTML.trim().length > 0;
  
  try {
    const exercises = await API.getGrammar(day);
    $('grammarList').innerHTML = `<div id="grammarListCont" class="${hasTheory ? 'hidden' : ''}">` + (exercises.length ? `<div class="card"><div class="card-header"><h3 class="card-title">${t('gram.practice.title')}</h3></div><div style="padding:16px">` + exercises.map((ex, i) => `
      <div class="quiz-question" id="grammar-${ex.id}">
        <h4>Q${i + 1}. ${ex.question} <span class="badge badge-algo">${ex.grammar_topic || ''}</span></h4>
        <div class="quiz-options">${ex.options.map((opt, j) => `
          <label class="quiz-option" id="gopt-${ex.id}-${j}" onclick="checkGrammar(${ex.id},'${opt.replace(/'/g, "\\'")}','${ex.correct_answer.replace(/'/g, "\\'")}',${j},${ex.options.length})">
            <span>${opt}</span>
          </label>`).join('')}
        </div>
        <div id="gexpl-${ex.id}" class="hidden" style="margin-top:12px;padding:12px;background:var(--info-bg);border-radius:var(--radius);font-size:14px;color:var(--info)">
          💡 ${ex.explanation || ''}
        </div>
      </div>`).join('') + '</div></div><div id="grammarScore" class="hidden card text-center"></div>'
      : '<p style="color:var(--text-muted)">No exercises for this day yet.</p>') + '</div>';
    window._grammarTotal = exercises.length;
    window._grammarCorrect = 0;
    window._grammarDone = 0;
  } catch (e) { $('grammarList').innerHTML = `<p>Error: ${e.message}</p>`; }
}

function checkGrammar(id, selected, correct, idx, total) {
  const q = document.getElementById(`grammar-${id}`);
  if (q.dataset.done) return;
  q.dataset.done = '1';
  const isCorrect = selected === correct;
  for (let i = 0; i < total; i++) {
    const el = document.getElementById(`gopt-${id}-${i}`);
    if (el.textContent.trim() === correct) el.classList.add('correct');
    else if (i === idx && !isCorrect) el.classList.add('incorrect');
  }
  document.getElementById(`gexpl-${id}`).classList.remove('hidden');
  window._grammarDone++;
  if (isCorrect) window._grammarCorrect++;
  if (window._grammarDone === window._grammarTotal) {
    const score = Math.round((window._grammarCorrect / window._grammarTotal) * 100);
    const el = document.getElementById('grammarScore');
    el.classList.remove('hidden');
    el.innerHTML = `<div class="score-circle ${score >= 80 ? 'score-high' : score >= 50 ? 'score-mid' : 'score-low'}">${score}%</div><p style="font-size:16px;font-weight:600;margin-top:8px">${window._grammarCorrect}/${window._grammarTotal} correct</p>`;
    API.trackActivity(currentUser.id, 'grammar', currentDay, score);
  }
}

// ===== READING =====
async function renderReading() {
  const mc = $('mainContent');
  mc.innerHTML = `<div class="page-header"><h1>${t('read.title')}</h1><p>${t('read.subtitle')}</p></div>
    ${daySelector(15, currentDay, 'loadReadingDay')}<div id="readingContent"></div>`;
  loadReadingDay(currentDay);
}

async function loadReadingDay(day) {
  currentDay = day;
  document.querySelectorAll('.day-btn').forEach((b, i) => b.classList.toggle('active', i + 1 === day));
  try {
    const data = await API.getReading(day, currentUser.id);
    $('readingContent').innerHTML = `
      <div class="card"><div class="card-header"><h3 class="card-title">${data.title}</h3><span class="badge badge-algo">${data.category || ''}</span></div>
        <div class="tts-controls"><button class="btn btn-sm btn-primary" onclick="speakText(document.querySelector('.passage-content').textContent)">🔊 Listen to passage</button>
          <div class="speed-selector"><button class="speed-btn" onclick="window._ttsRate=0.6;this.parentElement.querySelectorAll('.speed-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">0.6x</button>
          <button class="speed-btn active" onclick="window._ttsRate=0.8;this.parentElement.querySelectorAll('.speed-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">0.8x</button>
          <button class="speed-btn" onclick="window._ttsRate=1.0;this.parentElement.querySelectorAll('.speed-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">1.0x</button></div>
          <button class="btn btn-sm btn-secondary" onclick="speechSynthesis.cancel()">⏹ Stop</button></div>
        <div class="passage-content">${data.content}</div>
      </div>
      <div class="card"><h3 class="card-title mb-16">📝 Comprehension Questions</h3>
        ${data.questions.map((q, i) => `<div class="quiz-question" id="rq-${i}">
          <h4>Q${i + 1}. ${q.q}</h4>
          <div class="quiz-options">${q.options.map((opt, j) => `
            <label class="quiz-option" id="ropt-${i}-${j}" onclick="checkReading(${i},${j},${q.answer},${q.options.length})"><span>${opt}</span></label>`).join('')}
          </div></div>`).join('')}
        <div id="readingScore" class="hidden text-center mt-24"></div>
      </div>`;
    window._readingTotal = data.questions.length;
    window._readingCorrect = 0;
    window._readingDone = 0;
  } catch (e) { $('readingContent').innerHTML = '<p style="color:var(--text-muted)">No passage available for this day.</p>'; }
}

function speakText(text) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = window._ttsRate || 0.8;
  speechSynthesis.speak(u);
}

function checkReading(qi, sel, ans, total) {
  const q = document.getElementById(`rq-${qi}`);
  if (q.dataset.done) return;
  q.dataset.done = '1';
  for (let i = 0; i < total; i++) {
    const el = document.getElementById(`ropt-${qi}-${i}`);
    if (i === ans) el.classList.add('correct');
    else if (i === sel) el.classList.add('incorrect');
  }
  window._readingDone++;
  if (sel === ans) window._readingCorrect++;
  if (window._readingDone === window._readingTotal) {
    const score = Math.round((window._readingCorrect / window._readingTotal) * 100);
    const el = document.getElementById('readingScore');
    el.classList.remove('hidden');
    el.innerHTML = `<div class="score-circle ${score >= 80 ? 'score-high' : score >= 50 ? 'score-mid' : 'score-low'}">${score}%</div><p>${window._readingCorrect}/${window._readingTotal} correct</p>`;
    API.trackActivity(currentUser.id, 'reading', currentDay, score);
  }
}

// ===== LISTENING =====
async function renderListening() {
  const mc = $('mainContent');
  mc.innerHTML = `<div class="page-header"><h1>${t('listen.title')}</h1><p>${t('listen.subtitle')}</p></div>
    ${daySelector(15, currentDay, 'loadListeningDay')}<div id="listeningContent"></div>`;
  loadListeningDay(currentDay);
}

async function renderVideo() {
  const mc = $('mainContent');
  mc.innerHTML = `<div class="page-header"><h1>📺 Video Learning</h1><p>Xem video tiếng Anh - subtitle EN + VI đồng bộ theo thời gian thực</p></div>
    <div id="ytListArea"><div class="loading"><div class="spinner"></div></div></div>`;
  loadYouTubeList();
}

function showListeningTab(tab) {
  document.querySelectorAll('.category-filter .filter-btn').forEach(b => b.classList.remove('active'));
  event?.target?.classList?.add('active');
  $('exercisesTab').style.display = tab === 'exercises' ? '' : 'none';
  $('youtubeTab').style.display = tab === 'youtube' ? '' : 'none';
  if (tab === 'youtube') loadYouTubeList();
}

async function loadYouTubeList(category) {
  try {
    const url = '/api/youtube-listening' + (category ? '?category=' + category : '');
    const res = await fetch(url);
    const videos = await res.json();
    const levelColors = { beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444' };
    const catIcons = { 'conversation': '💬', 'tech-interview': '🎯', 'business': '💼', 'pronunciation': '🗣️', 'tech-conversation': '💻' };
    $('ytListArea').innerHTML = `
      <div class="category-filter" style="margin-bottom:16px">
        <button class="filter-btn ${!category?'active':''}" onclick="loadYouTubeList()">📋 All</button>
        <button class="filter-btn ${category==='conversation'?'active':''}" onclick="loadYouTubeList('conversation')">💬 Conversation</button>
        <button class="filter-btn ${category==='tech-conversation'?'active':''}" onclick="loadYouTubeList('tech-conversation')">💻 Tech</button>
        <button class="filter-btn ${category==='tech-interview'?'active':''}" onclick="loadYouTubeList('tech-interview')">🎯 Interview</button>
        <button class="filter-btn ${category==='business'?'active':''}" onclick="loadYouTubeList('business')">💼 Business</button>
      </div>
      <div class="vocab-grid">${videos.map(v => `
        <div class="card" style="cursor:pointer;transition:transform .2s" onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform=''" onclick="openYouTubeExercise(${v.id})">
          <div style="position:relative;margin:-20px -20px 12px;border-radius:12px 12px 0 0;overflow:hidden;background:#000;height:140px;display:flex;align-items:center;justify-content:center">
            <img src="https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg" style="width:100%;object-fit:cover" alt="${v.title}">
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3)"><span style="font-size:40px">▶</span></div>
          </div>
          <h3 style="font-size:15px;font-weight:700;margin-bottom:6px">${v.title}</h3>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="color:var(--text-muted);font-size:13px">${catIcons[v.category]||'🎧'} ${v.category} • Day ${v.day_number}</span>
            <span class="badge" style="background:${levelColors[v.level]}20;color:${levelColors[v.level]}">${v.level}</span>
          </div>
        </div>`).join('')}</div>`;
  } catch(e) { $('ytListArea').innerHTML = '<p>Error loading videos</p>'; }
}

async function openYouTubeExercise(id) {
  try {
    const res = await fetch('/api/youtube-listening/' + id);
    const v = await res.json();
    const transcript = v.transcript;
    
    $('ytListArea').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 style="font-size:20px;font-weight:800">${v.title}</h2>
        <button class="btn btn-sm btn-secondary" onclick="loadYouTubeList()">← Back</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px" id="ytStudyLayout">
        <div>
          <div id="ytPlayerWrapper" style="position:relative; border-radius:12px; overflow:hidden; background:#000;">
            <div id="ytPlayerContainer" style="aspect-ratio:16/9; width:100%;"></div>
            <!-- Top: light gradient + click blocker -->
            <div style="position:absolute; top:0; left:0; width:100%; height:20%; background:linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%); pointer-events:none; z-index:5;"></div>
            <div style="position:absolute; top:0; left:0; width:100%; height:15%; cursor:default; z-index:10;"></div>
            <!-- Bottom: light gradient + click blocker -->
            <div style="position:absolute; bottom:0; left:0; width:100%; height:18%; background:linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%); pointer-events:none; z-index:5;"></div>
            <div style="position:absolute; bottom:0; left:0; width:100%; height:15%; cursor:default; z-index:10;"></div>
            <!-- Eagle English branding - fully covers YouTube logo area -->
            <div class="yt-eagle-brand" style="position:absolute; bottom:0; right:0; z-index:15; background:rgba(22,163,74,0.95); color:white; padding:12px 24px; border-radius:12px 0 0 0; font-size:15px; font-weight:800; letter-spacing:0.5px; display:flex; align-items:center; gap:8px; pointer-events:none; min-width:220px; justify-content:center;">
              <img src="/img/mascot.png" style="width:26px;height:26px;border-radius:50%;" alt="">🦅 Eagle English
            </div>
            <!-- Custom fullscreen button -->
            <button onclick="ytToggleFullscreen()" style="position:absolute; bottom:6px; left:8px; z-index:15; background:rgba(0,0,0,0.5); color:white; border:none; border-radius:8px; padding:6px 10px; cursor:pointer; font-size:16px; backdrop-filter:blur(4px);" title="Fullscreen">⛶</button>
          </div>
          <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-sm btn-primary" onclick="ytSeekRel(-5)">⏪ -5s</button>
            <button class="btn btn-sm btn-primary" onclick="ytTogglePlay()">⏯ Play/Pause</button>
            <button class="btn btn-sm btn-primary" onclick="ytSeekRel(5)">⏩ +5s</button>
            <button class="btn btn-sm btn-primary" onclick="ytToggleFullscreen()">⛶ Fullscreen</button>
            <select style="padding:4px 8px;border-radius:6px;border:1px solid var(--border);font-size:13px" onchange="if(window._ytPlayer)window._ytPlayer.setPlaybackRate(parseFloat(this.value))">
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1" selected>1x</option>
              <option value="1.25">1.25x</option>
            </select>
          </div>
        </div>
        <div style="max-height:480px;overflow-y:auto;border:1px solid var(--border);border-radius:12px;background:white" id="ytSubtitlePanel">
          ${transcript.map((s, i) => `
            <div class="yt-sub-line" id="yt-sub-${i}" onclick="ytSeekTo(${s.time})" style="padding:12px 16px;border-bottom:1px solid #f0f0f0;cursor:pointer;position:relative;transition:background .2s" onmouseenter="this.style.background='#f8fafb';this.querySelector('.save-btn').style.opacity=1" onmouseleave="if(!this.classList.contains('yt-active'))this.style.background='';this.querySelector('.save-btn').style.opacity=0">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <span style="color:var(--text-muted);font-size:11px;font-weight:600">⏱ ${Math.floor(s.time/60)}:${String(s.time%60).padStart(2,'0')}</span>
              </div>
              <div style="font-size:15px;font-weight:600;color:#1a1a2e;line-height:1.5;padding-right:32px;">${s.text}</div>
              <div style="font-size:13px;color:#888;font-style:italic;margin-top:2px;padding-right:32px;">${s.vi || ''}</div>
              <button class="save-btn" onclick="event.stopPropagation();saveVideoSentence('${v.id}','${v.youtube_id}',${s.time},'${s.text.replace(/'/g, "\\'")}','${(s.vi||'').replace(/'/g, "\\'")}', this)" style="position:absolute;top:12px;right:16px;background:none;border:none;cursor:pointer;opacity:0;transition:opacity 0.2s;font-size:16px;color:#f59e0b" title="${t('video.save.sentence')}">⭐</button>
            </div>
          `).join('')}
        </div>
      </div>
      <style>
        .yt-sub-line.yt-active { background: #e8f5e9 !important; border-left: 4px solid #4caf50; }
        @media (max-width: 768px) { #ytStudyLayout { grid-template-columns: 1fr !important; } }
        #ytPlayerWrapper:fullscreen { border-radius: 0; }
        #ytPlayerWrapper:fullscreen #ytPlayerContainer { aspect-ratio: auto; width: 100%; height: 100%; }
        #ytPlayerWrapper:fullscreen .yt-eagle-brand { font-size: 18px; padding: 10px 24px; bottom: 12px; right: 16px; }
        #ytPlayerWrapper:fullscreen .yt-eagle-brand img { width: 28px; height: 28px; }
      </style>`;
    
    window._ytTranscriptData = transcript;
    window._ytCurrentSub = -1;
    
    // Load YouTube IFrame API
    if (!window.YT || !window.YT.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => initYTPlayer(v.youtube_id);
    } else {
      initYTPlayer(v.youtube_id);
    }
  } catch(e) { $('ytListArea').innerHTML = '<p>Error loading exercise</p>'; }
}

function initYTPlayer(videoId) {
  if (window._ytPlayer) { try { window._ytPlayer.destroy(); } catch(e) {} }
  window._ytPlayer = new YT.Player('ytPlayerContainer', {
    videoId: videoId,
    playerVars: { rel: 0, modestbranding: 1, cc_load_policy: 0 },
    events: { onReady: onYTReady, onStateChange: onYTStateChange }
  });
}

function onYTReady(e) { /* player ready */ }

function onYTStateChange(e) {
  if (e.data === YT.PlayerState.PLAYING) {
    if (window._ytSubInterval) clearInterval(window._ytSubInterval);
    window._ytSubInterval = setInterval(syncSubtitles, 300);
  } else {
    if (window._ytSubInterval) clearInterval(window._ytSubInterval);
  }
}

function syncSubtitles() {
  if (!window._ytPlayer || !window._ytTranscriptData) return;
  const currentTime = window._ytPlayer.getCurrentTime();
  const transcript = window._ytTranscriptData;
  
  let activeIdx = -1;
  for (let i = transcript.length - 1; i >= 0; i--) {
    if (currentTime >= transcript[i].time) { activeIdx = i; break; }
  }
  
  if (activeIdx !== window._ytCurrentSub) {
    // Remove old highlight
    document.querySelectorAll('.yt-sub-line').forEach(el => {
      el.classList.remove('yt-active');
      el.style.background = '';
    });
    // Add new highlight
    if (activeIdx >= 0) {
      const el = document.getElementById(`yt-sub-${activeIdx}`);
      if (el) {
        el.classList.add('yt-active');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    window._ytCurrentSub = activeIdx;
  }
}

function ytSeekTo(time) {
  if (window._ytPlayer && window._ytPlayer.seekTo) {
    window._ytPlayer.seekTo(time, true);
    window._ytPlayer.playVideo();
  }
}

function ytSeekRel(delta) {
  if (window._ytPlayer && window._ytPlayer.getCurrentTime) {
    const t = window._ytPlayer.getCurrentTime() + delta;
    window._ytPlayer.seekTo(Math.max(0, t), true);
  }
}

function ytTogglePlay() {
  if (!window._ytPlayer) return;
  const state = window._ytPlayer.getPlayerState();
  if (state === YT.PlayerState.PLAYING) window._ytPlayer.pauseVideo();
  else window._ytPlayer.playVideo();
}

function ytToggleFullscreen() {
  const wrapper = document.getElementById('ytPlayerWrapper');
  if (!wrapper) return;
  if (document.fullscreenElement === wrapper) {
    document.exitFullscreen();
  } else {
    wrapper.requestFullscreen().catch(() => {});
  }
}

function checkYtSentence(idx) {
  const input = document.getElementById(`yt-input-${idx}`).value.trim();
  const original = window._ytTranscript[idx];
  const resultEl = document.getElementById(`yt-result-${idx}`);
  resultEl.style.display = 'block';
  if (!input) { resultEl.innerHTML = '<span style="color:var(--text-muted)">Chưa nhập!</span>'; return; }
  const origWords = original.replace(/[.,!?;:'"]/g, '').toLowerCase().split(/\s+/);
  const userWords = input.replace(/[.,!?;:'"]/g, '').toLowerCase().split(/\s+/);
  let correct = 0;
  const highlighted = origWords.map((w, i) => {
    if (userWords[i] && userWords[i] === w) { correct++; return `<span style="color:#16a34a;font-weight:600">${w}</span>`; }
    return `<span style="color:#ef4444;text-decoration:underline;font-weight:600" title="Bạn: ${userWords[i]||'(thiếu)'}">${w}</span>`;
  }).join(' ');
  const score = Math.round((correct / origWords.length) * 100);
  window._ytChecked[idx] = true;
  window._ytScores[idx] = score;
  document.getElementById(`yt-input-${idx}`).style.borderColor = score >= 80 ? '#16a34a' : score >= 50 ? '#f59e0b' : '#ef4444';
  resultEl.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span style="font-weight:700;color:${score>=80?'#16a34a':score>=50?'#f59e0b':'#ef4444'}">${score}%</span><span style="color:var(--text-muted);font-size:12px">(${correct}/${origWords.length})</span></div>
    <div style="padding:8px;background:#f8fafb;border-radius:8px;font-size:14px;line-height:1.7"><strong style="font-size:11px;color:var(--text-muted)">Đáp án:</strong> ${highlighted}</div>`;
  if (window._ytChecked.every(Boolean)) showYtFinalScore();
}

function checkAllYt() {
  for (let i = 0; i < window._ytTranscript.length; i++) {
    if (!window._ytChecked[i]) checkYtSentence(i);
  }
}

function showYtFinalScore() {
  const avg = Math.round(window._ytScores.reduce((a,b) => a + b, 0) / window._ytScores.length);
  const el = document.getElementById('ytFinalScore');
  el.style.display = 'block';
  document.getElementById('ytScoreContent').innerHTML = `
    <div class="score-circle ${avg>=80?'score-high':avg>=50?'score-mid':'score-low'}" style="width:100px;height:100px;font-size:28px;margin:0 auto 16px">${avg}%</div>
    <p style="font-size:16px;color:var(--text-secondary)">${avg>=90?'🏆 Xuất sắc!':avg>=70?'👍 Tốt lắm!':avg>=50?'📚 Khá ổn, nghe lại nhé.':'💪 Nghe chậm và thử lại!'}</p>
    <button class="btn btn-primary" style="margin-top:16px" onclick="loadYouTubeList()">📋 Chọn bài khác</button>`;
  el.scrollIntoView({ behavior: 'smooth' });
}

async function loadListeningDay(day) {
  currentDay = day;
  document.querySelectorAll('.day-btn').forEach((b, i) => b.classList.toggle('active', i + 1 === day));
  try {
    const data = await API.getListening(day, currentUser.id);
    $('listeningContent').innerHTML = `
      <div class="card"><div class="card-header"><h3 class="card-title">🎧 ${data.title}</h3><span class="badge badge-data">${data.category || ''}</span></div>
        <div class="tts-controls">
          <button class="btn btn-sm btn-primary" onclick="speakDialogue()">▶ Play Dialogue</button>
          <button class="btn btn-sm btn-secondary" onclick="speechSynthesis.cancel()">⏹ Stop</button>
          <button class="btn btn-sm btn-secondary" id="showTranscript" onclick="document.getElementById('dialogueText').classList.toggle('hidden');this.textContent=this.textContent.includes('Show')?'Hide Transcript':'Show Transcript'">Show Transcript</button>
        </div>
        <div class="dialogue-text hidden" id="dialogueText" style="padding-top:12px;">
          ${data.dialogue.split('\n').filter(l=>l.trim()).map(l => {
            const isSpeaker = /^[A-Za-z\\s]+:/.test(l);
            return `<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:8px;border-bottom:1px solid #f0f0f0;transition:background 0.2s" onmouseover="this.style.background='#f8fafb';this.querySelector('.save-btn').style.opacity=1" onmouseout="this.style.background='transparent';this.querySelector('.save-btn').style.opacity=0">
              <span style="${isSpeaker ? 'font-weight:600;color:var(--primary)' : ''}">${l}</span>
              <button class="save-btn btn btn-icon" onclick="saveVideoSentence(0, 'generic', 0, '${l.replace(/'/g, "\\'")}', '', this)" style="opacity:0;font-size:12px;padding:4px"><i class="fa-solid fa-bookmark" style="color:#f59e0b"></i></button>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="card"><h3 class="card-title mb-16">📝 Questions</h3>
        ${data.questions.map((q, i) => `<div class="quiz-question" id="lq-${i}"><h4>Q${i + 1}. ${q.q}</h4>
          <div class="quiz-options">${q.options.map((opt, j) => `
            <label class="quiz-option" id="lopt-${i}-${j}" onclick="checkListening(${i},${j},${q.answer},${q.options.length})"><span>${opt}</span></label>`).join('')}
        </div></div>`).join('')}
        <div id="listeningScore" class="hidden text-center mt-24"></div>
      </div>`;
    window._dialogueText = data.dialogue;
    window._listenTotal = data.questions.length;
    window._listenCorrect = 0;
    window._listenDone = 0;
  } catch (e) { $('listeningContent').innerHTML = '<p style="color:var(--text-muted)">No dialogue available for this day.</p>'; }
}

function speakDialogue() {
  speechSynthesis.cancel();
  const lines = window._dialogueText.split('\n').filter(l => l.trim());
  
  // Get available English voices
  const allVoices = speechSynthesis.getVoices();
  const enVoices = allVoices.filter(v => v.lang.startsWith('en'));
  
  // Try to separate male/female voices for variety
  const speakerMap = {};
  let voiceIndex = 0;
  
  let i = 0;
  function speakNext() {
    if (i >= lines.length) return;
    const line = lines[i];
    const u = new SpeechSynthesisUtterance(line);
    u.lang = 'en-US'; u.rate = window._ttsRate || 0.8;
    
    // Detect speaker name (e.g., "You:", "PM:", "Sarah:")
    const speakerMatch = line.match(/^([A-Za-z\s]+):/);
    if (speakerMatch && enVoices.length > 1) {
      const speaker = speakerMatch[1].trim();
      if (!speakerMap[speaker]) {
        speakerMap[speaker] = enVoices[voiceIndex % enVoices.length];
        voiceIndex++;
      }
      u.voice = speakerMap[speaker];
      // Vary pitch slightly per speaker for extra distinction
      u.pitch = 0.8 + (Object.keys(speakerMap).indexOf(speaker) * 0.3);
    }
    
    u.onend = () => { i++; setTimeout(speakNext, 400); };
    speechSynthesis.speak(u);
  }
  
  // Voices may load async, wait a tick
  if (enVoices.length === 0) {
    speechSynthesis.onvoiceschanged = () => speakNext();
    setTimeout(speakNext, 100);
  } else {
    speakNext();
  }
}

function checkListening(qi, sel, ans, total) {
  const q = document.getElementById(`lq-${qi}`);
  if (q.dataset.done) return; q.dataset.done = '1';
  for (let i = 0; i < total; i++) {
    const el = document.getElementById(`lopt-${qi}-${i}`);
    if (i === ans) el.classList.add('correct');
    else if (i === sel) el.classList.add('incorrect');
  }
  window._listenDone++;
  if (sel === ans) window._listenCorrect++;
  if (window._listenDone === window._listenTotal) {
    const score = Math.round((window._listenCorrect / window._listenTotal) * 100);
    document.getElementById('listeningScore').classList.remove('hidden');
    document.getElementById('listeningScore').innerHTML = `<div class="score-circle ${score >= 80 ? 'score-high' : score >= 50 ? 'score-mid' : 'score-low'}">${score}%</div><p>${window._listenCorrect}/${window._listenTotal} correct</p>`;
    API.trackActivity(currentUser.id, 'listening', currentDay, score);
  }
}

// ===== SPEAKING =====
async function renderSpeaking() {
  const mc = $('mainContent');
  mc.innerHTML = `<div class="page-header"><h1>${t('speak.title')}</h1><p>${t('speak.subtitle')}</p></div>
    ${daySelector(15, currentDay, 'loadSpeakingDay')}<div id="speakingContent"></div>`;
  loadSpeakingDay(currentDay);
}

async function loadSpeakingDay(day) {
  currentDay = day;
  try {
    const prompts = await API.getSpeaking(day, currentUser.id);
    $('speakingContent').innerHTML = prompts.length ? prompts.map((p, i) => `
      <div class="card"><h3 class="card-title">🎤 ${p.prompt}</h3>
        <p style="color:var(--text-muted);margin:8px 0;font-size:14px">Category: ${p.category || 'General'}</p>
        <div class="pronunciation-area" id="speakArea-${p.id}">
          <button class="record-btn" id="recBtn-${p.id}" onclick="toggleSpeechRecognition(${p.id})">🎙️</button>
          <p style="margin-top:12px;color:var(--text-muted)">Click to start speaking</p>
        </div>
        <div id="speakResult-${p.id}" class="hidden"></div>
        <div class="mt-16"><button class="btn btn-sm btn-secondary" onclick="document.getElementById('sampleAns-${p.id}').classList.toggle('hidden')">📖 Show Sample Answer</button></div>
        <div class="sample-answer hidden" id="sampleAns-${p.id}"><h4>Sample Answer</h4><p>${p.sample_answer || ''}</p></div>
      </div>`).join('') : '<p style="color:var(--text-muted)">No prompts for this day.</p>';
  } catch (e) { $('speakingContent').innerHTML = `<p>Error: ${e.message}</p>`; }
}

// ===== WRITING =====
async function renderWriting() {
  const mc = $('mainContent');
  mc.innerHTML = `<div class="page-header"><h1>${t('write.title')}</h1><p>${t('write.subtitle')}</p></div>
    ${daySelector(15, currentDay, 'loadWritingDay')}<div id="writingContent"></div>`;
  loadWritingDay(currentDay);
}

async function loadWritingDay(day) {
  currentDay = day;
  try {
    const task = await API.getWriting(day, currentUser.id);
    $('writingContent').innerHTML = `
      <div class="card"><h3 class="card-title">${task.title}</h3><p class="card-subtitle">${task.category || ''} • Target: ${task.word_limit} words</p>
        <div style="margin:16px 0;padding:16px;background:var(--info-bg);border-radius:var(--radius);font-size:15px;color:var(--info)">📝 ${task.prompt}</div>
        <textarea class="writing-area" id="writingAnswer" placeholder="Write your answer here..." oninput="updateWordCount()"></textarea>
        <div class="word-counter" id="wordCounter">0 words</div>
        <div class="flex gap-8 mt-16">
          <button class="btn btn-primary" onclick="submitWriting(${task.id})">Submit Answer</button>
          <button class="btn btn-secondary" onclick="document.getElementById('writingSample').classList.toggle('hidden')">Show Sample</button>
        </div>
        <div id="writingFeedback" class="hidden mt-16"></div>
        <div class="sample-answer hidden mt-16" id="writingSample"><h4>Sample Answer</h4><p style="white-space:pre-line">${task.sample_answer || ''}</p></div>
      </div>`;
  } catch (e) { $('writingContent').innerHTML = '<p style="color:var(--text-muted)">No writing task for this day.</p>'; }
}

function updateWordCount() {
  const text = $('writingAnswer').value.trim();
  const count = text ? text.split(/\s+/).length : 0;
  $('wordCounter').textContent = `${count} words`;
}

async function submitWriting(taskId) {
  const answer = $('writingAnswer').value.trim();
  if (!answer) return toast('Please write something first', 'error');
  try {
    const result = await API.submitWriting(currentUser.id, taskId, answer);
    $('writingFeedback').classList.remove('hidden');
    $('writingFeedback').innerHTML = `
      <div class="card" style="border-color:var(--accent)">
        <div class="score-circle ${result.score >= 80 ? 'score-high' : result.score >= 50 ? 'score-mid' : 'score-low'}">${result.score}%</div>
        <p class="text-center" style="font-size:15px;margin-top:8px">${result.feedback}</p>
        <p class="text-center" style="color:var(--text-muted);font-size:13px;margin-top:4px">Word count: ${result.wordCount}</p>
      </div>`;
    toast('Writing submitted!', 'success');
  } catch (e) { toast(e.message, 'error'); }
}

// ===== PRONUNCIATION =====
function renderPronunciation() {
  const mc = $('mainContent');
  mc.innerHTML = `<div class="page-header"><h1>${t('pron.title')}</h1><p>${t('pron.subtitle')}</p></div>
    <div class="card"><h3 class="card-title mb-16">Type or select a word to practice</h3>
      <div class="form-group"><input type="text" id="pronWord" placeholder="Type an IT term (e.g., algorithm, microservices)" value="algorithm"></div>
      <div class="flex gap-8 mb-24" style="flex-wrap:wrap">
        ${['algorithm', 'microservices', 'database', 'polymorphism', 'encapsulation', 'asynchronous', 'kubernetes', 'PostgreSQL', 'middleware', 'scalability', 'authentication', 'deployment']
      .map(w => `<button class="btn btn-sm btn-secondary" onclick="$('pronWord').value='${w}';startPronPractice()">${w}</button>`).join('')}
      </div>
      <button class="btn btn-primary btn-lg btn-block" onclick="startPronPractice()">Start Practice</button>
    </div>
    <div id="pronArea" class="hidden"></div>`;
}

function startPronPractice() {
  const word = $('pronWord').value.trim();
  if (!word) return toast('Enter a word first', 'error');
  $('pronArea').classList.remove('hidden');
  $('pronArea').innerHTML = `
    <div class="card text-center">
      <h2 style="font-size:36px;margin-bottom:8px">${word}</h2>
      <button class="btn btn-sm btn-secondary mb-24" onclick="speakWord('${word.replace(/'/g, "\\'")}')">🔊 Listen first</button>
      <div class="pronunciation-area" id="pronRecordArea">
        <button class="record-btn" id="pronRecBtn" onclick="startPronRecognition('${word.replace(/'/g, "\\'")}')">🎙️</button>
        <p style="margin-top:12px;color:var(--text-muted)">Click and say: "${word}"</p>
      </div>
      <div id="pronResult" class="hidden"></div>
    </div>`;
}

let _activeRecognition = null;

function startPronRecognition(targetWord) {
  // Stop any active recognition first
  if (_activeRecognition) { try { _activeRecognition.stop(); } catch(e){} _activeRecognition = null; }

  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    toast('Speech recognition not supported in this browser. Please use Chrome.', 'error'); return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  _activeRecognition = recognition;
  recognition.lang = 'en-US'; recognition.continuous = false; recognition.interimResults = false;

  const btn = $('pronRecBtn');
  const area = $('pronRecordArea');
  btn.classList.add('recording'); area.classList.add('recording');
  btn.textContent = '⏹';

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript.toLowerCase().trim();
    const confidence = Math.round(e.results[0][0].confidence * 100);
    const target = targetWord.toLowerCase().trim();

    // Calculate similarity
    const similarity = calculateSimilarity(transcript, target);
    const score = Math.round((similarity * 0.7 + (confidence / 100) * 0.3) * 100);

    btn.classList.remove('recording'); area.classList.remove('recording'); btn.textContent = '🎙️';

    $('pronResult').classList.remove('hidden');
    $('pronResult').innerHTML = `
      <div class="pronunciation-result">
        <div class="score-circle ${score >= 80 ? 'score-high' : score >= 50 ? 'score-mid' : 'score-low'}">${score}%</div>
        <p style="font-size:16px;font-weight:600;margin-top:8px">${score >= 80 ? '🌟 Excellent!' : score >= 50 ? '👍 Good, keep practicing!' : '💪 Try again!'}</p>
        <div style="margin-top:16px;padding:16px;background:var(--bg-input);border-radius:var(--radius)">
          <p><strong>You said:</strong> "${transcript}"</p>
          <p><strong>Target:</strong> "${targetWord}"</p>
          <p><strong>Confidence:</strong> ${confidence}%</p>
          <p><strong>Accuracy:</strong> ${Math.round(similarity * 100)}%</p>
        </div>
        <button class="btn btn-primary mt-16" onclick="startPronRecognition('${targetWord.replace(/'/g, "\\'")}')">Try Again</button>
      </div>`;
  };

  recognition.onerror = (e) => {
    _activeRecognition = null;
    btn.classList.remove('recording'); area.classList.remove('recording'); btn.textContent = '🎙️';
    if (e.error === 'not-allowed') toast('⚠️ Vui lòng cấp quyền microphone! Nhấn biểu tượng 🔒 trên thanh địa chỉ → Cho phép Microphone.', 'error');
    else if (e.error !== 'aborted') toast('Recognition error: ' + e.error, 'error');
  };

  recognition.onend = () => { _activeRecognition = null; };
  recognition.start();
}

function calculateSimilarity(a, b) {
  a = a.toLowerCase(); b = b.toLowerCase();
  if (a === b) return 1;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
  for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  const dist = matrix[b.length][a.length];
  return 1 - dist / Math.max(a.length, b.length);
}

// ===== SPEECH RECOGNITION FOR SPEAKING =====
function toggleSpeechRecognition(promptId) {
  // Stop any active recognition first
  if (_activeRecognition) { try { _activeRecognition.stop(); } catch(e){} _activeRecognition = null; }

  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    toast('Speech recognition not supported. Use Chrome.', 'error'); return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  _activeRecognition = recognition;
  recognition.lang = 'en-US'; recognition.continuous = true; recognition.interimResults = true;

  const btn = document.getElementById(`recBtn-${promptId}`);
  const area = document.getElementById(`speakArea-${promptId}`);
  btn.classList.add('recording'); area.classList.add('recording');
  let fullTranscript = '';

  recognition.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) fullTranscript += e.results[i][0].transcript + ' ';
      else interim += e.results[i][0].transcript;
    }
    area.querySelector('p').textContent = fullTranscript + interim || 'Listening...';
  };

  recognition.onend = async () => {
    btn.classList.remove('recording'); area.classList.remove('recording'); btn.textContent = '🎙️';
    if (fullTranscript.trim()) {
      try {
        const result = await API.evaluateSpeaking(currentUser.id, promptId, fullTranscript.trim());
        const el = document.getElementById(`speakResult-${promptId}`);
        el.classList.remove('hidden');
        el.innerHTML = `<div class="pronunciation-result">
          <div class="score-circle ${result.score >= 80 ? 'score-high' : result.score >= 50 ? 'score-mid' : 'score-low'}">${result.score}%</div>
          <p style="margin-top:8px">${result.feedback}</p>
          <div style="margin-top:12px;padding:12px;background:var(--bg-input);border-radius:var(--radius)"><strong>Your transcript:</strong><br>${fullTranscript}</div>
        </div>`;
      } catch (e) { toast(e.message, 'error'); }
    }
  };

  recognition.onerror = (e) => {
    _activeRecognition = null;
    btn.classList.remove('recording'); area.classList.remove('recording'); btn.textContent = '🎙️';
    if (e.error === 'not-allowed') toast('⚠️ Vui lòng cấp quyền microphone! Nhấn biểu tượng 🔒 trên thanh địa chỉ → Cho phép Microphone.', 'error');
    else if (e.error !== 'no-speech' && e.error !== 'aborted') toast('Error: ' + e.error, 'error');
  };

  // Auto-stop after 30 seconds
  setTimeout(() => recognition.stop(), 30000);
  recognition.start();
  btn.textContent = '⏹';
  btn.onclick = () => { recognition.stop(); btn.onclick = () => toggleSpeechRecognition(promptId); };
}


// ===== INTERVIEW PREP =====
function renderInterview() {
  const questions = [
    { q: "Tell me about yourself.", hint: "Mention your experience, technologies, and what you're looking for.", category: "Self Introduction" },
    { q: "Describe a challenging project you worked on.", hint: "Use STAR: Situation, Task, Action, Result.", category: "Experience" },
    { q: "How do you handle disagreements with team members?", hint: "Show professionalism and collaboration.", category: "Teamwork" },
    { q: "Explain microservices architecture.", hint: "Describe benefits, challenges, and your experience.", category: "Technical" },
    { q: "What is your experience with CI/CD?", hint: "Mention Jenkins, Docker, automated testing.", category: "DevOps" },
    { q: "Why do you want to leave your current company?", hint: "Be positive, focus on growth opportunities.", category: "Motivation" },
    { q: "How do you handle a production incident?", hint: "Describe diagnosis, communication, resolution steps.", category: "Problem Solving" },
    { q: "Explain the difference between SQL and NoSQL databases.", hint: "Compare use cases, strengths, trade-offs.", category: "Technical" },
    { q: "What are your strengths and weaknesses?", hint: "Be honest, show self-awareness and improvement.", category: "Personal" },
    { q: "How do you ensure code quality?", hint: "Mention code reviews, testing, CI/CD, standards.", category: "Technical" },
  ];

  const mc = $('mainContent');
  mc.innerHTML = `<div class="page-header"><h1>${t('int.title')}</h1><p>${t('int.subtitle')}</p></div>
    ${questions.map((q, i) => `
      <div class="interview-scenario">
        <span class="badge badge-algo">${q.category}</span>
        <h4 style="margin-top:8px">${q.q}</h4>
        <p style="color:var(--text-muted);font-size:13px;margin-top:4px">💡 Hint: ${q.hint}</p>
        <div style="margin-top:12px">
          <button class="btn btn-sm btn-primary" onclick="toggleSpeechRecognition(${1000 + i})">🎤 Practice Speaking</button>
          <button class="btn btn-sm btn-secondary" onclick="speakWord('${q.q.replace(/'/g, "\\'")}')">🔊 Listen</button>
        </div>
        <div class="pronunciation-area hidden" id="speakArea-${1000 + i}" style="margin-top:12px;padding:20px">
          <button class="record-btn" id="recBtn-${1000 + i}" style="width:50px;height:50px;font-size:20px">🎙️</button>
          <p style="margin-top:8px;color:var(--text-muted);font-size:13px">Recording...</p>
        </div>
        <div id="speakResult-${1000 + i}" class="hidden"></div>
      </div>`).join('')}`;
}

// ===== DAILY SCENARIOS =====
function renderScenarios() {
  const scenarios = [
    {
      title: "Daily Standup Meeting", icon: "☀️", dialogue: "You: Good morning everyone. Yesterday I finished the API integration for the payment module and wrote unit tests. Today I'll start working on the Kafka consumer for async processing. No blockers.\n\nPM: Great. Any dependency on other teams?\n\nYou: I'll need the schema updates from the database team. Sarah, could you share the migration script?\n\nSarah: Sure, I'll send it after this meeting.",
      practice: ["What did you complete yesterday?", "What will you work on today?", "Do you have any blockers?", "How do you ask for help from a colleague?"]
    },
    {
      title: "Code Review Discussion", icon: "🔍", dialogue: "Reviewer: I noticed you're using a synchronized block here. Have you considered using ConcurrentHashMap instead?\n\nYou: Good point. I used synchronized because the map is accessed from multiple threads. ConcurrentHashMap would be more efficient and reduce contention.\n\nReviewer: Also, this method is doing too many things. Can we break it into smaller functions?\n\nYou: Agreed. I'll refactor it following the single responsibility principle.",
      practice: ["How do you respond to code review feedback?", "How do you explain your technical decisions?", "How do you suggest improvements?"]
    },
    {
      title: "Sprint Planning", icon: "📋", dialogue: "PM: Let's estimate the user authentication feature. What do you think about the complexity?\n\nYou: I'd estimate it as 8 story points. We need to implement JWT authentication, integrate with the existing user database, add role-based access control, and write comprehensive tests.\n\nPM: Can we break it into smaller tasks?\n\nYou: Sure. Task 1: JWT token generation and validation - 3 points. Task 2: Role-based middleware - 3 points. Task 3: Integration tests - 2 points.",
      practice: ["How do you estimate task complexity?", "How do you break down a large task?", "How do you communicate technical effort to non-technical team members?"]
    },
    {
      title: "Client Meeting", icon: "🤝", dialogue: "Client: We need the payment feature to support multiple currencies. Is that feasible?\n\nYou: Yes, it's definitely feasible. We can extend the current payment module to support multi-currency transactions. We'll need to integrate a currency exchange rate API and add a currency selector to the checkout flow.\n\nClient: How long would that take?\n\nYou: I'd estimate about two sprints - roughly four weeks. The first sprint for backend implementation and API integration, and the second sprint for frontend changes and testing.",
      practice: ["How do you explain technical feasibility to a client?", "How do you provide time estimates?", "How do you handle scope change requests?"]
    },
    {
      title: "Production Incident", icon: "🚨", dialogue: "You: Team, we have a P1 incident. The transaction processing service is returning 500 errors. I'm investigating the root cause now.\n\nLead: What's the impact?\n\nYou: About 15% of transactions are failing. I've checked the logs and it seems like a database connection pool exhaustion issue. The pool size is set to 20 but we're seeing 50+ concurrent connections during peak hours.\n\nLead: What's the immediate action?\n\nYou: I'll increase the pool size to 50 and restart the service. For the long-term fix, we should implement connection pooling optimization and add circuit breakers.",
      practice: ["How do you report a production incident?", "How do you describe the impact?", "How do you propose solutions?"]
    },
  ];

  const mc = $('mainContent');
  mc.innerHTML = `<div class="page-header"><h1>${t('scn.title')}</h1><p>${t('scn.subtitle')}</p></div>
    ${scenarios.map((s, i) => `
      <div class="card">
        <div class="card-header"><h3 class="card-title">${s.icon} ${s.title}</h3>
          <button class="btn btn-sm btn-primary" onclick="speakText(document.getElementById('scenarioText-${i}').textContent)">🔊 Listen</button></div>
        <div class="dialogue-text" id="scenarioText-${i}">${s.dialogue.replace(/\n/g, '<br>')}</div>
        <h4 style="margin-top:16px;margin-bottom:8px">🎤 Practice these questions:</h4>
        ${s.practice.map(q => `<div style="padding:8px 0;color:var(--text-secondary);font-size:14px">• ${q}</div>`).join('')}
        <div class="pronunciation-area mt-16" id="speakArea-${2000 + i}" style="padding:20px">
          <button class="record-btn" id="recBtn-${2000 + i}" onclick="toggleSpeechRecognition(${2000 + i})" style="width:50px;height:50px;font-size:20px">🎙️</button>
          <p style="margin-top:8px;color:var(--text-muted)">Practice speaking your answer</p>
        </div>
        <div id="speakResult-${2000 + i}" class="hidden"></div>
      </div>`).join('')}`;
}

// ===== COMPANY REVIEWS (Community-driven) =====
let _selectedCompany = null;

// ===== DICTATION =====
let _dictationVoice = null;
function getBestVoice() {
  if (_dictationVoice) return _dictationVoice;
  const voices = speechSynthesis.getVoices();
  // Prefer Google natural voices (Chrome), then Apple voices (Safari)
  const preferred = ['Google US English', 'Google UK English Female', 'Samantha', 'Karen', 'Daniel'];
  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name));
    if (v) { _dictationVoice = v; return v; }
  }
  const enVoice = voices.find(v => v.lang.startsWith('en'));
  if (enVoice) { _dictationVoice = enVoice; return enVoice; }
  return null;
}

async function renderDictation() {
  const mc = $('mainContent');
  mc.innerHTML = `<div class="page-header"><h1>✏️ Nghe Chép Chính Tả</h1><p>Luyện nghe và chép lại. Cải thiện kỹ năng listening & spelling hiệu quả!</p></div>
    <div class="category-filter" style="margin-bottom:20px">
      <button class="filter-btn active" onclick="loadDictationList('')">📋 Tất cả</button>
      <button class="filter-btn" onclick="loadDictationList('short-stories')">📖 Short Stories</button>
      <button class="filter-btn" onclick="loadDictationList('conversations')">💬 Conversations</button>
      <button class="filter-btn" onclick="loadDictationList('tech-conversations')">💻 Tech/IT</button>
      <button class="filter-btn" onclick="loadDictationList('news')">📰 News</button>
      <button class="filter-btn" onclick="loadDictationList('business')">💼 Business</button>
    </div>
    <div id="dictationArea"></div>`;
  loadDictationList('');
}

async function loadDictationList(category) {
  document.querySelectorAll('.category-filter .filter-btn').forEach(b => b.classList.remove('active'));
  event?.target?.classList?.add('active');
  try {
    const url = '/api/dictation' + (category ? '?category=' + category : '');
    const res = await fetch(url);
    const exercises = await res.json();
    const levelColors = { beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444' };
    const levelIcons = { beginner: '🌱', intermediate: '📗', advanced: '🚀' };
    const catIcons = { 'short-stories': '📖', 'conversations': '💬', 'tech-conversations': '💻', 'news': '📰', 'business': '💼' };
    $('dictationArea').innerHTML = exercises.length ? `<div class="vocab-grid">${exercises.map(ex => `
      <div class="card" style="cursor:pointer;transition:transform .2s" onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform=''" onclick="startDictation(${ex.id})">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <h3 style="font-size:16px;font-weight:700">${catIcons[ex.category] || '📝'} ${ex.title}</h3>
          <span class="badge" style="background:${levelColors[ex.level]}20;color:${levelColors[ex.level]}">${levelIcons[ex.level]} ${ex.level}</span>
        </div>
        <p style="color:var(--text-muted);font-size:13px">${ex.category.replace(/-/g,' ')} • Day ${ex.day_number}</p>
      </div>
    `).join('')}</div>` : '<p style="text-align:center;color:var(--text-muted);padding:40px">Không có bài tập cho danh mục này.</p>';
  } catch(e) { $('dictationArea').innerHTML = '<p>Lỗi tải dữ liệu</p>'; }
}

async function startDictation(id) {
  try {
    const res = await fetch('/api/dictation/' + id);
    const ex = await res.json();
    const sentences = ex.sentences;
    const total = sentences.length;
    
    $('dictationArea').innerHTML = `
      <div class="card" style="margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h2 style="font-size:20px;font-weight:800">${ex.title}</h2>
          <button class="btn btn-sm btn-secondary" onclick="loadDictationList('')">← Quay lại</button>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:16px;align-items:center;flex-wrap:wrap">
          <span class="badge badge-algo">${ex.level}</span>
          <span style="color:var(--text-muted);font-size:14px">📝 ${total} câu</span>
          <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
            <label style="font-size:13px;color:var(--text-muted)">Tốc độ:</label>
            <select id="dictSpeed" style="padding:4px 8px;border-radius:6px;border:1px solid var(--border)" onchange="window._dictRate=parseFloat(this.value)">
              <option value="0.6">Chậm (0.6x)</option>
              <option value="0.8" selected>Bình thường (0.8x)</option>
              <option value="1">Nhanh (1x)</option>
              <option value="1.2">Rất nhanh (1.2x)</option>
            </select>
          </div>
        </div>
        <div style="background:var(--info-bg);padding:12px 16px;border-radius:10px;color:var(--info);font-size:14px;margin-bottom:16px">
          💡 Nhấn <strong>🔊 Nghe</strong> để nghe câu, rồi gõ lại chính xác. Nhấn <strong>Kiểm tra</strong> để xem kết quả. Bạn có thể nghe lại nhiều lần!
        </div>
      </div>
      <div id="dictSentences">${sentences.map((s, i) => `
        <div class="card" id="ds-${i}" style="margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
            <span style="background:var(--primary);color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700">${i+1}</span>
            <button class="btn btn-sm btn-primary" onclick="playDictSentence(${i})">🔊 Nghe</button>
            <button class="btn btn-sm btn-secondary" onclick="playDictSentence(${i}, true)">🐢 Chậm</button>
            <button class="btn btn-sm btn-secondary" onclick="playDictPhrase(${i})" style="background:#fef3c7;color:#92400e;border-color:#fde68a">📝 Từng cụm</button>
            <span id="ds-replay-${i}" style="font-size:12px;color:var(--text-muted)"></span>
          </div>
          <textarea id="ds-input-${i}" rows="2" placeholder="Gõ lại câu bạn nghe được..." style="width:100%;padding:10px;border:2px solid var(--border);border-radius:10px;font-size:15px;font-family:inherit;resize:none" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();checkDictSentence(${i})}"></textarea>
          <div id="ds-result-${i}" style="margin-top:8px;display:none"></div>
        </div>
      `).join('')}</div>
      <div class="card" id="dictFinalScore" style="display:none;text-align:center;padding:30px">
        <h2 style="font-size:24px;font-weight:900;margin-bottom:16px">🎉 Kết Quả</h2>
        <div id="dictScoreContent"></div>
      </div>
      <div style="text-align:center;margin-top:16px">
        <button class="btn btn-primary" onclick="checkAllDictation()">✅ Kiểm tra tất cả</button>
      </div>`;
    
    window._dictSentences = sentences;
    window._dictRate = 0.8;
    window._dictChecked = new Array(total).fill(false);
    window._dictScores = new Array(total).fill(0);
    
    // Preload voices
    speechSynthesis.getVoices();
    
  } catch(e) { $('dictationArea').innerHTML = '<p>Lỗi tải bài tập</p>'; }
}

function playDictSentence(idx, slow) {
  speechSynthesis.cancel();
  const text = window._dictSentences[idx];
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = slow ? 0.5 : (window._dictRate || 0.8);
  u.pitch = 1;
  const voice = getBestVoice();
  if (voice) u.voice = voice;
  speechSynthesis.speak(u);
  const replayEl = document.getElementById(`ds-replay-${idx}`);
  if (replayEl) replayEl.textContent = '🔊 Đang phát...';
  u.onend = () => { if (replayEl) replayEl.textContent = ''; };
}

// Play sentence phrase by phrase (3-5 words at a time)
function playDictPhrase(idx) {
  speechSynthesis.cancel();
  const text = window._dictSentences[idx];
  const words = text.split(/\s+/);
  const chunkSize = 4; // 4 words per phrase
  const phrases = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    phrases.push(words.slice(i, i + chunkSize).join(' '));
  }
  let pi = 0;
  const replayEl = document.getElementById(`ds-replay-${idx}`);
  function playNext() {
    if (pi >= phrases.length) { if (replayEl) replayEl.textContent = ''; return; }
    if (replayEl) replayEl.textContent = `🔊 Cụm ${pi+1}/${phrases.length}`;
    const u = new SpeechSynthesisUtterance(phrases[pi]);
    u.lang = 'en-US'; u.rate = 0.65; u.pitch = 1;
    const voice = getBestVoice();
    if (voice) u.voice = voice;
    u.onend = () => { pi++; setTimeout(playNext, 800); };
    speechSynthesis.speak(u);
  }
  playNext();
}

function checkDictSentence(idx) {
  const input = document.getElementById(`ds-input-${idx}`).value.trim();
  const original = window._dictSentences[idx];
  const resultEl = document.getElementById(`ds-result-${idx}`);
  resultEl.style.display = 'block';
  
  if (!input) { resultEl.innerHTML = '<span style="color:var(--text-muted)">Bạn chưa nhập gì!</span>'; return; }
  
  // Word-by-word comparison
  const origWords = original.replace(/[.,!?;:'"]/g, '').toLowerCase().split(/\s+/);
  const userWords = input.replace(/[.,!?;:'"]/g, '').toLowerCase().split(/\s+/);
  
  let correct = 0;
  const highlighted = origWords.map((w, i) => {
    if (userWords[i] && userWords[i] === w) { correct++; return `<span style="color:#16a34a;font-weight:600">${w}</span>`; }
    return `<span style="color:#ef4444;text-decoration:underline;font-weight:600" title="Bạn gõ: ${userWords[i] || '(thiếu)'}">${w}</span>`;
  }).join(' ');
  
  const score = Math.round((correct / origWords.length) * 100);
  window._dictChecked[idx] = true;
  window._dictScores[idx] = score;
  
  const inputEl = document.getElementById(`ds-input-${idx}`);
  inputEl.style.borderColor = score >= 80 ? '#16a34a' : score >= 50 ? '#f59e0b' : '#ef4444';
  
  resultEl.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-weight:700;color:${score >= 80 ? '#16a34a' : score >= 50 ? '#f59e0b' : '#ef4444'}">${score}% chính xác</span>
        <span style="color:var(--text-muted);font-size:13px">(${correct}/${origWords.length} từ đúng)</span>
      </div>
      <button class="btn btn-sm btn-secondary" onclick="saveVideoSentence(0, 'generic', 0, '${original.replace(/'/g, "\\'")}', '', this)" style="border-radius:20px;padding:4px 12px;font-size:12px">
        <i class="fa-solid fa-bookmark" style="color:#f59e0b;margin-right:2px"></i> ${t('dict.save.sentence')}
      </button>
    </div>
    <div style="padding:10px;background:#f8fafb;border-radius:8px;line-height:1.8;font-size:15px">
      <strong style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Đáp án:</strong>${highlighted}
    </div>`;
  
  // Check if all done
  if (window._dictChecked.every(Boolean)) showDictFinalScore();
}

function checkAllDictation() {
  for (let i = 0; i < window._dictSentences.length; i++) {
    if (!window._dictChecked[i]) checkDictSentence(i);
  }
}

function showDictFinalScore() {
  const avg = Math.round(window._dictScores.reduce((a,b) => a + b, 0) / window._dictScores.length);
  const el = document.getElementById('dictFinalScore');
  el.style.display = 'block';
  document.getElementById('dictScoreContent').innerHTML = `
    <div class="score-circle ${avg >= 80 ? 'score-high' : avg >= 50 ? 'score-mid' : 'score-low'}" style="width:100px;height:100px;font-size:28px;margin:0 auto 16px">${avg}%</div>
    <p style="font-size:16px;color:var(--text-secondary)">${avg >= 90 ? '🏆 Xuất sắc! Bạn nghe rất tốt!' : avg >= 70 ? '👍 Tốt lắm! Cần luyện thêm một chút.' : avg >= 50 ? '📚 Khá ổn. Hãy nghe lại và thử lại nhé.' : '💪 Đừng nản! Nghe chậm và luyện tập thêm.'}</p>
    <button class="btn btn-primary" style="margin-top:16px" onclick="loadDictationList('')">📋 Chọn bài khác</button>`;
  el.scrollIntoView({ behavior: 'smooth' });
}

async function renderCompanies() {
  const mc = $('mainContent');
  mc.innerHTML = `<div class="page-header"><h1>${t('comp.title')}</h1><p>${t('comp.subtitle')}</p></div>
    <div class="card mb-16">
      <div class="flex-between" style="cursor:pointer" onclick="document.getElementById('addCompanyForm').classList.toggle('hidden')">
        <h3 class="card-title" style="margin:0">➕ Thêm công ty mới</h3>
        <span style="font-size:20px">▼</span>
      </div>
      <div id="addCompanyForm" class="hidden" style="margin-top:16px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group"><label>Tên công ty *</label>
            <input type="text" id="newCompanyName" placeholder="e.g. Rikkeisoft"></div>
          <div class="form-group"><label>Mức lương (tham khảo)</label>
            <input type="text" id="newCompanySalary" placeholder="e.g. $800 - $2,000/mo"></div>
          <div class="form-group"><label>Tech Stack (cách nhau bởi dấu phẩy)</label>
            <input type="text" id="newCompanyTags" placeholder="e.g. Java, Spring Boot, AWS"></div>
          <div class="form-group"><label>Mô tả ngắn</label>
            <input type="text" id="newCompanyDesc" placeholder="e.g. Outsource Nhật, training tốt cho fresher"></div>
        </div>
        <button class="btn btn-primary mt-16" onclick="addNewCompany()">🏢 Thêm công ty</button>
      </div>
    </div>
    <div id="companyListArea"><div class="loading"><div class="spinner"></div></div></div>`;
  try {
    const companies = await API.getCompanies();
    window._companiesList = companies;
    const stars = r => { const n = parseFloat(r) || 0; return '★'.repeat(Math.floor(n)) + (n % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(n)); };
    $('companyListArea').innerHTML = `
      <div class="company-grid">${companies.map(c => `
        <div class="company-card" style="cursor:pointer" onclick="openCompanyReviews(${c.id})">
          <h4>${c.name}</h4>
          <div class="company-salary">${c.salary_range || 'Chưa có thông tin'}</div>
          <div class="company-rating">${stars(c.avg_rating || c.rating)} (${c.avg_rating || c.rating}/5)${c.rating_count ? ` <span style="font-size:11px;color:var(--text-muted)">· ${c.rating_count} đánh giá</span>` : ''}</div>
          <div class="company-tags">${(c.tags || '').split(',').filter(Boolean).map(t => `<span class="company-tag">${t.trim()}</span>`).join('')}</div>
          <div class="company-review">${c.description || ''}</div>
          <div style="margin-top:12px;color:var(--sky);font-weight:800;font-size:13px">💬 ${c.review_count || 0} câu hỏi phỏng vấn</div>
        </div>`).join('')}
      </div>`;
  } catch (e) { $('companyListArea').innerHTML = `<p>Error: ${e.message}</p>`; }
}

async function addNewCompany() {
  const name = $('newCompanyName').value.trim();
  if (!name) return toast('Vui lòng nhập tên công ty', 'error');
  try {
    await API.addCompany({
      name,
      salaryRange: $('newCompanySalary').value.trim(),
      tags: $('newCompanyTags').value.trim(),
      description: $('newCompanyDesc').value.trim()
    });
    toast('🎉 Đã thêm công ty thành công!', 'success');
    renderCompanies();
  } catch (e) { toast(e.message, 'error'); }
}

async function openCompanyReviews(companyId) {
  _selectedCompany = companyId;
  const company = window._companiesList.find(c => c.id === companyId);
  const mc = $('mainContent');
  mc.innerHTML = `
    <div class="page-header">
      <button class="btn btn-secondary btn-sm mb-16" onclick="renderCompanies()">← Quay lại danh sách</button>
      <h1>${company.name}</h1>
      <p>${company.salary_range || ''} • ${company.description || ''}</p>
    </div>
    <div class="card mb-16">
      <h3 class="card-title">⭐ Đánh giá công ty này</h3>
      <p style="color:var(--text-muted);font-size:13px;margin-bottom:12px">Rating trung bình: <strong>${company.avg_rating || company.rating}/5</strong> (${company.rating_count || 0} đánh giá)</p>
      <div id="starRating" style="display:flex;gap:4px;font-size:36px;cursor:pointer">
        ${[1, 2, 3, 4, 5].map(s => `<span class="star-btn" data-star="${s}" onclick="rateThisCompany(${companyId},${s})" onmouseenter="highlightStars(${s})" onmouseleave="resetStars()" style="color:#ddd;transition:color 0.15s">★</span>`).join('')}
      </div>
      <p id="ratingMsg" style="font-size:13px;color:var(--text-muted);margin-top:8px">Click để đánh giá</p>
    </div>
    <div class="card">
      <h3 class="card-title">📝 Đóng góp câu hỏi phỏng vấn</h3>
      <p style="color:var(--text-muted);font-size:13px;margin-bottom:16px">Chia sẻ trải nghiệm phỏng vấn của bạn giúp cộng đồng!</p>
      <div class="form-group"><label>Câu hỏi phỏng vấn (bằng tiếng Anh) *</label>
        <input type="text" id="reviewQuestion" placeholder="e.g. How do you handle concurrent requests?"></div>
      <div class="form-group"><label>Gợi ý cách trả lời (bằng tiếng Anh)</label>
        <textarea id="reviewAnswer" placeholder="Share your suggested answer..." style="min-height:80px"></textarea></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
        <div class="form-group"><label>Vị trí ứng tuyển</label>
          <input type="text" id="reviewPosition" placeholder="e.g. Java Developer"></div>
        <div class="form-group"><label>Độ khó</label>
          <select id="reviewDifficulty"><option>Easy</option><option selected>Medium</option><option>Hard</option></select></div>
        <div class="form-group"><label>Kết quả</label>
          <select id="reviewResult"><option value="Passed">✅ Passed</option><option value="Failed">❌ Failed</option><option value="Pending">⏳ Chờ kết quả</option></select></div>
      </div>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:700;font-size:14px">
          <input type="checkbox" id="reviewAnonymous" checked style="width:20px;height:20px">
          🕵️ Đăng ẩn danh
        </label>
      </div>
      <button class="btn btn-primary" onclick="submitCompanyReview(${companyId})">📤 Gửi câu hỏi</button>
    </div>
    <div id="reviewsList"><div class="loading"><div class="spinner"></div></div></div>`;
  loadCompanyReviews(companyId);
  // Load user's existing rating
  try {
    const { rating } = await API.getMyRating(companyId, currentUser.id);
    if (rating > 0) setStars(rating);
  } catch (e) { }
}

function highlightStars(n) {
  document.querySelectorAll('.star-btn').forEach(s => { s.style.color = parseInt(s.dataset.star) <= n ? '#f7b731' : '#ddd'; });
}
function resetStars() {
  const current = window._currentStarRating || 0;
  document.querySelectorAll('.star-btn').forEach(s => { s.style.color = parseInt(s.dataset.star) <= current ? '#f7b731' : '#ddd'; });
}
function setStars(n) {
  window._currentStarRating = n;
  document.querySelectorAll('.star-btn').forEach(s => { s.style.color = parseInt(s.dataset.star) <= n ? '#f7b731' : '#ddd'; });
}
async function rateThisCompany(companyId, rating) {
  try {
    const res = await API.rateCompany(companyId, currentUser.id, rating);
    setStars(rating);
    $('ratingMsg').innerHTML = `✅ Bạn đã đánh giá ${rating}/5 · Rating trung bình mới: <strong>${res.avgRating}/5</strong>`;
    toast(`Đã đánh giá ${rating} sao!`, 'success');
  } catch (e) { toast(e.message, 'error'); }
}

async function loadCompanyReviews(companyId) {
  try {
    const reviews = await API.getCompanyReviews(companyId);
    const diffColors = { Easy: 'badge-algo', Medium: 'badge-data', Hard: 'badge-hw' };
    $('reviewsList').innerHTML = reviews.length ? `
      <div class="card"><h3 class="card-title mb-16">💬 ${reviews.length} câu hỏi từ cộng đồng</h3>
        ${reviews.map((r, i) => `
          <div class="interview-scenario" style="border-left-color:${r.result === 'Passed' ? 'var(--leaf)' : r.result === 'Failed' ? 'var(--fire)' : 'var(--gold)'}">
            <div class="flex-between" style="flex-wrap:wrap;gap:8px">
              <div>
                <span style="font-weight:800;color:var(--text-primary)">${r.is_anonymous ? '🕵️ Ẩn danh' : '👤 ' + r.display_name}</span>
                <span style="font-size:12px;color:var(--text-muted);margin-left:8px">${r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : ''}</span>
              </div>
              <div style="display:flex;gap:6px;align-items:center">
                <span class="badge ${diffColors[r.difficulty] || 'badge-data'}">${r.difficulty}</span>
                ${r.position ? `<span class="badge badge-algo">${r.position}</span>` : ''}
                <span style="font-size:13px;font-weight:800;color:${r.result === 'Passed' ? 'var(--leaf-dark)' : r.result === 'Failed' ? 'var(--fire)' : 'var(--gold-dark)'}">${r.result === 'Passed' ? '✅ Passed' : r.result === 'Failed' ? '❌ Failed' : '⏳ Pending'}</span>
              </div>
            </div>
            <h4 style="margin-top:12px;font-size:16px">❓ ${r.interview_question}</h4>
            <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn btn-sm btn-primary" onclick="speakNatural('${r.interview_question.replace(/'/g, "\\\\'")}', 'question', ${i})">🔊 Nghe câu hỏi</button>
              ${r.suggested_answer ? `<button class="btn btn-sm btn-secondary" onclick="document.getElementById('ans-${r.id}').classList.toggle('hidden')">📖 Xem câu trả lời</button>
              <button class="btn btn-sm btn-sky" onclick="speakNatural('${r.suggested_answer.replace(/'/g, "\\\\'")}', 'answer', ${i})">🔊 Nghe trả lời</button>` : ''}
              <button class="btn btn-sm btn-secondary" onclick="upvoteReview(${r.id}, this)">👍 ${r.upvotes || 0}</button>
            </div>
            ${r.suggested_answer ? `<div class="sample-answer hidden mt-16" id="ans-${r.id}"><h4>💡 Gợi ý trả lời:</h4><p>${r.suggested_answer}</p></div>` : ''}
          </div>`).join('')}
      </div>` : '<div class="card text-center"><p style="color:var(--text-muted)">Chưa có câu hỏi nào cho công ty này. Hãy là người đầu tiên đóng góp!</p></div>';
  } catch (e) { $('reviewsList').innerHTML = `<p>Error: ${e.message}</p>`; }
}

async function submitCompanyReview(companyId) {
  const question = $('reviewQuestion').value.trim();
  if (!question) return toast('Vui lòng nhập câu hỏi phỏng vấn', 'error');
  try {
    await API.submitReview(companyId, {
      userId: currentUser.id,
      displayName: currentUser.display_name || currentUser.username,
      isAnonymous: $('reviewAnonymous').checked ? 1 : 0,
      question,
      answer: $('reviewAnswer').value.trim(),
      difficulty: $('reviewDifficulty').value,
      position: $('reviewPosition').value.trim(),
      result: $('reviewResult').value
    });
    toast('🎉 Cảm ơn bạn đã đóng góp!', 'success');
    $('reviewQuestion').value = '';
    $('reviewAnswer').value = '';
    $('reviewPosition').value = '';
    loadCompanyReviews(companyId);
  } catch (e) { toast(e.message, 'error'); }
}

async function upvoteReview(reviewId, btn) {
  try {
    await API.upvoteReview(reviewId);
    const count = parseInt(btn.textContent.match(/\d+/)?.[0] || 0) + 1;
    btn.textContent = `👍 ${count}`;
    toast('Đã upvote!', 'success');
  } catch (e) { toast(e.message, 'error'); }
}

// ===== NATURAL TTS (alternating male/female voices) =====
function speakNatural(text, type, idx) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = type === 'question' ? 0.85 : 0.8;
  u.pitch = 1.0;

  // Alternate male/female voices for variety
  const voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
  if (voices.length > 0) {
    // Try to find distinct male/female voices
    const femaleVoices = voices.filter(v => /female|samantha|victoria|karen|moira|tessa|fiona/i.test(v.name));
    const maleVoices = voices.filter(v => /male|daniel|alex|tom|james|david|fred/i.test(v.name) && !/female/i.test(v.name));

    if (type === 'question') {
      // Questions use "interviewer" voice - alternate by index
      if (idx % 2 === 0 && femaleVoices.length) u.voice = femaleVoices[idx % femaleVoices.length];
      else if (maleVoices.length) u.voice = maleVoices[idx % maleVoices.length];
      else u.voice = voices[idx % voices.length];
    } else {
      // Answers use opposite gender
      if (idx % 2 === 0 && maleVoices.length) u.voice = maleVoices[idx % maleVoices.length];
      else if (femaleVoices.length) u.voice = femaleVoices[idx % femaleVoices.length];
      else u.voice = voices[(idx + 1) % voices.length];
    }
  }

  speechSynthesis.speak(u);
}

// Preload voices
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}

window._ttsRate = 0.8;

// ===== CHECK-IN / ATTENDANCE =====
async function doCheckin() {
  try {
    const result = await API.checkin(currentUser.id);
    if (result.alreadyCheckedIn) {
      toast(t('checkin.already') || 'Already checked in today! ✅', 'info');
    } else {
      currentUser.streak_days = result.streak;
      localStorage.setItem('user', JSON.stringify(currentUser));
      $('userStreak').textContent = `🔥 ${result.streak} ${t('dash.streak.days')}`;
      toast(`🎉 ${t('checkin.success') || 'Checked in!'} 🔥 ${result.streak} ${t('dash.streak.days')}`, 'success');

      // Show streak milestone popup
      checkStreakMilestone(result.streak);

      // Show badge notification
      if (result.newBadges && result.newBadges.length > 0) {
        for (const badge of result.newBadges) {
          setTimeout(() => showBadgePopup(badge), 500);
        }
      }
    }
    renderCheckinArea();
  } catch (e) { toast(e.message, 'error'); }
}

function checkStreakMilestone(streak) {
  const milestones = {
    3:   { emoji: '🌟', title: '3 Ngày Liên Tục!', msg: 'Bạn đang xây dựng thói quen tốt! Tiếp tục nhé!', color: '#22c55e' },
    7:   { emoji: '🔥', title: '1 Tuần Liên Tục!', msg: 'Tuyệt vời! Một tuần không nghỉ ngày nào! Bạn thật kiên trì!', color: '#f59e0b' },
    14:  { emoji: '💪', title: '2 Tuần Liên Tục!', msg: 'Phong độ là nhất thời, đẳng cấp là mãi mãi! Tiếp tục phá kỷ lục!', color: '#3b82f6' },
    21:  { emoji: '🏅', title: '3 Tuần Liên Tục!', msg: '21 ngày đủ để tạo thói quen! Bạn đã chính thức trở thành "học sinh chăm chỉ"!', color: '#8b5cf6' },
    30:  { emoji: '🏆', title: '30 Ngày - 1 THÁNG!', msg: '🎆 INCREDIBLE! Một tháng học không ngừng nghỉ! Tiếng Anh của bạn chắc chắn đã tiến bộ vượt bậc!', color: '#ef4444' },
    60:  { emoji: '👑', title: '60 Ngày - 2 THÁNG!', msg: 'Bạn là HUYỀN THOẠI! 2 tháng liên tục! Nothing can stop you!', color: '#ec4899' },
    90:  { emoji: '🦅', title: '90 Ngày - 3 THÁNG!', msg: 'Eagle Master! Bạn đủ giỏi để phỏng vấn tiếng Anh rồi! Thử ngay nhé!', color: '#14b8a6' },
    100: { emoji: '💯', title: '100 NGÀY!', msg: '💯 LEGENDARY! 100 ngày liên tục! Bạn là nguồn cảm hứng cho cộng đồng!', color: '#f97316' },
    365: { emoji: '🌍', title: '365 NGÀY - 1 NĂM!', msg: '🎆🎇🏆 THẦN THÁNH! 1 năm không nghỉ! Bạn xứng đáng với mọi thành công!', color: '#dc2626' }
  };
  
  const m = milestones[streak];
  if (!m) return;
  
  // Create confetti
  const confetti = Array.from({length: 50}, () => {
    const colors = ['#ff0', '#f0f', '#0ff', '#f00', '#0f0', '#00f', '#ff6b6b', '#feca57', '#48dbfb'];
    return `<div style="position:fixed;top:-10px;left:${Math.random()*100}%;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>0.5?'50%':'2px'};animation:confetti-fall ${2+Math.random()*3}s ease-in forwards;animation-delay:${Math.random()*0.5}s;z-index:10001;pointer-events:none"></div>`;
  }).join('');
  
  const popup = document.createElement('div');
  popup.innerHTML = `
    ${confetti}
    <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;animation:fadeIn .3s" onclick="this.parentElement.remove()">
      <div style="background:white;border-radius:24px;padding:48px 40px;text-align:center;max-width:420px;box-shadow:0 20px 60px rgba(0,0,0,0.3);animation:popIn .4s ease-out" onclick="event.stopPropagation()">
        <div style="font-size:72px;margin-bottom:16px;animation:bounce 1s infinite">${m.emoji}</div>
        <h2 style="font-size:28px;font-weight:900;color:${m.color};margin-bottom:12px">${m.title}</h2>
        <div style="font-size:48px;font-weight:900;color:${m.color};margin-bottom:16px">🔥 ${streak}</div>
        <p style="font-size:16px;color:#555;line-height:1.6;margin-bottom:24px">${m.msg}</p>
        <button style="background:${m.color};color:white;border:none;padding:14px 40px;border-radius:16px;font-size:16px;font-weight:700;cursor:pointer" onclick="this.closest('[style]').parentElement.remove()">Tiếp tục học! 🚀</button>
      </div>
    </div>`;
  document.body.appendChild(popup);
  
  // Auto remove after 6s
  setTimeout(() => { if (popup.parentElement) popup.remove(); }, 6000);
}

function showBadgePopup(badge) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:10001;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s';
  overlay.onclick = () => overlay.remove();
  overlay.innerHTML = `<div style="background:white;border-radius:24px;padding:48px;text-align:center;max-width:400px;animation:scaleIn 0.4s" onclick="event.stopPropagation()">
    <div style="font-size:80px;margin-bottom:16px">${badge.icon}</div>
    <h2 style="font-weight:900;color:var(--green-800);margin-bottom:8px">${t('checkin.new.badge') || 'New Badge Earned!'}</h2>
    <h3 style="font-weight:800;color:var(--gold-dark);font-size:22px;margin-bottom:16px">${badge.name}</h3>
    <p style="color:var(--text-secondary);margin-bottom:24px">${t('checkin.badge.congrats') || 'Congratulations on your persistence!'}</p>
    <div style="display:flex;gap:12px;justify-content:center">
      <button class="btn btn-primary" onclick="shareBadge('${badge.name.replace(/'/g, "\\'")}','${badge.icon}',${badge.days});this.closest('div[style*=fixed]').remove()">📤 ${t('checkin.share') || 'Share'}</button>
      <button class="btn btn-secondary" onclick="this.closest('div[style*=fixed]').remove()">✕ ${t('checkin.close') || 'Close'}</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
}

async function renderCheckinArea() {
  const area = $('checkinArea');
  if (!area) return;
  try {
    const data = await API.getCheckinStatus(currentUser.id);
    const allMilestones = [
      { days: 3, icon: '🔥', name: '3-Day Starter' },
      { days: 7, icon: '⭐', name: '7-Day Warrior' },
      { days: 14, icon: '💎', name: '14-Day Champion' },
      { days: 21, icon: '🏆', name: '21-Day Master' },
      { days: 30, icon: '👑', name: '30-Day Legend' },
    ];
    const earnedTypes = data.badges.map(b => b.badge_type);

    // Last 7 days calendar
    const today = new Date();
    const days7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const checked = data.recentCheckins.some(c => {
        const cDate = typeof c === 'string' ? c : new Date(c).toISOString().split('T')[0];
        return cDate === dateStr;
      });
      days7.push({ date: d, dateStr, checked, isToday: i === 0 });
    }
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    area.innerHTML = `
      <div class="card" style="border:2px solid var(--gold);background:linear-gradient(135deg,#fffde8,#fff)">
        <div class="flex-between"><h3 class="card-title">📅 ${t('checkin.title') || 'Daily Check-in'}</h3>
          <div style="font-size:13px;font-weight:800;color:var(--text-muted)">${t('checkin.total') || 'Total'}: ${data.totalCheckins} ${t('general.day') || 'days'}</div></div>
        <div style="display:flex;gap:8px;margin:16px 0;justify-content:center">
          ${days7.map(d => `<div style="text-align:center;flex:1">
            <div style="font-size:11px;color:var(--text-muted);font-weight:700;margin-bottom:4px">${dayNames[d.date.getDay()]}</div>
            <div style="width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto;font-size:18px;border:3px solid ${d.isToday ? 'var(--leaf)' : d.checked ? 'var(--gold)' : 'var(--border)'};background:${d.checked ? (d.isToday ? 'var(--leaf)' : 'var(--gold)') : 'white'};color:${d.checked ? 'white' : 'var(--text-muted)'}">
              ${d.checked ? '✓' : d.date.getDate()}
            </div>
          </div>`).join('')}
        </div>
        ${!data.checkedInToday ? `<button class="btn btn-primary btn-block btn-lg" onclick="doCheckin()" style="margin-top:12px">
          ✅ ${t('checkin.btn') || 'CHECK IN TODAY'}</button>` :
      `<div style="text-align:center;padding:12px;background:var(--leaf-bg);border-radius:12px;margin-top:12px;font-weight:800;color:var(--leaf-dark)">
          ✅ ${t('checkin.done') || 'Checked in today!'} · 🔥 ${data.streak} ${t('dash.streak.days')}</div>`}
        <div style="margin-top:20px">
          <h4 style="font-weight:800;margin-bottom:12px">🏅 ${t('checkin.badges') || 'Badges'}</h4>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            ${allMilestones.map(m => {
      const earned = earnedTypes.includes('streak_' + m.days);
      return `<div style="text-align:center;padding:12px;border-radius:16px;border:2px solid ${earned ? 'var(--gold)' : 'var(--border)'};background:${earned ? 'linear-gradient(135deg,#fff8e1,#fffde8)' : '#f5f5f5'};min-width:80px;opacity:${earned ? '1' : '0.5'};cursor:${earned ? 'pointer' : 'default'}" ${earned ? `onclick="shareBadge('${m.name.replace(/'/g, "\\'")}','${m.icon}',${m.days})"` : ''}>
              <div style="font-size:32px">${m.icon}</div>
              <div style="font-size:11px;font-weight:800;margin-top:4px;color:${earned ? 'var(--gold-dark)' : 'var(--text-muted)'}">${m.days} ${t('general.day') || 'days'}</div>
              ${earned ? `<div style="font-size:10px;color:var(--leaf-dark);font-weight:700">📤 Share</div>` : `<div style="font-size:10px;color:var(--text-muted)">🔒</div>`}
            </div>`;
    }).join('')}
          </div>
        </div>
      </div>`;
  } catch (e) { area.innerHTML = ''; }
}

function shareBadge(badgeName, icon, days) {
  // Create shareable image using canvas
  const canvas = document.createElement('canvas');
  canvas.width = 600; canvas.height = 400;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 600, 400);
  grad.addColorStop(0, '#e8f5e9'); grad.addColorStop(1, '#fff8e1');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 600, 400);

  // Border
  ctx.strokeStyle = '#58cc02'; ctx.lineWidth = 4;
  ctx.roundRect(10, 10, 580, 380, 20); ctx.stroke();

  // Icon
  ctx.font = '80px serif'; ctx.textAlign = 'center';
  ctx.fillText(icon, 300, 120);

  // Title
  ctx.fillStyle = '#1b5e20'; ctx.font = 'bold 28px Nunito, sans-serif';
  ctx.fillText('IT Eagle English', 300, 170);

  // Badge name
  ctx.fillStyle = '#e5a800'; ctx.font = 'bold 24px Nunito, sans-serif';
  ctx.fillText(badgeName, 300, 220);

  // Achievement text
  ctx.fillStyle = '#3c3c3c'; ctx.font = '18px Nunito, sans-serif';
  ctx.fillText(`${days} ${t('checkin.consecutive') || 'consecutive days of learning'}!`, 300, 260);

  // User info
  ctx.fillStyle = '#777'; ctx.font = '16px Nunito, sans-serif';
  ctx.fillText(`${currentUser.display_name || currentUser.username} · ${new Date().toLocaleDateString()}`, 300, 310);

  // Website
  ctx.fillStyle = '#58cc02'; ctx.font = 'bold 14px Nunito, sans-serif';
  ctx.fillText('🦅 iteagleenglish.com', 300, 360);

  // Try share API or download
  canvas.toBlob(blob => {
    const file = new File([blob], `badge-${days}days.png`, { type: 'image/png' });
    if (navigator.share && navigator.canShare({ files: [file] })) {
      navigator.share({ title: `${badgeName} - IT Eagle English`, text: `I earned the ${badgeName} badge! ${days} days of learning IT English! 🎉`, files: [file] });
    } else {
      // Fallback: download
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `badge-${days}days.png`;
      a.click();
      toast(t('checkin.downloaded') || 'Badge image downloaded!', 'success');
    }
  });
}
// ===== VIDEO NOTES & PROFILE =====
async function saveVideoSentence(videoId, youtubeId, time, textEn, textVi, btnElement) {
  try {
    const res = await fetch('/api/video-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.id,
        video_id: videoId || 0,
        youtube_id: youtubeId || 'generic',
        time: time,
        text_en: textEn,
        text_vi: textVi,
        category: 'StudyPhim',
        note_description: ''
      })
    });
    const data = await res.json();
    if(data.success) {
      if(btnElement) {
        btnElement.innerHTML = '🌟';
        btnElement.style.opacity = '1';
        btnElement.title = t('video.saved');
      }
      toast(t('video.saved'), 'success');
    }
  } catch(e) {
    toast(t('video.save.error'), 'error');
  }
}

async function renderProfile() {
  const mc = $('mainContent');
  mc.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    const res = await fetch('/api/video-notes/' + currentUser.id);
    const notes = await res.json();
    
    const avatarUrl = currentUser.avatar || '/img/mascot.png';
    
    let histHTML = '';
    if(!notes.length) {
      histHTML = `<div style="padding:40px;text-align:center;background:white;border-radius:12px;border:1px dashed var(--border)">
        <div style="font-size:48px;margin-bottom:12px">📝</div>
        <p style="color:var(--text-muted);font-size:15px">${t('profile.empty')}</p>
        <p style="color:var(--text-muted);font-size:13px">${t('profile.empty.hint')}</p>
      </div>`;
    } else {
      histHTML = notes.map(n => {
        const timeVal = n.time || 0;
        const mins = Math.floor(timeVal / 60);
        const secs = String(timeVal % 60).padStart(2, '0');
        return `
        <div style="background:white; border-radius:12px; padding:16px; margin-bottom:12px; border:1px solid var(--border); box-shadow:0 1px 3px rgba(0,0,0,0.05); transition:transform 0.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px">
            <span class="badge" style="background:#fef3c7; color:#d97706">${n.category||'StudyPhim'}</span>
            <div style="display:flex; gap:8px;">
              <button onclick="speakWord('${n.text_en.replace(/'/g, "\\'")}', 'sentence')" title="${t('profile.listen')}" style="background:#e0f2fe;color:#0284c7;border:none;border-radius:8px;width:36px;height:36px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">🔊</button>
              <button onclick="deleteSavedSentence(${n.id})" title="${t('profile.delete')}" style="background:#fee2e2;color:#dc2626;border:none;border-radius:8px;width:36px;height:36px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">🗑️</button>
            </div>
          </div>
          <div style="font-size:16px; font-weight:600; color:#1a1a2e; line-height:1.5; margin-bottom:4px;">${n.text_en}</div>
          <div style="font-size:14px; color:#666; font-style:italic; margin-bottom:8px;">${n.text_vi || ''}</div>
          ${n.youtube_id && n.youtube_id !== 'generic' && timeVal > 0 ? `
            <a href="#" style="font-size:13px; color:var(--primary); text-decoration:none; font-weight:500;" onclick="navigate('video'); setTimeout(()=>ytAutoOpen('${n.youtube_id}', ${timeVal}), 500); return false;">
              📺 ${t('profile.replay.video')} (${mins}:${secs})
            </a>
          ` : ''}
        </div>`;
      }).join('');
    }
    
    mc.innerHTML = `
      <div class="page-header">
        <h1>${t('profile.title')}</h1>
        <p>${t('profile.subtitle')}</p>
      </div>
      <div style="display:flex; gap:24px; flex-wrap:wrap">
        <div style="flex:1; min-width:300px">
          <div style="background:linear-gradient(135deg, #16a34a 0%, #15803d 100%); color:white; border-radius:16px; padding:32px 24px; text-align:center; box-shadow:0 8px 24px rgba(22,163,74,0.25)">
             <div style="position:relative; display:inline-block; margin-bottom:16px">
               <img src="${avatarUrl}" alt="Avatar" id="profileAvatarImg" style="width:88px; height:88px; border-radius:50%; border:4px solid rgba(255,255,255,0.4); object-fit:cover; display:block; background:white;" />
               <label for="avatarUpload" style="position:absolute;bottom:0;right:0;width:30px;height:30px;border-radius:50%;background:white;color:var(--leaf);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);font-size:14px" title="${t('profile.change.avatar') || 'Change avatar'}">📷</label>
               <input type="file" id="avatarUpload" accept="image/*" style="display:none" onchange="uploadAvatar(this)" />
             </div>
             <h2 style="margin:0 0 8px 0; font-size:22px; font-weight:700">${currentUser.display_name||currentUser.username}</h2>
             <p style="opacity:0.9; margin:0; font-size:14px">📊 ${t('profile.level')}: ${currentUser.english_level || 'Intermediate'}</p>
             <p style="opacity:0.9; margin:4px 0 0; font-size:14px">🔥 ${currentUser.streak_days||0} ${t('profile.streak')}</p>
             <p style="opacity:0.9; margin:4px 0 0; font-size:13px">📧 ${currentUser.email || 'Not set'}</p>
             <div style="margin-top:16px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.2); font-size:13px; opacity:0.8">
               📝 ${notes.length} ${t('profile.saved.count')}
             </div>
          </div>
          
          <div style="background:white;border-radius:12px;padding:20px;margin-top:16px;border:1px solid var(--border)">
            <h3 style="font-size:16px;font-weight:700;margin-bottom:12px">🔔 ${t('profile.reminder.title') || 'Study Reminder'}</h3>
            <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px">${t('profile.reminder.desc') || 'Get reminded at 8:30 PM every day to study English'}</p>
            <button class="btn btn-sm btn-primary" onclick="toggleNotificationPermission()" style="width:100%">
              ${('Notification' in window && Notification.permission === 'granted') ? '✅ ' + (t('profile.reminder.enabled') || 'Notifications Enabled') : '🔔 ' + (t('profile.reminder.enable') || 'Enable Notifications')}
            </button>
          </div>
        </div>
        <div style="flex:2; min-width:300px">
          <h2 style="font-size:20px; font-weight:800; margin-bottom:16px">${t('profile.saved.history')} (${notes.length})</h2>
          <div id="savedNotesArea">${histHTML}</div>
        </div>
      </div>
    `;
  } catch(e) { mc.innerHTML = '<p>Error loading profile data</p>'; }
}

async function deleteSavedSentence(id) {
  if(!confirm(t('profile.delete.confirm'))) return;
  await fetch('/api/video-notes/' + id, {method:'DELETE'});
  renderProfile();
}

// ===== AVATAR UPLOAD =====
async function uploadAvatar(input) {
  const file = input.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('avatar', file);
  try {
    const res = await fetch(`/api/auth/avatar/${currentUser.id}`, { method: 'POST', body: formData });
    const data = await res.json();
    if (data.avatar_url) {
      currentUser.avatar = data.avatar_url;
      localStorage.setItem('user', JSON.stringify(currentUser));
      // Update avatar in profile
      const profileImg = $('profileAvatarImg');
      if (profileImg) profileImg.src = data.avatar_url;
      // Update sidebar avatar
      const avatarEl = $('userAvatar');
      if (avatarEl) avatarEl.innerHTML = `<img src="${data.avatar_url}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
      toast(t('profile.avatar.saved') || 'Avatar updated!', 'success');
    }
  } catch (e) { toast(e.message, 'error'); }
}

// ===== NOTIFICATION TOGGLE =====
function toggleNotificationPermission() {
  if (!('Notification' in window)) { toast('Browser does not support notifications', 'error'); return; }
  if (Notification.permission === 'granted') {
    toast(t('profile.reminder.already') || 'Notifications already enabled!', 'info');
  } else {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') {
        toast(t('profile.reminder.success') || 'Notifications enabled! You will be reminded at 8:30 PM', 'success');
        renderProfile();
      } else {
        toast(t('profile.reminder.denied') || 'Notification permission denied', 'error');
      }
    });
  }
}

window.ytAutoOpen = function(ytid, time) {
  fetch('/api/youtube-listening').then(r=>r.json()).then(vids => {
     let v = vids.find(x => x.youtube_id === ytid);
     if(v) {
       openYouTubeExercise(v.id).then(() => {
         setTimeout(() => ytSeekTo(time), 1000); 
       });
     }
  });
}
