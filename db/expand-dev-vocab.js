require('dotenv').config();
const { query } = require('./database');

const extraVocab = {
  'Coding': [
    { term: 'Variable', definition_en: 'Named storage for data', definition_vi: 'Biến', example1: 'Declare a variable to store the user name.' },
    { term: 'Function', definition_en: 'Reusable block of code', definition_vi: 'Hàm', example1: 'Write a function to calculate the total price.' },
    { term: 'Loop', definition_en: 'Repeated execution of code', definition_vi: 'Vòng lặp', example1: 'Use a for loop to iterate over the array.' },
    { term: 'Array', definition_en: 'Ordered collection of elements', definition_vi: 'Mảng', example1: 'Store the list of users in an array.' },
    { term: 'Object', definition_en: 'Collection of key-value pairs', definition_vi: 'Đối tượng', example1: 'Create an object with name and age properties.' },
    { term: 'Class', definition_en: 'Blueprint for creating objects', definition_vi: 'Lớp', example1: 'Define a User class with login methods.' },
    { term: 'Interface', definition_en: 'Contract that classes must follow', definition_vi: 'Giao diện', example1: 'Implement the Serializable interface.' },
    { term: 'Inheritance', definition_en: 'Deriving new class from existing', definition_vi: 'Kế thừa', example1: 'AdminUser inherits from the User class.' },
    { term: 'Polymorphism', definition_en: 'Ability to take many forms', definition_vi: 'Đa hình', example1: 'Polymorphism lets you call the same method on different objects.' },
    { term: 'Encapsulation', definition_en: 'Hiding internal details', definition_vi: 'Đóng gói', example1: 'Use encapsulation to protect private data.' },
    { term: 'Abstraction', definition_en: 'Hiding complexity and showing essentials', definition_vi: 'Trừu tượng hóa', example1: 'Abstraction simplifies complex systems.' },
    { term: 'Callback', definition_en: 'Function passed as argument', definition_vi: 'Hàm gọi lại', example1: 'Pass a callback to handle the response.' },
    { term: 'Promise', definition_en: 'Object representing future value', definition_vi: 'Promise', example1: 'Use a Promise for asynchronous operations.' },
    { term: 'Async/Await', definition_en: 'Syntax for handling promises', definition_vi: 'Bất đồng bộ', example1: 'Use async/await for cleaner async code.' },
    { term: 'Closure', definition_en: 'Function with access to outer scope', definition_vi: 'Bao đóng', example1: 'A closure remembers its lexical scope.' },
    { term: 'Scope', definition_en: 'Visibility of variables', definition_vi: 'Phạm vi', example1: 'Variables declared with let have block scope.' },
    { term: 'Iteration', definition_en: 'Process of repeating steps', definition_vi: 'Lặp', example1: 'Iterate over the map entries using forEach.' },
    { term: 'Conditional', definition_en: 'Code that runs based on condition', definition_vi: 'Điều kiện', example1: 'Use an if-else conditional to check the status.' },
    { term: 'Exception', definition_en: 'Error that disrupts normal flow', definition_vi: 'Ngoại lệ', example1: 'Catch the exception and log the error message.' },
    { term: 'Debugging', definition_en: 'Finding and fixing bugs', definition_vi: 'Gỡ lỗi', example1: 'Set breakpoints for debugging the issue.' },
    { term: 'Compiler', definition_en: 'Translates source code to machine code', definition_vi: 'Trình biên dịch', example1: 'The TypeScript compiler checks for type errors.' },
    { term: 'Runtime', definition_en: 'Time when program is executing', definition_vi: 'Thời gian chạy', example1: 'Node.js is a JavaScript runtime environment.' },
    { term: 'Framework', definition_en: 'Pre-built structure for development', definition_vi: 'Framework', example1: 'React is a popular frontend framework.' },
    { term: 'Library', definition_en: 'Collection of pre-written code', definition_vi: 'Thư viện', example1: 'Import the lodash library for utility functions.' },
    { term: 'Package', definition_en: 'Bundle of code for distribution', definition_vi: 'Gói thư viện', example1: 'Install the package using npm install.' },
    { term: 'Dependency', definition_en: 'External code that project needs', definition_vi: 'Phụ thuộc', example1: 'List all dependencies in package.json.' },
    { term: 'Module', definition_en: 'Self-contained unit of code', definition_vi: 'Module', example1: 'Export the helper function from the module.' },
    { term: 'Import', definition_en: 'Bringing external code into file', definition_vi: 'Nhập', example1: 'Import React from the react package.' },
    { term: 'Export', definition_en: 'Making code available to other files', definition_vi: 'Xuất', example1: 'Export default the App component.' },
    { term: 'Type', definition_en: 'Classification of data', definition_vi: 'Kiểu dữ liệu', example1: 'TypeScript enforces strict type checking.' },
    { term: 'String', definition_en: 'Sequence of characters', definition_vi: 'Chuỗi', example1: 'Convert the number to a string.' },
    { term: 'Integer', definition_en: 'Whole number without decimals', definition_vi: 'Số nguyên', example1: 'Parse the input as an integer.' },
    { term: 'Boolean', definition_en: 'True or false value', definition_vi: 'Boolean', example1: 'The isActive flag is a boolean.' },
    { term: 'Null', definition_en: 'Intentional absence of value', definition_vi: 'Null', example1: 'Check if the value is null before using it.' },
    { term: 'Undefined', definition_en: 'Variable declared but not assigned', definition_vi: 'Chưa định nghĩa', example1: 'Accessing an unset property returns undefined.' },
    { term: 'Enum', definition_en: 'Set of named constants', definition_vi: 'Liệt kê', example1: 'Define user roles using an enum.' },
    { term: 'Tuple', definition_en: 'Fixed-length ordered list', definition_vi: 'Bộ giá trị', example1: 'Return a tuple of status and message.' },
    { term: 'Map', definition_en: 'Key-value collection with any key type', definition_vi: 'Map', example1: 'Use a Map to store configuration settings.' },
    { term: 'Set', definition_en: 'Collection of unique values', definition_vi: 'Tập hợp', example1: 'Use a Set to remove duplicate entries.' },
    { term: 'Iterator', definition_en: 'Object that enables traversal', definition_vi: 'Bộ lặp', example1: 'Implement the iterator protocol for custom types.' },
    { term: 'Generator', definition_en: 'Function that can pause and resume', definition_vi: 'Hàm sinh', example1: 'Use a generator to lazily produce values.' },
    { term: 'Decorator', definition_en: 'Pattern that adds behavior dynamically', definition_vi: 'Decorator', example1: 'Apply the @Injectable decorator to the service.' },
    { term: 'Annotation', definition_en: 'Metadata added to code', definition_vi: 'Chú thích', example1: 'Use @Override annotation in Java.' },
    { term: 'Refactoring', definition_en: 'Restructuring code without changing behavior', definition_vi: 'Tái cấu trúc', example1: 'Refactor the function to reduce complexity.' },
    { term: 'Code Review', definition_en: 'Peer examination of code', definition_vi: 'Duyệt mã', example1: 'Submit a pull request for code review.' },
    { term: 'Pull Request', definition_en: 'Proposal to merge code changes', definition_vi: 'Yêu cầu hợp nhất', example1: 'Create a pull request to the main branch.' },
    { term: 'Branch', definition_en: 'Independent line of development', definition_vi: 'Nhánh', example1: 'Create a feature branch for the new module.' },
    { term: 'Merge', definition_en: 'Combining code from different branches', definition_vi: 'Hợp nhất', example1: 'Merge the feature branch into develop.' },
    { term: 'Commit', definition_en: 'Saving changes to version control', definition_vi: 'Lưu thay đổi', example1: 'Commit your changes with a descriptive message.' },
    { term: 'Git', definition_en: 'Version control system', definition_vi: 'Hệ thống quản lý phiên bản', example1: 'Initialize a Git repository for the project.' },
    { term: 'Repository', definition_en: 'Storage for project files and history', definition_vi: 'Kho mã nguồn', example1: 'Clone the repository from GitHub.' },
    { term: 'Syntax', definition_en: 'Rules that define code structure', definition_vi: 'Cú pháp', example1: 'Fix the syntax error on line 42.' },
    { term: 'Semantic', definition_en: 'Meaning of code constructs', definition_vi: 'Ngữ nghĩa', example1: 'Use semantic HTML tags for better accessibility.' },
    { term: 'API Gateway', definition_en: 'Entry point for API requests', definition_vi: 'Cổng API', example1: 'Route all requests through the API gateway.' },
    { term: 'GraphQL', definition_en: 'Query language for APIs', definition_vi: 'Ngôn ngữ truy vấn GraphQL', example1: 'Use GraphQL to fetch only needed data.' },
    { term: 'WebSocket', definition_en: 'Protocol for real-time communication', definition_vi: 'WebSocket', example1: 'Implement WebSocket for live chat feature.' },
    { term: 'HTTP', definition_en: 'Protocol for web communication', definition_vi: 'Giao thức HTTP', example1: 'Send an HTTP POST request to create a user.' },
    { term: 'JSON', definition_en: 'JavaScript Object Notation', definition_vi: 'Định dạng JSON', example1: 'Parse the JSON response from the API.' },
    { term: 'XML', definition_en: 'Extensible Markup Language', definition_vi: 'Ngôn ngữ đánh dấu mở rộng', example1: 'Some legacy APIs still use XML format.' },
    { term: 'Design Pattern', definition_en: 'Reusable solution to common problem', definition_vi: 'Mẫu thiết kế', example1: 'Apply the Singleton design pattern.' },
    { term: 'Singleton', definition_en: 'Class with only one instance', definition_vi: 'Singleton', example1: 'Use Singleton for the database connection.' },
    { term: 'Factory', definition_en: 'Pattern for creating objects', definition_vi: 'Factory', example1: 'Use a factory method to create different user types.' },
    { term: 'Observer', definition_en: 'Pattern for event handling', definition_vi: 'Quan sát viên', example1: 'Implement the observer pattern for notifications.' },
    { term: 'MVC', definition_en: 'Model-View-Controller architecture', definition_vi: 'Kiến trúc MVC', example1: 'Organize your code using the MVC pattern.' },
    { term: 'SOLID', definition_en: 'Five principles of OOP design', definition_vi: 'Nguyên tắc SOLID', example1: 'Follow SOLID principles for maintainable code.' },
    { term: 'DRY', definition_en: 'Dont Repeat Yourself principle', definition_vi: 'Không lặp lại', example1: 'Follow DRY by extracting common logic.' },
    { term: 'Clean Code', definition_en: 'Code that is easy to understand and maintain', definition_vi: 'Mã sạch', example1: 'Write clean code with meaningful names.' },
    { term: 'Technical Debt', definition_en: 'Cost of shortcuts in code', definition_vi: 'Nợ kỹ thuật', example1: 'Reduce technical debt by refactoring regularly.' },
    { term: 'Agile', definition_en: 'Iterative development methodology', definition_vi: 'Linh hoạt', example1: 'Our team follows Agile methodology.' },
    { term: 'Scrum', definition_en: 'Framework for Agile development', definition_vi: 'Scrum', example1: 'We use Scrum with two-week sprints.' },
  ],
  'DevOps & Cloud': [
    { term: 'Terraform', definition_en: 'Infrastructure as Code tool', definition_vi: 'Công cụ IaC', example1: 'Define cloud resources using Terraform.' },
    { term: 'Ansible', definition_en: 'Automation and configuration tool', definition_vi: 'Công cụ tự động hóa', example1: 'Use Ansible playbooks for server setup.' },
    { term: 'Nginx', definition_en: 'Web server and reverse proxy', definition_vi: 'Máy chủ web', example1: 'Configure Nginx as a reverse proxy.' },
    { term: 'DNS', definition_en: 'Domain Name System', definition_vi: 'Hệ thống phân giải tên miền', example1: 'Update the DNS records for the new domain.' },
    { term: 'IP Address', definition_en: 'Unique identifier for devices', definition_vi: 'Địa chỉ IP', example1: 'Whitelist the server IP address.' },
    { term: 'Port', definition_en: 'Communication endpoint', definition_vi: 'Cổng', example1: 'The application runs on port 3000.' },
    { term: 'SSH', definition_en: 'Secure Shell protocol', definition_vi: 'Giao thức SSH', example1: 'Connect to the server using SSH.' },
    { term: 'Dockerfile', definition_en: 'Instructions to build Docker image', definition_vi: 'Tệp Docker', example1: 'Write a Dockerfile for the Node.js app.' },
    { term: 'Docker Compose', definition_en: 'Tool for multi-container apps', definition_vi: 'Docker Compose', example1: 'Use Docker Compose to run all services.' },
    { term: 'Helm', definition_en: 'Kubernetes package manager', definition_vi: 'Trình quản lý gói K8s', example1: 'Deploy the chart using Helm install.' },
    { term: 'Pod', definition_en: 'Smallest deployable unit in K8s', definition_vi: 'Pod', example1: 'Each pod runs one or more containers.' },
    { term: 'Service Mesh', definition_en: 'Infrastructure layer for services', definition_vi: 'Lưới dịch vụ', example1: 'Implement Istio as a service mesh.' },
    { term: 'Ingress', definition_en: 'External access to K8s services', definition_vi: 'Ingress', example1: 'Configure ingress rules for traffic routing.' },
    { term: 'Namespace', definition_en: 'Virtual cluster within K8s', definition_vi: 'Không gian tên', example1: 'Create a staging namespace in Kubernetes.' },
    { term: 'Auto-scaling', definition_en: 'Automatic resource adjustment', definition_vi: 'Tự động mở rộng', example1: 'Enable auto-scaling for peak traffic hours.' },
    { term: 'Blue-Green', definition_en: 'Deployment with two environments', definition_vi: 'Triển khai xanh-lam', example1: 'Use blue-green deployment for zero downtime.' },
    { term: 'Canary Release', definition_en: 'Gradual rollout to subset of users', definition_vi: 'Phát hành từng phần', example1: 'Deploy the canary release to five percent of users.' },
    { term: 'Rolling Update', definition_en: 'Incremental deployment of changes', definition_vi: 'Cập nhật cuốn chiếu', example1: 'Perform a rolling update with no downtime.' },
    { term: 'Rollback', definition_en: 'Reverting to previous version', definition_vi: 'Quay lại phiên bản trước', example1: 'Rollback to the last stable release immediately.' },
    { term: 'Log Aggregation', definition_en: 'Collecting logs from multiple sources', definition_vi: 'Tổng hợp log', example1: 'Use ELK Stack for log aggregation.' },
    { term: 'Alert', definition_en: 'Notification of system issues', definition_vi: 'Cảnh báo', example1: 'Set up alerts for high CPU usage.' },
    { term: 'Dashboard', definition_en: 'Visual display of metrics', definition_vi: 'Bảng điều khiển', example1: 'Build a Grafana dashboard for monitoring.' },
    { term: 'SLA', definition_en: 'Service Level Agreement', definition_vi: 'Thỏa thuận mức dịch vụ', example1: 'Our SLA guarantees 99.9 percent uptime.' },
    { term: 'Uptime', definition_en: 'Time system is operational', definition_vi: 'Thời gian hoạt động', example1: 'We achieved 99.99 percent uptime last quarter.' },
    { term: 'Downtime', definition_en: 'Time system is unavailable', definition_vi: 'Thời gian ngừng hoạt động', example1: 'Schedule maintenance during off-peak downtime.' },
    { term: 'Latency', definition_en: 'Delay in data transfer', definition_vi: 'Độ trễ', example1: 'Reduce API latency to under 100 milliseconds.' },
    { term: 'Throughput', definition_en: 'Amount of data processed', definition_vi: 'Thông lượng', example1: 'Increase throughput by optimizing the pipeline.' },
    { term: 'Bottleneck', definition_en: 'Point that limits performance', definition_vi: 'Nút thắt cổ chai', example1: 'The database is the bottleneck in our system.' },
    { term: 'Fault Tolerance', definition_en: 'Ability to continue despite failures', definition_vi: 'Khả năng chịu lỗi', example1: 'Design the system with fault tolerance in mind.' },
    { term: 'Redundancy', definition_en: 'Duplicate components for reliability', definition_vi: 'Dự phòng', example1: 'Add redundancy to prevent single points of failure.' },
    { term: 'Backup', definition_en: 'Copy of data for recovery', definition_vi: 'Sao lưu', example1: 'Schedule daily backups of the database.' },
    { term: 'Disaster Recovery', definition_en: 'Plan for system restoration', definition_vi: 'Khắc phục thảm họa', example1: 'Test the disaster recovery plan quarterly.' },
    { term: 'Health Check', definition_en: 'Automated service status verification', definition_vi: 'Kiểm tra sức khỏe', example1: 'Add a health check endpoint for the load balancer.' },
    { term: 'Infrastructure as Code', definition_en: 'Managing infrastructure through code', definition_vi: 'Hạ tầng dưới dạng mã', example1: 'Use Infrastructure as Code for reproducible environments.' },
    { term: 'Artifact', definition_en: 'Built package ready for deployment', definition_vi: 'Sản phẩm build', example1: 'Publish the build artifact to the registry.' },
    { term: 'Registry', definition_en: 'Storage for container images', definition_vi: 'Kho container', example1: 'Push the Docker image to the container registry.' },
    { term: 'Orchestration', definition_en: 'Automated management of containers', definition_vi: 'Điều phối', example1: 'Kubernetes handles container orchestration.' },
    { term: 'Proxy', definition_en: 'Intermediary server for requests', definition_vi: 'Máy chủ trung gian', example1: 'Set up a reverse proxy for load distribution.' },
    { term: 'Microservices', definition_en: 'Architecture of small independent services', definition_vi: 'Kiến trúc vi dịch vụ', example1: 'Split the monolith into microservices.' },
    { term: 'Monolith', definition_en: 'Single large application', definition_vi: 'Ứng dụng nguyên khối', example1: 'Our legacy monolith is hard to scale.' },
  ],
  'Data & Security': [
    { term: 'SQL', definition_en: 'Structured Query Language', definition_vi: 'Ngôn ngữ truy vấn', example1: 'Write SQL queries to fetch user data.' },
    { term: 'NoSQL', definition_en: 'Non-relational database', definition_vi: 'Cơ sở dữ liệu phi quan hệ', example1: 'Use MongoDB for NoSQL document storage.' },
    { term: 'MongoDB', definition_en: 'Document-based NoSQL database', definition_vi: 'Cơ sở dữ liệu MongoDB', example1: 'Store JSON documents in MongoDB.' },
    { term: 'Redis', definition_en: 'In-memory data store', definition_vi: 'Kho dữ liệu trong bộ nhớ', example1: 'Use Redis for session caching.' },
    { term: 'PostgreSQL', definition_en: 'Advanced relational database', definition_vi: 'Cơ sở dữ liệu PostgreSQL', example1: 'PostgreSQL supports JSON and full-text search.' },
    { term: 'MySQL', definition_en: 'Popular relational database', definition_vi: 'Cơ sở dữ liệu MySQL', example1: 'Our production database runs on MySQL.' },
    { term: 'Stored Procedure', definition_en: 'Precompiled SQL statements', definition_vi: 'Thủ tục lưu trữ', example1: 'Create a stored procedure for complex logic.' },
    { term: 'Trigger', definition_en: 'Automatic action on data change', definition_vi: 'Trigger', example1: 'Add a trigger to log all deletions.' },
    { term: 'View', definition_en: 'Virtual table from query', definition_vi: 'View', example1: 'Create a view for the dashboard report.' },
    { term: 'Replication', definition_en: 'Copying data across databases', definition_vi: 'Sao chép dữ liệu', example1: 'Set up read replicas for better performance.' },
    { term: 'Sharding', definition_en: 'Splitting data across servers', definition_vi: 'Phân mảnh', example1: 'Shard the database by user region.' },
    { term: 'ACID', definition_en: 'Atomicity Consistency Isolation Durability', definition_vi: 'Tính chất ACID', example1: 'Relational databases guarantee ACID properties.' },
    { term: 'Backup Strategy', definition_en: 'Plan for data backup and restore', definition_vi: 'Chiến lược sao lưu', example1: 'Implement a 3-2-1 backup strategy.' },
    { term: 'Data Migration', definition_en: 'Moving data between systems', definition_vi: 'Di chuyển dữ liệu', example1: 'Plan the data migration to the new schema.' },
    { term: 'ETL', definition_en: 'Extract Transform Load process', definition_vi: 'Quy trình ETL', example1: 'Build an ETL pipeline for the data warehouse.' },
    { term: 'OAuth', definition_en: 'Open Authorization standard', definition_vi: 'Tiêu chuẩn xác thực mở', example1: 'Implement OAuth 2.0 for third-party login.' },
    { term: 'JWT', definition_en: 'JSON Web Token', definition_vi: 'Token JWT', example1: 'Issue a JWT after successful authentication.' },
    { term: 'Session', definition_en: 'Server-side user state storage', definition_vi: 'Phiên làm việc', example1: 'Store the user session in Redis.' },
    { term: 'Cookie', definition_en: 'Small data stored in browser', definition_vi: 'Cookie', example1: 'Set a secure cookie for the session ID.' },
    { term: 'CSRF', definition_en: 'Cross-Site Request Forgery', definition_vi: 'Giả mạo yêu cầu liên trang', example1: 'Add CSRF tokens to prevent forgery attacks.' },
    { term: 'Rate Limiting', definition_en: 'Controlling request frequency', definition_vi: 'Giới hạn tốc độ', example1: 'Implement rate limiting to prevent abuse.' },
    { term: 'DDoS', definition_en: 'Distributed Denial of Service attack', definition_vi: 'Tấn công từ chối dịch vụ', example1: 'Use Cloudflare to protect against DDoS attacks.' },
    { term: 'Penetration Testing', definition_en: 'Simulated attack to find vulnerabilities', definition_vi: 'Kiểm thử xâm nhập', example1: 'Conduct penetration testing before launch.' },
    { term: 'Audit Log', definition_en: 'Record of system activities', definition_vi: 'Nhật ký kiểm toán', example1: 'Check the audit log for unauthorized access.' },
    { term: 'Compliance', definition_en: 'Following rules and standards', definition_vi: 'Tuân thủ', example1: 'Ensure GDPR compliance for user data.' },
    { term: 'Data Integrity', definition_en: 'Accuracy of data over lifecycle', definition_vi: 'Toàn vẹn dữ liệu', example1: 'Use checksums to verify data integrity.' },
    { term: 'Access Control', definition_en: 'Restricting resource access', definition_vi: 'Kiểm soát truy cập', example1: 'Implement role-based access control.' },
    { term: 'Two-Factor Auth', definition_en: 'Two-step verification process', definition_vi: 'Xác thực 2 bước', example1: 'Enable two-factor authentication for admin accounts.' },
    { term: 'API Key', definition_en: 'Secret key for API access', definition_vi: 'Khóa API', example1: 'Store API keys in environment variables.' },
    { term: 'Sanitization', definition_en: 'Cleaning user input', definition_vi: 'Làm sạch dữ liệu', example1: 'Sanitize all user input to prevent injection.' },
  ]
};

