const { query } = require('./database');

// Additional IT vocabulary from user's list
const extraVocab = [
  // Algorithms & Computing basics
  ["Multiplication","n.","Phép nhân","A mathematical operation of multiplying","Algorithms","5 times 3 is a multiplication operation.","Matrix multiplication is common in ML.","Multiplication of large numbers needs optimization."],
  ["Numeric","adj.","Số học, thuộc về số học","Of or relating to numbers","Algorithms","Validate numeric input before processing.","The field accepts only numeric values.","Numeric data types include int and float."],
  ["Operation","n.","Thao tác","An action or process","Algorithms","CRUD operations on the database.","This operation takes O(n) time.","Bulk operations improve performance."],
  ["Perform","v.","Tiến hành, thi hành","To carry out an action","Algorithms","The function performs data validation.","The server performs health checks every 30 seconds.","Perform load testing before launch."],
  ["Process","n.","Xử lý","A series of actions to achieve a result","Algorithms","The background process handles email sending.","Each process has its own memory space.","Kill the zombie process using the PID."],
  ["Processor","n.","Bộ xử lý","A device that processes data","Algorithms","The processor handles millions of instructions per second.","Multi-core processors enable parallel computing.","The payment processor validates card details."],
  ["Register","n.","Thanh ghi, đăng ký","A small, fast storage location in CPU","Algorithms","CPU registers store intermediate calculation results.","Register the new service with the load balancer.","The event handler must register a callback."],
  ["Signal","n.","Tín hiệu","An indicator or message","Algorithms","The OS sends a SIGTERM signal to stop the process.","Signal handling is crucial for graceful shutdown.","WebSocket signals real-time data updates."],
  ["Solution","n.","Giải pháp, lời giải","An answer to a problem","Algorithms","The brute force solution has O(n²) complexity.","Cloud solutions reduce infrastructure costs.","We need a scalable solution for this problem."],
  ["Store","v.","Lưu trữ","To save data for future use","Algorithms","Store user sessions in Redis.","Never store passwords in plain text.","Store configuration in environment variables."],
  ["Subtraction","n.","Phép trừ","Removing one number from another","Algorithms","Subtraction of timestamps gives elapsed time.","Binary subtraction uses two's complement.","Subtraction is a basic arithmetic operation."],
  ["Transmit","v.","Truyền","To send data from one place to another","Algorithms","HTTPS transmits data securely.","The API transmits JSON payloads.","Kafka transmits messages between microservices."],
  ["Allocate","v.","Phân phối","To assign resources","Algorithms","The OS allocates memory for each process.","Allocate enough disk space for the database.","Dynamically allocate resources based on demand."],
  ["Application","n.","Ứng dụng","A software program for end users","Algorithms","Deploy the application to production.","The mobile application uses React Native.","Test the application on multiple browsers."],
  ["Binary","adj.","Nhị phân","Base-2 number system","Algorithms","Computers process data in binary format.","Binary search requires a sorted array.","Convert decimal to binary representation."],
  ["Calculation","n.","Tính toán","A mathematical computation","Algorithms","The calculation runs on the server side.","Financial calculations require decimal precision.","Offload heavy calculations to a worker thread."],
  ["Command","n.","Lệnh","An instruction to a computer","Algorithms","Run the Docker command to build the image.","The CLI command accepts multiple flags.","Execute the SQL command against the database."],
  ["Remote Access","n.","Truy cập từ xa","Connecting to a system from a distance","Hardware & Infrastructure","SSH provides secure remote access.","VPN enables remote access to internal networks.","Configure remote access for the development team."],
  ["Computerize","v.","Tin học hóa","To convert to computer-based processing","Algorithms","Computerize the manual invoice process.","Many hospitals have computerized their records.","Computerize the reporting workflow."],
  ["Storage","n.","Lưu trữ","A place to keep data","Hardware & Infrastructure","Cloud storage reduces infrastructure costs.","NVMe storage provides faster read/write speeds.","Object storage is ideal for unstructured data."],

  // Hardware & Machine
  ["Capacity","n.","Dung lượng","The amount a system can hold","Hardware & Infrastructure","The server has 64GB memory capacity.","Increase disk capacity for the database.","Plan capacity for peak traffic hours."],
  ["Semiconductor","n.","Chất bán dẫn","Material used in electronic circuits","Hardware & Infrastructure","Silicon is the most common semiconductor.","Semiconductor chips power modern devices.","The semiconductor industry drives tech innovation."],
  ["Matrix","n.","Ma trận","A rectangular array of numbers","Algorithms","Matrix multiplication is used in neural networks.","Represent the graph as an adjacency matrix.","The confusion matrix shows model accuracy."],
  ["Configuration","n.","Cấu hình","Arrangement of system settings","Hardware & Infrastructure","Update the server configuration file.","Configuration management uses tools like Ansible.","Store configuration in YAML format."],
  ["Implement","v.","Triển khai","To put into effect","Algorithms","Implement the authentication module first.","We need to implement caching for better performance.","Implement the interface in the service class."],
  ["Disk","n.","Đĩa","A storage device","Hardware & Infrastructure","The disk is running low on space.","SSD disks are faster than HDD disks.","Monitor disk I/O for bottlenecks."],
  ["Gadget","n.","Thiết bị nhỏ","A small electronic device","Hardware & Infrastructure","IoT gadgets connect to the cloud.","Test the app on different gadgets.","The gadget monitors health metrics."],

  // Data Systems
  ["Intranet","n.","Mạng nội bộ","A private network within an organization","Data Systems","The company intranet hosts internal tools.","Deploy the app on the corporate intranet.","Intranet security requires firewall rules."],
  ["Virtual","adj.","Ảo","Not physically existing but made to appear so","Data Systems","Virtual machines run on hypervisors.","Virtual memory extends physical RAM.","Set up a virtual network for testing."],
  ["Compatible","adj.","Tương thích","Able to work together","Data Systems","Ensure the API is backward compatible.","The library is compatible with Node.js 18+.","Check browser compatibility before release."],
  ["Protocol","n.","Giao thức","A set of rules for communication","Data Systems","HTTP is the protocol for web communication.","The WebSocket protocol enables real-time data.","Implement the OAuth 2.0 protocol for auth."],
  ["Circuit","n.","Mạch","A complete path for electrical current","Hardware & Infrastructure","Integrated circuits power all modern electronics.","A circuit breaker pattern prevents cascading failures.","The circuit board connects all components."],
  ["Multi-user","adj.","Đa người dùng","Supporting multiple simultaneous users","Data Systems","The system supports multi-user access.","Implement multi-user authentication.","Multi-user databases need concurrency control."],

  // General IT
  ["Graphics","n.","Đồ họa","Visual content on a screen","Hardware & Infrastructure","GPU handles graphics rendering.","WebGL enables 3D graphics in the browser.","Design graphics using vector tools."],
  ["Oversee","v.","Giám sát","To supervise or monitor","Testing & QA","The PM oversees the project timeline.","DevOps oversees the deployment pipeline.","The tech lead oversees code quality."],
  ["Available","adj.","Có sẵn, khả dụng","Ready for use","Hardware & Infrastructure","The API is available 24/7 with 99.9% uptime.","Check if the port is available.","Make the feature available in the next release."],
  ["Drawback","n.","Hạn chế","A disadvantage","Algorithms","One drawback of microservices is complexity.","The main drawback is increased latency.","Every approach has its drawbacks."],
  ["Research","n.","Nghiên cứu","Systematic investigation","Algorithms","Research the best algorithm for this problem.","User research drives product decisions.","Research new technologies before adopting them."],
  ["Enterprise","n.","Doanh nghiệp","A large company or organization","Hardware & Infrastructure","Enterprise applications require high availability.","Java is popular in enterprise development.","The enterprise plan includes 24/7 support."],
  ["Trend","n.","Xu hướng","A general direction of change","Algorithms","AI is the biggest trend in tech.","Monitor performance trends over time.","Follow industry trends for career growth."],
  ["Replace","v.","Thay thế","To put something new in place of","Algorithms","Replace the deprecated API with the new version.","Replace synchronous calls with async.","We need to replace the legacy system."],
  ["Expertise","n.","Chuyên môn","Expert knowledge in a field","Algorithms","Backend expertise is required for this role.","Share your expertise with the team.","DevOps expertise includes CI/CD and cloud."],
  ["Instruction","n.","Chỉ dẫn","A direction or command","Algorithms","The CPU executes instructions sequentially.","Follow the deployment instructions carefully.","Each instruction takes one clock cycle."],

  // IT Terminology
  ["Operating System","n.","Hệ điều hành","Software managing computer hardware","Hardware & Infrastructure","Linux is a popular server operating system.","The OS manages process scheduling.","Choose the right operating system for deployment."],
  ["Source Code","n.","Mã nguồn","Human-readable program text","Algorithms","Keep the source code in a Git repository.","Never expose source code to the public.","Review the source code before merging."],
  ["FAQ","n.","Câu hỏi thường gặp","Frequently Asked Questions","Data Systems","Add a FAQ section to the documentation.","The FAQ answers common user questions.","Update the FAQ after each release."],
  ["HTML","n.","Ngôn ngữ đánh dấu siêu văn bản","HyperText Markup Language","Data Systems","HTML structures web page content.","Use semantic HTML for accessibility.","HTML5 supports audio and video elements."],
  ["LAN","n.","Mạng cục bộ","Local Area Network","Hardware & Infrastructure","The office LAN connects all computers.","LAN speeds are faster than WAN.","Configure the LAN for the development team."],
  ["Network Administrator","n.","Quản trị mạng","Person managing network infrastructure","Hardware & Infrastructure","The network administrator configures firewalls.","Contact the network administrator for VPN access.","Network administrators monitor network traffic."],
  ["OSI Model","n.","Mô hình OSI","Open Systems Interconnection reference model","Hardware & Infrastructure","The OSI model has 7 layers.","HTTP operates at the application layer of OSI.","Understanding OSI helps debug network issues."],
  ["PPP","n.","Giao thức điểm-điểm","Point-to-Point Protocol","Hardware & Infrastructure","PPP establishes direct connections between nodes.","PPP is used for dial-up internet connections.","PPP supports authentication mechanisms."],
  ["Multi-task","adj.","Đa nhiệm","Performing multiple tasks simultaneously","Hardware & Infrastructure","Modern CPUs support multi-task processing.","The OS handles multi-task scheduling.","Multi-task environments need thread safety."],
  ["Arithmetic","n.","Số học","Branch of math dealing with numbers","Algorithms","Binary arithmetic uses only 0 and 1.","Floating-point arithmetic can cause precision issues.","The ALU handles arithmetic operations in the CPU."],
];

async function seedExtra() {
  let dayNum = 16; // Start from day 16 since existing vocab uses days 1-15
  let count = 0;

  for (const v of extraVocab) {
    count++;
    if (count > 10) { count = 1; dayNum++; }

    // Check if term already exists
    const existing = await query('SELECT id FROM vocabulary WHERE term = ?', [v[0]]);
    if (existing.length > 0) {
      console.log(`  Skipping "${v[0]}" (already exists)`);
      continue;
    }

    await query('INSERT INTO vocabulary (term, word_type, definition_vi, definition_en, category, example1, example2, example3, day_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], dayNum]);
  }

  console.log(`✅ Added extra IT vocabulary!`);

  // Now add check-in/attendance table
  await query(`CREATE TABLE IF NOT EXISTS user_checkins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    checkin_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_checkin (user_id, checkin_date),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Badges table
  await query(`CREATE TABLE IF NOT EXISTS user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    badge_type VARCHAR(50) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_badge (user_id, badge_type),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  console.log('✅ Created checkin & badges tables!');
  process.exit(0);
}

seedExtra().catch(e => { console.error(e); process.exit(1); });
