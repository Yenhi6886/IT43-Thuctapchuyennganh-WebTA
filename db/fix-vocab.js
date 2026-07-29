require('dotenv').config();
const { query } = require('./database');

// Từ vựng ĐÚNG cho từng topic & category
const topicVocab = {
  developer: {
    'Algorithms': [
      { term: 'Algorithm', definition_en: 'A step-by-step procedure for solving a problem', definition_vi: 'Thuật toán', example1: 'This sorting algorithm runs in O(n log n) time.' },
      { term: 'Binary Search', definition_en: 'Search algorithm that divides the array in half', definition_vi: 'Tìm kiếm nhị phân', example1: 'Binary search works only on sorted arrays.' },
      { term: 'Recursion', definition_en: 'A function that calls itself', definition_vi: 'Đệ quy', example1: 'Use recursion to traverse the tree structure.' },
      { term: 'Big O Notation', definition_en: 'Describes the performance of an algorithm', definition_vi: 'Ký hiệu Big O', example1: 'The time complexity is O(n²) in the worst case.' },
      { term: 'Hash Map', definition_en: 'Data structure that maps keys to values', definition_vi: 'Bảng băm', example1: 'Use a hash map for constant-time lookups.' },
      { term: 'Stack', definition_en: 'LIFO data structure', definition_vi: 'Ngăn xếp', example1: 'The call stack tracks function execution.' },
      { term: 'Queue', definition_en: 'FIFO data structure', definition_vi: 'Hàng đợi', example1: 'Use a message queue for async processing.' },
      { term: 'Linked List', definition_en: 'Linear data structure with nodes', definition_vi: 'Danh sách liên kết', example1: 'A linked list allows efficient insertion.' },
      { term: 'Graph', definition_en: 'Data structure with nodes and edges', definition_vi: 'Đồ thị', example1: 'Social networks can be modeled as graphs.' },
      { term: 'Tree', definition_en: 'Hierarchical data structure', definition_vi: 'Cây', example1: 'DOM is represented as a tree structure.' },
    ],
    'Backend': [
      { term: 'API', definition_en: 'Application Programming Interface', definition_vi: 'Giao diện lập trình ứng dụng', example1: 'Our REST API returns JSON responses.' },
      { term: 'Middleware', definition_en: 'Software between OS and applications', definition_vi: 'Phần mềm trung gian', example1: 'Add authentication middleware to protect routes.' },
      { term: 'Endpoint', definition_en: 'URL where API services are accessed', definition_vi: 'Điểm cuối', example1: 'The /api/users endpoint returns user data.' },
      { term: 'Authentication', definition_en: 'Process of verifying identity', definition_vi: 'Xác thực', example1: 'We use JWT for authentication.' },
      { term: 'Authorization', definition_en: 'Process of granting access rights', definition_vi: 'Phân quyền', example1: 'Only admin users have authorization to delete.' },
      { term: 'Server', definition_en: 'Computer that processes requests', definition_vi: 'Máy chủ', example1: 'Deploy the application to the production server.' },
      { term: 'Database', definition_en: 'Organized collection of data', definition_vi: 'Cơ sở dữ liệu', example1: 'Store user data in the MySQL database.' },
      { term: 'Microservice', definition_en: 'Small, independent service', definition_vi: 'Vi dịch vụ', example1: 'Each microservice handles a specific domain.' },
      { term: 'REST', definition_en: 'Representational State Transfer', definition_vi: 'Kiến trúc REST', example1: 'Design RESTful APIs with proper HTTP methods.' },
      { term: 'Cache', definition_en: 'Temporary storage for fast access', definition_vi: 'Bộ nhớ đệm', example1: 'Use Redis cache to reduce database load.' },
    ],
    'Frontend': [
      { term: 'Component', definition_en: 'Reusable UI building block', definition_vi: 'Thành phần', example1: 'Create a reusable Button component.' },
      { term: 'State', definition_en: 'Data that changes over time in UI', definition_vi: 'Trạng thái', example1: 'Manage form state with useState hook.' },
      { term: 'Props', definition_en: 'Properties passed to components', definition_vi: 'Thuộc tính', example1: 'Pass the title as props to the Header.' },
      { term: 'Responsive', definition_en: 'Adapting to different screen sizes', definition_vi: 'Đáp ứng', example1: 'Make the layout responsive using flexbox.' },
      { term: 'DOM', definition_en: 'Document Object Model', definition_vi: 'Mô hình đối tượng tài liệu', example1: 'React uses a virtual DOM for performance.' },
      { term: 'CSS Grid', definition_en: 'Two-dimensional layout system', definition_vi: 'Lưới CSS', example1: 'Use CSS Grid for complex page layouts.' },
      { term: 'Hook', definition_en: 'Function to use React features', definition_vi: 'Hook', example1: 'useEffect hook handles side effects.' },
      { term: 'Render', definition_en: 'Process of displaying UI', definition_vi: 'Hiển thị', example1: 'The component re-renders when state changes.' },
      { term: 'Event Handler', definition_en: 'Function that responds to events', definition_vi: 'Trình xử lý sự kiện', example1: 'Add an onClick event handler to the button.' },
      { term: 'Webpack', definition_en: 'Module bundler for JavaScript', definition_vi: 'Công cụ đóng gói module', example1: 'Configure webpack to bundle your assets.' },
    ],
    'Database': [
      { term: 'Query', definition_en: 'Request for data from database', definition_vi: 'Truy vấn', example1: 'Write a SQL query to find active users.' },
      { term: 'Index', definition_en: 'Structure that improves query speed', definition_vi: 'Chỉ mục', example1: 'Add an index on the email column.' },
      { term: 'Migration', definition_en: 'Version control for database schema', definition_vi: 'Di trú', example1: 'Run migrations to update the schema.' },
      { term: 'Transaction', definition_en: 'Unit of work in database', definition_vi: 'Giao dịch', example1: 'Use transactions for data consistency.' },
      { term: 'JOIN', definition_en: 'Combine rows from multiple tables', definition_vi: 'Nối bảng', example1: 'JOIN users and orders tables.' },
      { term: 'Schema', definition_en: 'Structure of the database', definition_vi: 'Lược đồ', example1: 'Define the database schema first.' },
      { term: 'Primary Key', definition_en: 'Unique identifier for a record', definition_vi: 'Khóa chính', example1: 'Every table should have a primary key.' },
      { term: 'Foreign Key', definition_en: 'Reference to primary key in another table', definition_vi: 'Khóa ngoại', example1: 'Add a foreign key to link orders to users.' },
      { term: 'Normalization', definition_en: 'Organizing data to reduce redundancy', definition_vi: 'Chuẩn hóa', example1: 'Apply third normal form to the schema.' },
      { term: 'ORM', definition_en: 'Object-Relational Mapping', definition_vi: 'Ánh xạ đối tượng quan hệ', example1: 'Sequelize is a popular ORM for Node.js.' },
    ],
    'DevOps': [
      { term: 'Docker', definition_en: 'Platform for containerization', definition_vi: 'Nền tảng container hóa', example1: 'Build a Docker image for deployment.' },
      { term: 'CI/CD', definition_en: 'Continuous Integration/Delivery', definition_vi: 'Tích hợp/Phân phối liên tục', example1: 'Set up CI/CD pipeline with GitHub Actions.' },
      { term: 'Deployment', definition_en: 'Process of releasing software', definition_vi: 'Triển khai', example1: 'Automate deployment to production.' },
      { term: 'Container', definition_en: 'Lightweight isolated environment', definition_vi: 'Container', example1: 'Run each service in a separate container.' },
      { term: 'Pipeline', definition_en: 'Automated sequence of steps', definition_vi: 'Đường ống', example1: 'The CI pipeline runs tests automatically.' },
      { term: 'Kubernetes', definition_en: 'Container orchestration platform', definition_vi: 'Nền tảng điều phối container', example1: 'Deploy microservices on Kubernetes cluster.' },
      { term: 'Load Balancer', definition_en: 'Distributes traffic across servers', definition_vi: 'Cân bằng tải', example1: 'Use a load balancer for high availability.' },
      { term: 'Monitoring', definition_en: 'Tracking system performance', definition_vi: 'Giám sát', example1: 'Set up monitoring with Prometheus and Grafana.' },
      { term: 'Environment Variable', definition_en: 'Configuration value set outside code', definition_vi: 'Biến môi trường', example1: 'Store API keys in environment variables.' },
      { term: 'Scaling', definition_en: 'Increasing capacity to handle load', definition_vi: 'Mở rộng', example1: 'Horizontal scaling adds more servers.' },
    ],
    'Cloud': [
      { term: 'Cloud Computing', definition_en: 'On-demand computing resources', definition_vi: 'Điện toán đám mây', example1: 'Migrate our infrastructure to the cloud.' },
      { term: 'AWS', definition_en: 'Amazon Web Services', definition_vi: 'Dịch vụ web Amazon', example1: 'Deploy the app on AWS EC2 instances.' },
      { term: 'Serverless', definition_en: 'Computing without managing servers', definition_vi: 'Không máy chủ', example1: 'Use serverless functions for lightweight tasks.' },
      { term: 'S3 Bucket', definition_en: 'Cloud storage service', definition_vi: 'Dịch vụ lưu trữ đám mây', example1: 'Upload images to the S3 bucket.' },
      { term: 'Lambda', definition_en: 'Serverless compute service', definition_vi: 'Hàm Lambda', example1: 'Create a Lambda function for image processing.' },
      { term: 'CDN', definition_en: 'Content Delivery Network', definition_vi: 'Mạng phân phối nội dung', example1: 'Serve static files through a CDN.' },
      { term: 'VPC', definition_en: 'Virtual Private Cloud', definition_vi: 'Đám mây riêng ảo', example1: 'Configure the VPC for network isolation.' },
      { term: 'IAM', definition_en: 'Identity and Access Management', definition_vi: 'Quản lý danh tính và truy cập', example1: 'Create IAM roles with least privilege.' },
      { term: 'Region', definition_en: 'Geographic area for cloud resources', definition_vi: 'Vùng', example1: 'Deploy to the Asia-Pacific region.' },
      { term: 'Elastic', definition_en: 'Automatically adjusting resources', definition_vi: 'Co giãn', example1: 'Use elastic scaling for traffic spikes.' },
    ],
    'Security': [
      { term: 'Encryption', definition_en: 'Converting data into secure format', definition_vi: 'Mã hóa', example1: 'Encrypt sensitive data at rest and in transit.' },
      { term: 'SSL/TLS', definition_en: 'Protocols for secure communication', definition_vi: 'Giao thức bảo mật', example1: 'Enable SSL/TLS for HTTPS connections.' },
      { term: 'Vulnerability', definition_en: 'Weakness that can be exploited', definition_vi: 'Lỗ hổng', example1: 'Scan for vulnerabilities regularly.' },
      { term: 'SQL Injection', definition_en: 'Attack via malicious SQL code', definition_vi: 'Tấn công SQL Injection', example1: 'Use parameterized queries to prevent SQL injection.' },
      { term: 'XSS', definition_en: 'Cross-Site Scripting attack', definition_vi: 'Tấn công XSS', example1: 'Sanitize user input to prevent XSS attacks.' },
      { term: 'Token', definition_en: 'Digital credential for authentication', definition_vi: 'Token', example1: 'Send the JWT token in the Authorization header.' },
      { term: 'Firewall', definition_en: 'System that filters network traffic', definition_vi: 'Tường lửa', example1: 'Configure the firewall to block unauthorized access.' },
      { term: 'Hashing', definition_en: 'Converting data to fixed-size value', definition_vi: 'Băm', example1: 'Hash passwords with bcrypt before storing.' },
      { term: 'CORS', definition_en: 'Cross-Origin Resource Sharing', definition_vi: 'Chia sẻ tài nguyên liên nguồn', example1: 'Configure CORS to allow frontend requests.' },
      { term: 'HTTPS', definition_en: 'HTTP with encryption', definition_vi: 'HTTP bảo mật', example1: 'Always use HTTPS in production.' },
    ]
  }
};

