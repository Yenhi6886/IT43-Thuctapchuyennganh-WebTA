// Lớp gọi API dùng chung cho trang học (index.html). Mỗi hàm bên dưới ứng với một route trong server.js.
const API = {
  base: '',
  // Hàm gốc: gửi fetch kèm JSON; nếu server trả lỗi (status khác 2xx) thì ném Error với thông báo từ server
  async request(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(this.base + path, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Request failed');
    }
    return res.json();
  },
  // Auth
  // [ĐANG DÙNG] Đăng nhập → POST /api/auth/login
  login: (u, p) => API.request('POST', '/api/auth/login', { username: u, password: p }),
  // [ĐANG DÙNG] Đăng ký → POST /api/auth/register
  register: (u, p, n, level, role, lang, topics) => API.request('POST', '/api/auth/register', { username: u, password: p, display_name: n, english_level: level, job_role: role, language: lang || 'vi', topics: topics || [] }),
  setLanguage: (userId, language) => API.request('PUT', '/api/auth/language', { userId, language }),
  updateTopics: (userId, topicIds) => API.request('PUT', '/api/auth/topics', { userId, topicIds }),
  getTopics: () => API.request('GET', '/api/topics'),
  // Vocab
  getDailyVocab: (userId, day) => API.request('GET', `/api/vocabulary/daily/${userId}?day=${day}`),
  // [ĐANG DÙNG] Danh mục từ vựng + số từ → GET /api/vocabulary/categories
  getVocabCategories: (userId) => API.request('GET', `/api/vocabulary/categories${userId ? '?userId=' + userId : ''}`),
  // [ĐANG DÙNG] Từ vựng theo danh mục/bộ lọc, có thể phân trang → GET /api/vocabulary/by-category/:userId
  getVocabByCategory: (userId, category, filter, page, limit) => {
    let url = `/api/vocabulary/by-category/${userId}?`;
    if (category) url += 'category=' + encodeURIComponent(category) + '&';
    if (filter) url += 'filter=' + filter + '&';
    if (page != null) url += 'page=' + page + '&';
    if (limit != null) url += 'limit=' + limit + '&';
    return API.request('GET', url);
  },
  // [ĐANG DÙNG] Toàn bộ từ của một danh mục (để gạch chân từ trong truyện) → GET /api/vocabulary/all
  getAllVocab: (cat, userId) => { let url = '/api/vocabulary/all?'; if (cat) url += 'category=' + encodeURIComponent(cat) + '&'; if (userId) url += 'userId=' + userId; return API.request('GET', url); },
  // [ĐANG DÙNG] Đánh dấu đã biết / cần ôn một từ → POST /api/vocabulary/learn
  learnWord: (userId, vocabId, correct) => API.request('POST', '/api/vocabulary/learn', { userId, vocabularyId: vocabId, correct }),
  // Reading
  getReading: (day, userId) => API.request('GET', `/api/reading/${day}${userId ? '?userId=' + userId : ''}`),
  getReadingTopics: () => API.request('GET', '/api/reading/topics'),
  // [ĐANG DÙNG] Danh sách truyện → GET /api/reading/list
  getReadingList: (category) => API.request('GET', `/api/reading/list${category ? '?category=' + encodeURIComponent(category) : ''}`),
  // [ĐANG DÙNG] Nội dung một truyện → GET /api/reading/story/:id
  getReadingStory: (id) => API.request('GET', `/api/reading/story/${id}`),
  // [ĐANG DÙNG] Chủ đề Shadowing + số video → GET /api/shadowing/topics
  getShadowingTopics: () => API.request('GET', '/api/shadowing/topics'),
  // Listening
  getListening: (day, userId) => API.request('GET', `/api/listening/${day}${userId ? '?userId=' + userId : ''}`),
  // Grammar
  // [ĐANG DÙNG] Các dạng ngữ pháp có dữ liệu → GET /api/grammar/types
  getGrammarTypes: (kind) => API.request('GET', `/api/grammar/types${kind ? '?kind=' + kind : ''}`),
  // [ĐANG DÙNG] Bài lý thuyết theo dạng → GET /api/grammar/lessons-by-type/:type
  getGrammarLessonsByType: (type) => API.request('GET', `/api/grammar/lessons-by-type/${encodeURIComponent(type)}`),
  // [ĐANG DÙNG] Bài tập theo dạng, kèm kết quả đã làm của user → GET /api/grammar/exercises-by-type/:type
  getGrammarExercisesByType: (type, userId) => {
    let url = `/api/grammar/exercises-by-type/${encodeURIComponent(type)}`;
    if (userId) url += '?userId=' + userId;
    return API.request('GET', url);
  },
  // [ĐANG DÙNG] Lưu đáp án một câu ngữ pháp → POST /api/grammar/answer
  submitGrammarAnswer: (userId, exerciseId, selected, correct) =>
    API.request('POST', '/api/grammar/answer', { userId, exerciseId, selected, correct }),
  getGrammar: (day) => API.request('GET', `/api/grammar/${day}`),
  // Writing
  getWriting: (day, userId) => API.request('GET', `/api/writing/${day}${userId ? '?userId=' + userId : ''}`),
  submitWriting: (userId, taskId, answer) => API.request('POST', '/api/writing/submit', { userId, taskId, answer }),
  // Speaking
  getSpeaking: (day, userId) => API.request('GET', `/api/speaking/${day}${userId ? '?userId=' + userId : ''}`),
  evaluateSpeaking: (userId, promptId, transcript) => API.request('POST', '/api/speaking/evaluate', { userId, promptId, transcript }),
  // Progress
  getProgress: (userId) => API.request('GET', `/api/progress/${userId}`),
  // [ĐANG DÙNG] Ghi điểm khi hoàn thành một bộ bài (ngữ pháp) → POST /api/progress/activity
  trackActivity: (userId, type, id, score) => API.request('POST', '/api/progress/activity', { userId, activityType: type, activityId: id, score }),
  // Companies
  getCompanies: () => API.request('GET', '/api/companies'),
  addCompany: (data) => API.request('POST', '/api/companies', data),
  getCompanyReviews: (companyId) => API.request('GET', `/api/companies/${companyId}/reviews`),
  submitReview: (companyId, data) => API.request('POST', `/api/companies/${companyId}/reviews`, data),
  upvoteReview: (reviewId) => API.request('POST', `/api/companies/reviews/${reviewId}/upvote`),
  rateCompany: (companyId, userId, rating) => API.request('POST', `/api/companies/${companyId}/rate`, { userId, rating }),
  getMyRating: (companyId, userId) => API.request('GET', `/api/companies/${companyId}/my-rating?userId=${userId}`),
  getCompanyDetail: (companyId) => API.request('GET', `/api/companies/${companyId}/detail`),
  // Check-in
  checkin: (userId) => API.request('POST', '/api/checkin', { userId }),
  getCheckinStatus: (userId) => API.request('GET', `/api/checkin/${userId}`),
  getBadges: (userId) => API.request('GET', `/api/badges/${userId}`),
};
