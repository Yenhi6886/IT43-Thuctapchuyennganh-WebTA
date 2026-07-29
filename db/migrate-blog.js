require('dotenv').config();
const { query } = require('./database');

async function migrateBlog() {
  try {
    // Create blog_posts table
    await query(`CREATE TABLE IF NOT EXISTS blog_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(500) NOT NULL,
      meta_description VARCHAR(500),
      meta_keywords VARCHAR(500),
      thumbnail VARCHAR(500),
      content LONGTEXT NOT NULL,
      category VARCHAR(100) DEFAULT 'general',
      author VARCHAR(100) DEFAULT 'Eagle English',
      is_published TINYINT DEFAULT 1,
      view_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    console.log('✅ Created blog_posts table');

    // Seed SEO articles
    const articles = [
      {
        slug: 'tu-hoc-tieng-anh-cho-developer',
        title: 'Tự Học Tiếng Anh Cho Developer: Lộ Trình Từ Zero Đến Hero',
        meta_description: 'Hướng dẫn chi tiết cách tự học tiếng Anh cho developer, lập trình viên. Từ vựng IT, kỹ năng đọc tài liệu, phỏng vấn tiếng Anh.',
        meta_keywords: 'tự học tiếng anh cho developer, tiếng anh cho lập trình viên, tiếng anh IT',
        category: 'learning-tips',
        content: `<h2>Tại Sao Developer Cần Giỏi Tiếng Anh?</h2>
<p>Trong ngành công nghệ thông tin, <strong>tiếng Anh</strong> không chỉ là một kỹ năng bổ trợ mà là <strong>yêu cầu bắt buộc</strong>. Hầu hết tài liệu kỹ thuật, documentation, Stack Overflow, GitHub đều viết bằng tiếng Anh.</p>

<h2>Lộ Trình Học Tiếng Anh Cho Dev</h2>
<h3>Giai đoạn 1: Từ Vựng IT Cơ Bản (1-2 tháng)</h3>
<p>Bắt đầu với <strong>150-200 từ vựng IT cơ bản</strong> như: algorithm, database, deployment, middleware, authentication, API, microservices. Trên <a href="https://engfordev.top">Eagle English</a>, bạn có thể học 10-15 từ mới mỗi ngày với flashcards và phát âm AI.</p>

<h3>Giai đoạn 2: Đọc Tài Liệu Kỹ Thuật (2-3 tháng)</h3>
<p>Tập đọc documentation của React, Spring Boot, Docker. Bắt đầu với các tutorial đơn giản, dần chuyển sang đọc RFC và design documents.</p>

<h3>Giai đoạn 3: Nghe & Nói (3-6 tháng)</h3>
<p>Nghe podcast tech như Syntax.fm, xem video YouTube về coding. Luyện nói bằng cách tham gia daily standup bằng tiếng Anh.</p>

<h3>Giai đoạn 4: Phỏng Vấn Tiếng Anh (6+ tháng)</h3>
<p>Luyện trả lời câu hỏi phỏng vấn: "Tell me about yourself", "Describe a challenging project", "How do you handle deadlines?"</p>

<h2>5 Mẹo Học Tiếng Anh Hiệu Quả Cho Dev</h2>
<ol>
<li><strong>Đọc code comments bằng tiếng Anh</strong> - Viết commit message, PR description bằng tiếng Anh</li>
<li><strong>Chuyển IDE sang tiếng Anh</strong> - Làm quen với giao diện tiếng Anh sớm</li>
<li><strong>Tham gia cộng đồng quốc tế</strong> - Discord, Reddit, Stack Overflow</li>
<li><strong>Học 15 phút mỗi ngày</strong> - Kiên trì quan trọng hơn học nhiều giờ một lúc</li>
<li><strong>Sử dụng Eagle English</strong> - Nội dung chuyên biệt cho developer với 5000+ từ vựng IT</li>
</ol>

<h2>Kết Luận</h2>
<p>Học tiếng Anh cho developer không khó, nhưng cần <strong>kiên trì và đúng phương pháp</strong>. Bắt đầu ngay hôm nay với <a href="https://engfordev.top">Eagle English</a> - nền tảng tự học tiếng Anh miễn phí cho dân IT!</p>`
      },
      {
        slug: 'tieng-anh-cho-dan-it-bat-dau-tu-dau',
        title: 'Tiếng Anh Cho Dân IT: Bắt Đầu Từ Đâu Khi Mất Gốc?',
        meta_description: 'Hướng dẫn học tiếng Anh cho dân IT mất gốc. Phương pháp học hiệu quả, từ vựng chuyên ngành, và công cụ hỗ trợ miễn phí.',
        meta_keywords: 'tiếng anh cho dân it, tiếng anh mất gốc, học tiếng anh IT từ đầu',
        category: 'learning-tips',
        content: `<h2>Dân IT Mất Gốc Tiếng Anh - Đừng Lo!</h2>
<p>Bạn là một <strong>developer giỏi</strong> nhưng tiếng Anh thì... "méo mó"? Đừng lo, rất nhiều người đi làm IT gặp tình trạng tương tự. Bài viết này sẽ giúp bạn xây dựng lại nền tảng tiếng Anh từ con số 0.</p>

<h2>Bước 1: Xác Định Mục Tiêu</h2>
<p>Với dân IT, bạn cần tiếng Anh cho 4 mục đích chính:</p>
<ul>
<li>Đọc documentation và Stack Overflow</li>
<li>Viết email, Jira ticket, PR description</li>
<li>Họp standup, sprint planning bằng tiếng Anh</li>
<li>Phỏng vấn tại công ty nước ngoài</li>
</ul>

<h2>Bước 2: Học Từ Vựng IT Trước</h2>
<p>Thay vì học ngữ pháp khô khan, hãy bắt đầu với <strong>từ vựng IT thực tế</strong> mà bạn gặp hàng ngày. Trên <a href="https://engfordev.top">Eagle English</a>, chúng tôi phân loại từ vựng theo chuyên ngành: Frontend, Backend, DevOps, Testing, Database...</p>

<h2>Bước 3: Immersion - Ngâm Mình Trong Tiếng Anh</h2>
<p>Đổi ngôn ngữ điện thoại, laptop sang English. Xem YouTube tech channels: Fireship, Traversy Media, The Net Ninja. Đọc blog: dev.to, Medium, Hacker News.</p>

<h2>Bước 4: Practice Daily</h2>
<p>Sử dụng <a href="https://engfordev.top">Eagle English</a> mỗi ngày 15-20 phút. Hệ thống check-in và streak sẽ giúp bạn duy trì động lực học tập.</p>

<h2>Công Cụ Miễn Phí Hỗ Trợ Dân IT Học Tiếng Anh</h2>
<ol>
<li><strong>Eagle English (engfordev.top)</strong> - Nền tảng chuyên biệt cho dân IT</li>
<li><strong>Anki</strong> - Flashcard ghi nhớ từ vựng</li>
<li><strong>Grammarly</strong> - Kiểm tra ngữ pháp khi viết email</li>
<li><strong>Google Translate</strong> - Tra từ nhanh</li>
</ol>`
      },
      {
        slug: 'tu-vung-tieng-anh-phong-van-it',
        title: 'Top 100 Từ Vựng Tiếng Anh Phỏng Vấn IT Thường Gặp Nhất',
        meta_description: 'Danh sách 100 từ vựng tiếng Anh phỏng vấn IT phổ biến nhất. Chuẩn bị phỏng vấn Developer, Tester, BA, DevOps bằng tiếng Anh.',
        meta_keywords: 'từ vựng tiếng anh phỏng vấn IT, phỏng vấn developer tiếng anh, tiếng anh phỏng vấn',
        category: 'vocabulary',
        content: `<h2>Chuẩn Bị Phỏng Vấn IT Bằng Tiếng Anh</h2>
<p>Phỏng vấn bằng tiếng Anh là rào cản lớn nhất với nhiều developer Việt Nam. Dưới đây là <strong>100 từ vựng và cụm từ quan trọng nhất</strong> bạn cần nắm vững.</p>

<h2>Nhóm 1: Giới Thiệu Bản Thân</h2>
<ul>
<li><strong>Background</strong> - Nền tảng, kinh nghiệm</li>
<li><strong>Proficient in</strong> - Thành thạo về</li>
<li><strong>Hands-on experience</strong> - Kinh nghiệm thực tế</li>
<li><strong>Track record</strong> - Thành tích, lịch sử làm việc</li>
<li><strong>Passionate about</strong> - Đam mê về</li>
</ul>

<h2>Nhóm 2: Technical Skills</h2>
<ul>
<li><strong>Scalability</strong> - Khả năng mở rộng</li>
<li><strong>Maintainability</strong> - Khả năng bảo trì</li>
<li><strong>Performance optimization</strong> - Tối ưu hiệu suất</li>
<li><strong>Code refactoring</strong> - Tái cấu trúc mã nguồn</li>
<li><strong>Best practices</strong> - Phương pháp tốt nhất</li>
</ul>

<h2>Nhóm 3: Teamwork & Communication</h2>
<ul>
<li><strong>Cross-functional team</strong> - Nhóm liên chức năng</li>
<li><strong>Stakeholder</strong> - Bên liên quan</li>
<li><strong>Deadline-driven</strong> - Làm việc theo deadline</li>
<li><strong>Conflict resolution</strong> - Giải quyết xung đột</li>
<li><strong>Constructive feedback</strong> - Phản hồi mang tính xây dựng</li>
</ul>

<h2>Câu Hỏi Phỏng Vấn Mẫu</h2>
<ol>
<li>"Tell me about yourself and your experience" - Hãy cho biết về bạn và kinh nghiệm</li>
<li>"What is your greatest strength as a developer?" - Điểm mạnh nhất của bạn là gì?</li>
<li>"How do you handle tight deadlines?" - Bạn xử lý deadline gấp như thế nào?</li>
<li>"Describe a challenging bug you fixed" - Mô tả một bug khó mà bạn đã sửa</li>
</ol>

<p>Luyện tập phỏng vấn tiếng Anh IT ngay tại <a href="https://engfordev.top">Eagle English</a>!</p>`
      },
      {
        slug: 'tieng-anh-cho-nguoi-di-lam',
        title: 'Tiếng Anh Cho Người Đi Làm: Giao Tiếp Văn Phòng Như Native',
        meta_description: 'Học tiếng Anh giao tiếp văn phòng cho người đi làm. Email, meeting, presentation bằng tiếng Anh chuyên nghiệp.',
        meta_keywords: 'tiếng anh cho người đi làm, tiếng anh giao tiếp văn phòng, tiếng anh công sở',
        category: 'business-english',
        content: `<h2>Tiếng Anh Văn Phòng - Kỹ Năng Không Thể Thiếu</h2>
<p>Trong môi trường làm việc quốc tế, <strong>tiếng Anh giao tiếp văn phòng</strong> là yếu tố quyết định sự thăng tiến của bạn.</p>

<h2>Viết Email Chuyên Nghiệp</h2>
<p>Mẫu email phổ biến:</p>
<ul>
<li><strong>Opening:</strong> "I hope this email finds you well" / "Thank you for your prompt response"</li>
<li><strong>Request:</strong> "Could you please..." / "I would appreciate if you could..."</li>
<li><strong>Closing:</strong> "Best regards" / "Looking forward to hearing from you"</li>
</ul>

<h2>Họp Bằng Tiếng Anh</h2>
<p>Các cụm từ quan trọng trong meeting:</p>
<ul>
<li>"Let me share my screen" - Hãy để tôi chia sẻ màn hình</li>
<li>"Can everyone see my screen?" - Mọi người thấy màn hình tôi chưa?</li>
<li>"I'd like to add a point" - Tôi muốn bổ sung một ý</li>
<li>"Let's take this offline" - Để ngoài meeting mình trao đổi thêm</li>
</ul>

<h2>Presentation Tips</h2>
<p>Cách mở đầu ấn tượng: "Today, I'd like to walk you through..." hoặc "Let me give you an overview of..."</p>

<p>Học thêm tại <a href="https://engfordev.top">Eagle English</a> - nội dung riêng cho người đi làm!</p>`
      },
      {
        slug: 'tieng-anh-mien-phi-hoc-o-dau',
        title: 'Học Tiếng Anh Miễn Phí Ở Đâu? Top 10 Nguồn Tài Liệu Tốt Nhất 2024',
        meta_description: 'Tổng hợp 10 nguồn học tiếng Anh miễn phí tốt nhất. Từ ứng dụng, website đến kênh YouTube cho mọi đối tượng.',
        meta_keywords: 'học tiếng anh miễn phí, tiếng anh miễn phí ở đâu, tự học tiếng anh free',
        category: 'resources',
        content: `<h2>Học Tiếng Anh Miễn Phí - Hoàn Toàn Có Thể!</h2>
<p>Bạn không cần chi hàng triệu đồng cho các trung tâm. Dưới đây là <strong>10 nguồn học tiếng Anh miễn phí</strong> chất lượng nhất.</p>

<h2>1. Eagle English (engfordev.top) ⭐</h2>
<p>Nền tảng <strong>tự học tiếng Anh miễn phí</strong> được thiết kế riêng cho từng đối tượng: developer, tester, sinh viên, người đi làm, trẻ em. Tính năng nổi bật:</p>
<ul>
<li>5000+ từ vựng theo chủ đề chuyên ngành</li>
<li>Luyện 4 kỹ năng: Reading, Listening, Speaking, Writing</li>
<li>Phát âm AI với Speech Recognition</li>
<li>Phỏng vấn tiếng Anh IT</li>
<li>Streak & Check-in động lực học mỗi ngày</li>
</ul>

<h2>2. Duolingo</h2>
<p>App học tiếng Anh phổ biến nhất thế giới. Phù hợp cho người mới bắt đầu.</p>

<h2>3. BBC Learning English</h2>
<p>Tài liệu chất lượng cao từ BBC. Phù hợp luyện nghe và đọc.</p>

<h2>4. YouTube Channels</h2>
<p>English with Lucy, Rachel's English, EngVid - hàng nghìn video miễn phí.</p>

<h2>5. TED Talks</h2>
<p>Luyện nghe với phụ đề, nội dung tri thức và truyền cảm hứng.</p>

<h2>Kết Luận</h2>
<p>Có rất nhiều nguồn học tiếng Anh miễn phí. Nhưng nếu bạn là dân IT hoặc người đi làm, <a href="https://engfordev.top"><strong>Eagle English</strong></a> là lựa chọn tốt nhất vì nội dung được cá nhân hóa theo nghề nghiệp của bạn!</p>`
      }
    ];

    for (const a of articles) {
      await query(
        'INSERT IGNORE INTO blog_posts (slug, title, meta_description, meta_keywords, category, content, author) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [a.slug, a.title, a.meta_description, a.meta_keywords, a.category, a.content, 'Eagle English']
      );
      console.log(`  📝 ${a.slug}`);
    }

    console.log('✅ Blog migration completed!');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

migrateBlog();