async function fixVocab() {
  try {
    // Get developer topic id
    const topics = await query("SELECT id, slug FROM topics WHERE slug = 'developer'");
    if (!topics.length) { console.log('Developer topic not found!'); process.exit(1); }
    const devTopicId = topics[0].id;

    // Delete existing vocabulary_topics for developer
    await query('DELETE FROM vocabulary_topics WHERE topic_id = ?', [devTopicId]);
    console.log('🗑️ Cleared old developer vocabulary_topics');

    // For each category, update or insert vocabulary
    let totalUpdated = 0;
    for (const [category, words] of Object.entries(topicVocab.developer)) {
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        const dayNum = Math.floor(i / 10) + 1; // 10 words per day
        
        // Check if term exists
        let existing = await query('SELECT id FROM vocabulary WHERE term = ?', [w.term]);
        let vocabId;
        
        if (existing.length) {
          vocabId = existing[0].id;
          // Update category and definitions
          await query('UPDATE vocabulary SET category = ?, definition_en = ?, definition_vi = ?, example1 = ?, day_number = ? WHERE id = ?',
            [category, w.definition_en, w.definition_vi, w.example1, dayNum, vocabId]);
        } else {
          const result = await query('INSERT INTO vocabulary (term, word_type, definition_en, definition_vi, category, example1, day_number) VALUES (?,?,?,?,?,?,?)',
            [w.term, 'noun', w.definition_en, w.definition_vi, category, w.example1, dayNum]);
          vocabId = result.insertId;
        }
        
        // Link to developer topic
        await query('INSERT IGNORE INTO vocabulary_topics (vocabulary_id, topic_id) VALUES (?, ?)', [vocabId, devTopicId]);
        totalUpdated++;
      }
      console.log(`  ✅ ${category}: ${words.length} words`);
    }

    console.log(`\n✅ Fixed ${totalUpdated} developer vocabulary words!`);
    process.exit(0);
  } catch (e) { console.error('Error:', e); process.exit(1); }
}

fixVocab();