async function expandDevVocab() {
  try {
    const topics = await query("SELECT id FROM topics WHERE slug = 'developer'");
    const devTopicId = topics[0].id;
    let added = 0;

    for (const [category, words] of Object.entries(extraVocab)) {
      for (const w of words) {
        const existing = await query('SELECT id FROM vocabulary WHERE term = ?', [w.term]);
        let vocabId;
        if (existing.length) {
          vocabId = existing[0].id;
          await query('UPDATE vocabulary SET category = ?, definition_en = ?, definition_vi = ?, example1 = ? WHERE id = ? AND category NOT IN ("Coding","DevOps & Cloud","Data & Security")',
            [category, w.definition_en, w.definition_vi, w.example1, vocabId]);
        } else {
          const result = await query('INSERT INTO vocabulary (term, word_type, definition_en, definition_vi, category, example1, day_number) VALUES (?,?,?,?,?,?,?)',
            [w.term, 'noun', w.definition_en, w.definition_vi, category, w.example1, 1]);
          vocabId = result.insertId;
        }
        await query('INSERT IGNORE INTO vocabulary_topics (vocabulary_id, topic_id) VALUES (?, ?)', [vocabId, devTopicId]);
        added++;
      }
      console.log(`  ✅ ${category}: ${words.length} words`);
    }

    // Now distribute across 30 days (~10/day)
    const allWords = await query(`
      SELECT DISTINCT v.id FROM vocabulary v 
      INNER JOIN vocabulary_topics vt ON v.id = vt.vocabulary_id 
      WHERE vt.topic_id = ? ORDER BY v.category, v.id
    `, [devTopicId]);

    const perDay = Math.ceil(allWords.length / 30);
    for (let i = 0; i < allWords.length; i++) {
      const day = Math.floor(i / perDay) + 1;
      await query('UPDATE vocabulary SET day_number = ? WHERE id = ?', [day, allWords[i].id]);
    }

    // Final count
    const stats = await query(`
      SELECT v.category, COUNT(*) as cnt FROM vocabulary v 
      INNER JOIN vocabulary_topics vt ON v.id = vt.vocabulary_id 
      WHERE vt.topic_id = ? GROUP BY v.category
    `, [devTopicId]);
    
    console.log(`\n✅ Developer: ${allWords.length} words total (~${perDay}/day × 30 days)`);
    stats.forEach(s => console.log(`  ${s.category}: ${s.cnt}`));
    process.exit(0);
  } catch (e) { console.error('Error:', e); process.exit(1); }
}

expandDevVocab();
