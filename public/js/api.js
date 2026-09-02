const API = {
  base: '',
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
  login: (u, p) => API.request('POST', '/api/auth/login', { username: u, password: p }),
  register: (u, p, n, level, role, lang, topics) => API.request('POST', '/api/auth/register', { username: u, password: p, display_name: n, english_level: level, job_role: role, language: lang || 'vi', topics: topics || [] }),
  setLanguage: (userId, language) => API.request('PUT', '/api/auth/language', { userId, language }),
  updateTopics: (userId, topicIds) => API.request('PUT', '/api/auth/topics', { userId, topicIds }),
  getTopics: () => API.request('GET', '/api/topics'),
  // Vocab
  getDailyVocab: (userId, day) => API.request('GET', `/api/vocabulary/daily/${userId}?day=${day}`),
  getVocabCategories: (userId) => API.request('GET', `/api/vocabulary/categories${userId ? '?userId=' + userId : ''}`),
  getVocabByCategory: (userId, category, filter) => {
    let url = `/api/vocabulary/by-category/${userId}?`;
    if (category) url += 'category=' + encodeURIComponent(category) + '&';
    if (filter) url += 'filter=' + filter;
    return API.request('GET', url);
  },
  getAllVocab: (cat, userId) => { let url = '/api/vocabulary/all?'; if (cat) url += 'category=' + encodeURIComponent(cat) + '&'; if (userId) url += 'userId=' + userId; return API.request('GET', url); },
  learnWord: (userId, vocabId, correct) => API.request('POST', '/api/vocabulary/learn', { userId, vocabularyId: vocabId, correct }),
  // Reading
  getReading: (day, userId) => API.request('GET', `/api/reading/${day}${userId ? '?userId=' + userId : ''}`),
  getReadingTopics: () => API.request('GET', '/api/reading/topics'),
  getReadingList: (category) => API.request('GET', `/api/reading/list${category ? '?category=' + encodeURIComponent(category) : ''}`),
  getReadingStory: (id) => API.request('GET', `/api/reading/story/${id}`),
  getShadowingTopics: () => API.request('GET', '/api/shadowing/topics'),
  // Listening
  getListening: (day, userId) => API.request('GET', `/api/listening/${day}${userId ? '?userId=' + userId : ''}`),
  // Grammar
  getGrammarTypes: () => API.request('GET', '/api/grammar/types'),
  getGrammarLessonsByType: (type) => API.request('GET', `/api/grammar/lessons-by-type/${encodeURIComponent(type)}`),
  getGrammarExercisesByType: (type) => API.request('GET', `/api/grammar/exercises-by-type/${encodeURIComponent(type)}`),
  getGrammar: (day) => API.request('GET', `/api/grammar/${day}`),
  // Writing
  getWriting: (day, userId) => API.request('GET', `/api/writing/${day}${userId ? '?userId=' + userId : ''}`),
  submitWriting: (userId, taskId, answer) => API.request('POST', '/api/writing/submit', { userId, taskId, answer }),
  // Speaking
  getSpeaking: (day, userId) => API.request('GET', `/api/speaking/${day}${userId ? '?userId=' + userId : ''}`),
  evaluateSpeaking: (userId, promptId, transcript) => API.request('POST', '/api/speaking/evaluate', { userId, promptId, transcript }),
  // Progress
  getProgress: (userId) => API.request('GET', `/api/progress/${userId}`),
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
