const { query, getPool } = require('./database');

const vocabAlgorithm = [
  ["Algorithm","n.","Thuật toán","A step-by-step procedure for solving a problem","algorithm","The sorting algorithm runs in O(n log n) time.","We need to optimize the algorithm for better performance.","This algorithm handles edge cases efficiently."],
  ["Data structure","n.","Cấu trúc dữ liệu","A way of organizing data in a computer","data_structure","Choosing the right data structure is crucial.","Arrays and linked lists are basic data structures.","The data structure supports O(1) lookup."],
  ["Complexity","n.","Độ phức tạp","A measure of resources needed by an algorithm","complexity","The time complexity of this function is O(n²).","We should reduce the complexity of this module.","Space complexity matters for embedded systems."],
  ["Time complexity","n.","Độ phức tạp thời gian","How runtime grows with input size","time_complexity","Binary search has O(log n) time complexity.","We optimized the time complexity from O(n²) to O(n log n).","Time complexity analysis helps compare algorithms."],
  ["Space complexity","n.","Độ phức tạp không gian","How memory usage grows with input size","space_complexity","The space complexity is O(n) for this approach.","We traded space complexity for better runtime.","In-place sorting has O(1) space complexity."],
  ["Sorting","n.","Sắp xếp","Arranging data in a specific order","sorting","QuickSort is an efficient sorting algorithm.","We implemented custom sorting for the leaderboard.","Sorting the transaction list by timestamp."],
  ["Searching","n.","Tìm kiếm","Finding specific data in a collection","searching","Binary searching is faster than linear searching.","The searching algorithm scans the database index.","Implement full-text searching for the document store."],
  ["Array","n.","Mảng","A collection of elements stored at contiguous memory","array","Initialize the array with default values.","The array stores user session data.","We iterate through the array to find matches."],
  ["Linked list","n.","Danh sách liên kết","A linear collection of nodes","linked_list","A linked list allows O(1) insertions.","The message queue uses a linked list internally.","Traverse the linked list to find the target node."],
  ["Stack","n.","Ngăn xếp","A LIFO data structure","stack","Use a stack to track function calls.","The undo feature uses a stack data structure.","Push the new element onto the stack."],
  ["Queue","n.","Hàng đợi","A FIFO data structure","queue","Kafka uses a message queue architecture.","Add the task to the processing queue.","The queue handles async job processing."],
  ["Tree","n.","Cây","A hierarchical data structure","tree","The DOM is represented as a tree.","We use a B-tree index for the database.","Parse the XML into a tree structure."],
  ["Binary tree","n.","Cây nhị phân","A tree where each node has at most two children","binary_tree","A binary tree is used in heap implementation.","Search in a balanced binary tree is O(log n).","Convert the sorted array to a binary tree."],
  ["Graph","n.","Đồ thị","A collection of nodes connected by edges","graph","Model the network topology as a graph.","The microservice dependency graph shows bottlenecks.","Use BFS to traverse the graph."],
  ["Traversal","n.","Duyệt","Visiting all nodes in a data structure","traversal","In-order traversal gives sorted output.","BFS traversal is used for shortest path.","Tree traversal is essential for parsing."],
  ["Recursion","n.","Đệ quy","A function calling itself","recursion","Recursion simplifies tree traversal code.","Watch out for stack overflow with deep recursion.","Convert recursion to iteration for optimization."],
  ["Iteration","n.","Lặp","Repeating a process","iteration","Use iteration instead of recursion here.","Each iteration processes one batch of records.","The loop completes in three iterations."],
  ["Function","n.","Hàm","A reusable block of code","function","This function validates user input.","The function returns a JSON response.","Keep each function focused on a single task."],
  ["Variable","n.","Biến","A named storage location","variable","Declare the variable before using it.","This variable holds the database connection.","Use meaningful variable names for readability."],
  ["Constant","n.","Hằng số","A value that cannot change","constant","Define the API endpoint as a constant.","Use constants for configuration values.","The constant MAX_RETRIES is set to 3."],
  ["Integer","n.","Số nguyên","A whole number data type","integer","The user ID is stored as an integer.","Parse the string to an integer before calculation.","Integer overflow can cause unexpected bugs."],
  ["Float","n.","Số thực","A decimal number data type","float","Store the price as a float value.","Float precision can cause rounding errors.","Convert the float to BigDecimal for financial calculations."],
  ["String","n.","Chuỗi ký tự","A sequence of characters","string","Concatenate the string with the user's name.","Validate the input string before processing.","The API returns a JSON string response."],
  ["Boolean","n.","Kiểu dữ liệu logic","A true/false data type","boolean","The boolean flag indicates if user is active.","Use boolean logic for access control.","The method returns a boolean result."],
  ["Conditional statement","n.","Câu lệnh điều kiện","Code that runs based on a condition","conditional","Use a conditional statement to check user roles.","The conditional handles null pointer exceptions.","Add a conditional for edge case validation."],
  ["Loop","n.","Vòng lặp","Code that repeats","loop","The loop processes each item in the collection.","Avoid infinite loops in production code.","Use a for loop to iterate over the results."],
  ["Input","n.","Đầu vào","Data received by a program","input","Sanitize all user input to prevent SQL injection.","The function takes a JSON object as input.","Validate the input parameters before processing."],
  ["Output","n.","Đầu ra","Data produced by a program","output","The API output is formatted as JSON.","Log the output for debugging purposes.","The expected output matches the test case."],
  ["Syntax","n.","Cú pháp","Rules defining valid code structure","syntax","Fix the syntax error on line 42.","Java and Python have different syntax rules.","The compiler reports syntax errors first."],
  ["Semantic","n.","Ngữ nghĩa","The meaning of code statements","semantic","A semantic error produces wrong results.","Semantic analysis happens after parsing.","The code has a semantic bug in the logic."],
  ["Bug","n.","Lỗi","A defect in software","bug","I found a critical bug in the payment module.","The bug causes data corruption under high load.","File a bug report with reproduction steps."],
  ["Debugging","n.","Gỡ lỗi","Finding and fixing bugs","debugging","Use breakpoints for debugging the service.","Debugging distributed systems is challenging.","The debugging session revealed a race condition."],
  ["Compiler","n.","Trình biên dịch","Translates source code to machine code","compiler","The Java compiler generates bytecode.","The compiler detected unused variables.","Enable compiler warnings for better code quality."],
  ["Interpreter","n.","Trình thông dịch","Executes code line by line","interpreter","Python uses an interpreter for execution.","The JavaScript interpreter runs in the browser.","An interpreter is slower than a compiler."],
  ["Pseudo-code","n.","Mã giả","Informal description of an algorithm","pseudocode","Write pseudo-code before implementing.","The pseudo-code outlines the business logic.","Review the pseudo-code with the team first."],
  ["Flowchart","n.","Sơ đồ thuật toán","A diagram representing a process","flowchart","Create a flowchart for the payment flow.","The flowchart shows the decision points.","Use the flowchart to explain the algorithm."],
  ["Algorithm analysis","n.","Phân tích thuật toán","Evaluating algorithm efficiency","algorithm_analysis","Algorithm analysis compares different approaches.","We performed algorithm analysis before choosing.","Algorithm analysis considers worst-case scenarios."],
  ["Data abstraction","n.","Trừu tượng hóa dữ liệu","Hiding implementation details","data_abstraction","Data abstraction simplifies the interface.","Use data abstraction to reduce complexity.","The OOP principle relies on data abstraction."],
  ["Encapsulation","n.","Đóng gói","Bundling data with methods","encapsulation","Encapsulation protects internal state.","Java enforces encapsulation with access modifiers.","Good encapsulation improves code maintainability."],
  ["Inheritance","n.","Kế thừa","A class deriving from another","inheritance","Use inheritance for code reuse.","Java supports single inheritance only.","Prefer composition over inheritance."],
  ["Polymorphism","n.","Đa hình","Objects taking multiple forms","polymorphism","Polymorphism enables flexible code design.","Method overriding is runtime polymorphism.","The strategy pattern uses polymorphism."],
  ["Big O notation","n.","Ký hiệu Big O","Describes algorithm performance","big_o","Big O notation measures worst-case time.","This runs in O(n) using Big O notation.","Understand Big O notation for interviews."],
  ["Hash table","n.","Bảng băm","Key-value storage with hashing","hash_table","Redis is essentially a hash table in memory.","Hash table lookup is O(1) on average.","Use a hash table for the cache layer."],
  ["Heap","n.","Cấu trúc dữ liệu heap","A tree-based priority structure","heap","Use a min-heap for the priority queue.","The heap ensures O(log n) insertion.","Java PriorityQueue uses a binary heap."],
  ["Graph theory","n.","Lý thuyết đồ thị","Study of graphs","graph_theory","Graph theory applies to network routing.","Social networks use graph theory concepts.","Apply graph theory to optimize delivery routes."],
  ["Time-space tradeoff","n.","Đánh đổi thời gian-không gian","Trading memory for speed or vice versa","tradeoff","Caching is a classic time-space tradeoff.","Consider the time-space tradeoff for this feature.","Memoization demonstrates time-space tradeoff."],
  ["Binary search","n.","Tìm kiếm nhị phân","Search by halving the search space","binary_search","Binary search requires a sorted array.","Implement binary search for the lookup service.","Binary search runs in O(log n) time."],
  ["Dynamic programming","n.","Quy hoạch động","Solving problems by breaking into subproblems","dp","Dynamic programming optimizes recursive solutions.","Use dynamic programming for the pricing algorithm.","Fibonacci is a classic dynamic programming example."],
  ["Divide and conquer","n.","Chia để trị","Breaking a problem into smaller parts","divide_conquer","Merge sort uses the divide and conquer approach.","Divide and conquer reduces problem complexity.","The microservice design follows divide and conquer."],
  ["Greedy algorithm","n.","Thuật toán tham lam","Making locally optimal choices","greedy","A greedy algorithm works for Huffman coding.","The greedy approach doesn't always find the optimum.","Use a greedy algorithm for the scheduling system."]
];

const vocabDatabase = [
  ["Database","n.","Cơ sở dữ liệu","An organized collection of data","database","The database stores customer records.","Migrate the database to PostgreSQL.","Back up the database before deployment."],
  ["DBMS","n.","Hệ quản trị CSDL","Software to manage databases","dbms","PostgreSQL is an open-source DBMS.","The DBMS handles concurrent transactions.","Choose the right DBMS for your workload."],
  ["Table","n.","Bảng","A collection of related data in rows","table","Create a table for user transactions.","The table has a composite primary key.","Join the two tables on customer_id."],
  ["Row","n.","Dòng, bản ghi","A single record in a table","row","Each row represents one transaction.","Insert a new row into the orders table.","The query returns 1000 rows."],
  ["Column","n.","Cột, thuộc tính","A field in a table","column","Add a new column for email verification.","The column stores timestamps in UTC.","Index this column for faster queries."],
  ["Query","n.","Truy vấn","A request for data","query","Optimize the query to reduce load time.","The query joins three tables.","Write a query to find active users."],
  ["SQL","n.","Ngôn ngữ truy vấn có cấu trúc","Language for managing databases","sql","Write SQL to update the customer records.","SQL injection is a serious vulnerability.","The SQL query runs in under 100ms."],
  ["Primary key","n.","Khóa chính","Unique identifier for a row","primary_key","Use UUID as the primary key.","The primary key ensures row uniqueness.","Never expose the primary key to clients."],
  ["Foreign key","n.","Khóa ngoại","A reference to another table's key","foreign_key","Add a foreign key to link orders to users.","The foreign key enforces referential integrity.","Cascade delete on the foreign key constraint."],
  ["Index","n.","Chỉ mục","Structure to speed up queries","index","Create an index on the email column.","The composite index covers both fields.","Too many indexes slow down writes."],
  ["Relational database","n.","CSDL quan hệ","Database using tables and relationships","relational","PostgreSQL is a relational database.","The relational database enforces ACID properties.","Model the data in a relational database."],
  ["Non-relational database","n.","CSDL phi quan hệ","Database not using traditional tables","nonrelational","MongoDB is a non-relational database.","Use a non-relational database for flexible schemas.","Non-relational databases scale horizontally."],
  ["Data model","n.","Mô hình dữ liệu","Abstract representation of data","data_model","Design the data model before coding.","The data model supports multi-tenancy.","Review the data model with the team."],
  ["Schema","n.","Lược đồ","Structure of a database","schema","Update the schema for the new feature.","The schema migration runs automatically.","Review the schema changes before merging."],
  ["Normalization","n.","Chuẩn hóa","Organizing data to reduce redundancy","normalization","Apply normalization to third normal form.","Normalization prevents data anomalies.","Sometimes denormalization improves read performance."],
  ["Entity","n.","Thực thể","An object represented in a database","entity","The User entity maps to the users table.","Define the entity relationships first.","Each entity has a unique identifier."],
  ["Relationship","n.","Mối quan hệ","Connection between entities","relationship","Define a one-to-many relationship.","The relationship between orders and products.","Map the relationship using a junction table."],
  ["Transaction","n.","Giao dịch","A unit of database work","transaction","Wrap the operations in a transaction.","The transaction ensures data consistency.","Rollback the transaction on failure."],
  ["Backup","n.","Sao lưu","A copy of data for recovery","backup","Schedule daily database backups.","The backup saved us from data loss.","Store backups in a different region."],
  ["Restore","v.","Khôi phục","Recovering data from backup","restore","Restore the database from last night's backup.","The restore process takes about 30 minutes.","Test the restore procedure regularly."],
  ["Cloud storage","n.","Lưu trữ đám mây","Storing data on remote servers","cloud_storage","Upload the files to cloud storage.","Cloud storage reduces infrastructure costs.","Use S3 for cloud storage on AWS."],
  ["Big data","n.","Dữ liệu lớn","Extremely large datasets","big_data","Big data requires distributed processing.","We use Spark for big data analytics.","Big data drives business intelligence decisions."],
  ["Data mining","n.","Khai phá dữ liệu","Discovering patterns in data","data_mining","Data mining reveals customer behavior patterns.","Apply data mining to the transaction logs.","Data mining helps detect fraud."],
  ["Data warehouse","n.","Kho dữ liệu","Central repository for reporting data","data_warehouse","ETL loads data into the data warehouse.","The data warehouse supports analytics queries.","Build the data warehouse on Redshift."],
  ["Data integrity","n.","Toàn vẹn dữ liệu","Accuracy and consistency of data","data_integrity","Constraints ensure data integrity.","Data integrity is critical in banking systems.","Verify data integrity after migration."],
  ["Data security","n.","Bảo mật dữ liệu","Protecting data from unauthorized access","data_security","Encryption ensures data security at rest.","Data security policies comply with regulations.","Implement data security best practices."],
  ["Data governance","n.","Quản trị dữ liệu","Managing data availability and quality","data_governance","Data governance defines data ownership.","Follow the data governance framework.","Data governance ensures regulatory compliance."],
  ["Distributed database","n.","CSDL phân tán","Database spread across locations","distributed_db","A distributed database improves availability.","CAP theorem applies to distributed databases.","Cassandra is a distributed database system."],
  ["SQL injection","n.","Lỗi bảo mật SQL","A security attack via SQL","sql_injection","Use prepared statements to prevent SQL injection.","SQL injection can expose sensitive data.","The scanner detected an SQL injection vulnerability."],
  ["NoSQL","n.","Không phải SQL","Non-relational database systems","nosql","NoSQL databases handle unstructured data.","Choose NoSQL for flexible data models.","MongoDB and Redis are popular NoSQL databases."],
  ["Data type","n.","Kiểu dữ liệu","Classification of data","data_type","Choose the correct data type for each column.","VARCHAR is a common string data type.","Mismatched data types cause runtime errors."],
  ["Field","n.","Trường","A single piece of data in a record","field","The email field must be unique.","Add a timestamp field to the table.","Validate each field before saving."],
  ["Record","n.","Bản ghi","A complete set of field values","record","The record was updated successfully.","Each record represents a bank transaction.","Delete the duplicate records."],
  ["Attribute","n.","Thuộc tính","A property of an entity","attribute","The user entity has a name attribute.","Add a new attribute to the product model.","Map the JSON attribute to the column."],
  ["Query optimization","n.","Tối ưu hóa truy vấn","Improving query performance","query_opt","Query optimization reduced response time by 60%.","Use EXPLAIN for query optimization.","Index-based query optimization is essential."],
  ["Data processing","n.","Xử lý dữ liệu","Transforming raw data","data_processing","Real-time data processing uses Kafka Streams.","Batch data processing runs overnight.","The data processing pipeline handles 1M events/hour."],
  ["Data visualization","n.","Trực quan hóa dữ liệu","Presenting data graphically","data_viz","Data visualization helps stakeholders understand trends.","Use charts for data visualization.","The dashboard provides real-time data visualization."],
  ["ETL","n.","Trích xuất, chuyển đổi, tải","Extract, Transform, Load process","etl","The ETL pipeline runs every 6 hours.","ETL loads data into the analytics warehouse.","Monitor the ETL job for failures."],
  ["Data lake","n.","Hồ dữ liệu","Storage for raw data at scale","data_lake","Store raw logs in the data lake.","The data lake supports multiple data formats.","Query the data lake using Athena."],
  ["API","n.","Giao diện lập trình ứng dụng","Interface for software communication","api","The REST API returns JSON responses.","Document the API endpoints using Swagger.","The API handles 10,000 requests per second."],
  ["Web service","n.","Dịch vụ web","A service accessible over the web","web_service","Deploy the web service on AWS.","The web service communicates via REST.","Monitor the web service health checks."],
  ["Endpoint","n.","Điểm cuối","A URL for an API resource","endpoint","Create an endpoint for user registration.","The endpoint validates the request body.","Test each endpoint with Postman."],
  ["Database migration","n.","Di chuyển CSDL","Updating database schema","db_migration","Run the database migration before deploying.","The migration adds a new column.","Rollback the migration if tests fail."],
  ["Transaction log","n.","Nhật ký giao dịch","Record of database operations","tx_log","The transaction log enables point-in-time recovery.","Monitor the transaction log for anomalies.","Archive old transaction log entries."]
];

const vocabHardware = [
  ["Hardware","n.","Phần cứng","Physical computer components","hardware","Upgrade the server hardware for better performance.","The hardware failure caused downtime.","Test on different hardware configurations."],
  ["Software","n.","Phần mềm","Programs and applications","software","Deploy the software to production.","The software update fixes critical bugs.","Open-source software reduces licensing costs."],
  ["CPU","n.","Bộ xử lý trung tâm","The main processor","cpu","The CPU usage spikes during peak hours.","Upgrade to a multi-core CPU.","Monitor CPU utilization on the server."],
  ["RAM","n.","Bộ nhớ truy cập ngẫu nhiên","Volatile working memory","ram","The server needs more RAM for caching.","RAM stores data for quick access.","Increase RAM to 32GB for the database server."],
  ["ROM","n.","Bộ nhớ chỉ đọc","Non-volatile read-only memory","rom","The BIOS is stored in ROM.","ROM retains data without power.","Firmware updates modify the ROM contents."],
  ["Hard drive","n.","Ổ cứng","Magnetic storage device","hard_drive","Replace the hard drive with an SSD.","The hard drive stores persistent data.","The hard drive capacity is 2TB."],
  ["SSD","n.","Ổ đĩa thể rắn","Fast solid-state storage","ssd","SSD improves database read performance.","Migrate to SSD for faster boot times.","The SSD handles more IOPS than HDD."],
  ["Motherboard","n.","Bo mạch chủ","Main circuit board","motherboard","The motherboard connects all components.","Check the motherboard for compatibility.","The server motherboard supports dual CPUs."],
  ["Graphics card","n.","Card đồ họa","GPU for visual processing","gpu","The graphics card accelerates ML training.","Install a new graphics card for rendering.","GPU computing uses the graphics card."],
  ["Operating system","n.","Hệ điều hành","Software managing hardware resources","os","Deploy on a Linux operating system.","The operating system manages memory allocation.","Ubuntu is a popular server operating system."],
  ["Server","n.","Máy chủ","A computer that serves requests","server","Deploy the application to the production server.","The server handles 10K concurrent connections.","Scale horizontally by adding more servers."],
  ["Client","n.","Máy khách","A device requesting services","client","The client sends HTTP requests to the server.","Build a React client for the web app.","The mobile client uses REST APIs."],
  ["Router","n.","Bộ định tuyến","Device directing network traffic","router","Configure the router for load balancing.","The router forwards packets between networks.","Update the router firmware for security."],
  ["Firewall","n.","Tường lửa","Security barrier for networks","firewall","Configure the firewall rules for port 443.","The firewall blocks unauthorized access.","AWS Security Groups act as a firewall."],
  ["Encryption","n.","Mã hóa","Converting data to secure form","encryption","Use AES-256 encryption for sensitive data.","Encryption protects data in transit.","Enable encryption at rest for the database."],
  ["Protocol","n.","Giao thức","Rules for data communication","protocol","HTTP is the protocol for web communication.","The protocol defines message format.","Use HTTPS protocol for secure connections."],
  ["IP address","n.","Địa chỉ IP","Network device identifier","ip","Whitelist the IP address in the firewall.","The server's IP address is static.","Map the domain to the IP address."],
  ["Virtualization","n.","Ảo hóa","Creating virtual versions of resources","virtualization","Virtualization reduces hardware costs.","Docker uses OS-level virtualization.","Server virtualization improves resource utilization."],
  ["Cloud computing","n.","Điện toán đám mây","On-demand computing services","cloud","AWS is a leading cloud computing platform.","Cloud computing enables auto-scaling.","Migrate to cloud computing for flexibility."],
  ["Docker","n.","Docker","Container platform","docker","Use Docker to containerize the application.","Docker ensures consistent environments.","Build the Docker image for deployment."],
  ["Microservices","n.","Vi dịch vụ","Architecture of small services","microservices","We split the monolith into microservices.","Each microservice has its own database.","Microservices communicate via REST APIs."],
  ["CI/CD","n.","Tích hợp/Triển khai liên tục","Continuous Integration/Deployment","cicd","Jenkins handles our CI/CD pipeline.","CI/CD automates testing and deployment.","Set up CI/CD for the new repository."],
  ["REST API","n.","API kiểu REST","Representational State Transfer API","rest","Design the REST API following best practices.","The REST API uses standard HTTP methods.","Document the REST API with Swagger."],
  ["Kafka","n.","Kafka","Distributed event streaming platform","kafka","Use Kafka for real-time event processing.","Kafka handles millions of messages per second.","The Kafka consumer processes order events."],
  ["Redis","n.","Redis","In-memory data store","redis","Use Redis for session caching.","Redis supports pub/sub messaging.","The Redis cache reduces database load by 70%."],
  ["Jenkins","n.","Jenkins","CI/CD automation server","jenkins","Configure Jenkins for automated builds.","The Jenkins pipeline runs tests on every commit.","Jenkins deploys to staging automatically."],
  ["AWS","n.","Amazon Web Services","Cloud computing platform","aws","Deploy the application on AWS EC2.","Use AWS S3 for file storage.","AWS Lambda enables serverless computing."],
  ["Malware","n.","Phần mềm độc hại","Malicious software","malware","The malware scanner detected a threat.","Protect against malware with antivirus software.","The malware exploited a zero-day vulnerability."],
  ["IoT","n.","Internet vạn vật","Internet-connected devices","iot","IoT sensors track vehicle locations.","The IoT platform processes sensor data.","Build an IoT dashboard for fleet management."],
  ["AI","n.","Trí tuệ nhân tạo","Artificial Intelligence","ai","AI powers the recommendation engine.","Use AI for fraud detection in banking.","AI models improve with more training data."]
];

const vocabTesting = [
  ["Test case","n.","Trường hợp kiểm thử","A set of conditions to verify software behavior","test_case","Write a test case for the login feature.","Each test case should have expected and actual results.","The test case covers edge cases like empty input."],
  ["Unit test","n.","Kiểm thử đơn vị","Testing individual components in isolation","unit_test","We use JUnit for writing unit tests.","Each method should have at least one unit test.","The unit test mocks the database connection."],
  ["Integration test","n.","Kiểm thử tích hợp","Testing combined components together","integration_test","Integration tests verify API endpoints work correctly.","Run integration tests after deploying to staging.","The integration test checks database queries."],
  ["Regression test","n.","Kiểm thử hồi quy","Re-testing after changes to ensure nothing broke","regression_test","Run regression tests before every release.","The regression test suite takes 45 minutes.","This bug was caught by regression testing."],
  ["Test automation","n.","Tự động hóa kiểm thử","Using tools to run tests automatically","test_automation","We use Selenium for test automation.","Test automation saves time on repetitive tasks.","Implement test automation for the CI/CD pipeline."],
  ["Bug","n.","Lỗi phần mềm","A defect in software","bug","I found a critical bug in the payment module.","Please describe the steps to reproduce this bug.","The bug only occurs on mobile devices."],
  ["Bug report","n.","Báo cáo lỗi","Documentation of a software defect","bug_report","Write a detailed bug report with screenshots.","The bug report should include reproduction steps.","Assign the bug report to the development team."],
  ["Test plan","n.","Kế hoạch kiểm thử","A document describing the testing approach","test_plan","Review the test plan before sprint starts.","The test plan covers functional and performance testing.","Update the test plan for the new release."],
  ["Test scenario","n.","Kịch bản kiểm thử","A sequence of steps to test a feature","test_scenario","This test scenario simulates user registration.","Write test scenarios for the checkout flow.","The test scenario includes both happy and error paths."],
  ["Smoke test","n.","Kiểm thử nhanh","A quick test to verify basic functionality","smoke_test","Run smoke tests after deployment to production.","The smoke test checks login, search, and checkout.","If smoke tests fail, rollback immediately."],
  ["Performance test","n.","Kiểm thử hiệu năng","Testing system speed and stability","performance_test","Use JMeter for performance testing.","The performance test simulates 1000 concurrent users.","Performance testing revealed database bottlenecks."],
  ["Load test","n.","Kiểm thử tải","Testing system behavior under expected load","load_test","The load test runs for 30 minutes at peak traffic.","Load testing helps identify scaling issues.","Run load tests before Black Friday launch."],
  ["Stress test","n.","Kiểm thử áp lực","Testing system beyond normal capacity","stress_test","Stress testing shows when the system breaks.","The stress test pushed the server to 200% capacity.","We discovered memory leaks through stress testing."],
  ["Test coverage","n.","Độ phủ kiểm thử","Percentage of code tested","test_coverage","We need at least 80% test coverage.","The test coverage report is generated by SonarQube.","Increase test coverage for the payment module."],
  ["Mock","n.","Đối tượng giả lập","A simulated object for testing","mock","Create a mock for the external API call.","Use Mockito to mock service dependencies.","The mock returns predefined test data."],
  ["Assertion","n.","Khẳng định","A check that verifies expected behavior","assertion","Add an assertion to verify the response status.","The assertion checks if the list is not empty.","Failed assertions cause the test to fail."],
  ["Defect","n.","Khiếm khuyết","An imperfection in software","defect","This defect affects the user experience badly.","Log the defect in Jira with severity level.","The defect was introduced in the last sprint."],
  ["Severity","n.","Mức độ nghiêm trọng","How serious a defect is","severity","This bug has critical severity - it blocks payments.","Classify defects by severity: Low, Medium, High, Critical.","High severity bugs must be fixed before release."],
  ["Priority","n.","Độ ưu tiên","Order in which to fix defects","priority","The PM sets priority for each bug fix.","P1 priority means fix immediately.","Balance severity and priority when planning sprints."],
  ["Test data","n.","Dữ liệu kiểm thử","Data used for testing","test_data","Generate test data for the staging environment.","Never use production data as test data.","The test data includes various edge cases."],
  ["Edge case","n.","Trường hợp biên","An unusual or extreme scenario","edge_case","Test edge cases like null values and empty strings.","This edge case causes a NullPointerException.","Don't forget edge cases in your test plan."],
  ["Boundary testing","n.","Kiểm thử biên","Testing at the limits of valid ranges","boundary_testing","Apply boundary testing for the age input field.","Boundary testing checks min, max, and out-of-range values.","This boundary test found an off-by-one error."],
  ["Acceptance test","n.","Kiểm thử chấp nhận","Testing if system meets business requirements","acceptance_test","The client runs acceptance tests before sign-off.","Write acceptance tests based on user stories.","All acceptance tests must pass before production deploy."],
  ["End-to-end test","n.","Kiểm thử đầu cuối","Testing the complete application flow","e2e_test","Use Cypress for end-to-end testing.","End-to-end tests simulate real user journeys.","The end-to-end test covers registration to checkout."],
  ["API testing","n.","Kiểm thử API","Testing application programming interfaces","api_testing","Use Postman for API testing.","API testing verifies request and response formats.","Automate API testing with RestAssured."],
  ["Exploratory testing","n.","Kiểm thử khám phá","Testing without predefined test cases","exploratory_testing","Spend 2 hours on exploratory testing today.","Exploratory testing found 3 undocumented issues.","Experienced testers excel at exploratory testing."],
  ["Sprint testing","n.","Kiểm thử trong sprint","QA activities within an agile sprint","sprint_testing","Sprint testing begins after dev completes features.","Allocate 30% of sprint time for testing.","Sprint testing includes both manual and automated tests."],
  ["TestNG","n.","Framework kiểm thử","A testing framework for Java","testng","Configure TestNG for parallel test execution.","TestNG supports data-driven testing natively.","We migrated from JUnit to TestNG last quarter."],
  ["Selenium","n.","Công cụ tự động hóa","A tool for automating web browsers","selenium","Use Selenium WebDriver for UI automation.","Selenium tests run in our CI/CD pipeline.","Write Selenium scripts for cross-browser testing."],
  ["Test environment","n.","Môi trường kiểm thử","A setup for running tests","test_env","Deploy the build to the test environment first.","The test environment mirrors production configuration.","Reset the test environment data every morning."],
];

async function seed() {
  // Check if already seeded
  const existing = await query('SELECT COUNT(*) as c FROM vocabulary');
  if (existing[0].c > 0) {
    console.log('Database already seeded. Skipping.');
    process.exit(0);
    return;
  }

  const allVocab = [
    ...vocabAlgorithm.map(v => [...v, 'Algorithms']),
    ...vocabDatabase.map(v => [...v, 'Data Systems']),
    ...vocabHardware.map(v => [...v, 'Hardware & Infrastructure']),
    ...vocabTesting.map(v => [...v, 'Testing & QA'])
  ];

  let dayNum = 1;
  let count = 0;

  for (const v of allVocab) {
    count++;
    if (count > 10) { count = 1; dayNum++; }
    await query('INSERT INTO vocabulary (term, word_type, definition_vi, definition_en, category, example1, example2, example3, day_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [v[0], v[1], v[2], v[3], v[8], v[5], v[6], v[7], dayNum]);
  }

  // Seed reading passages
  const readings = [
    ["Microservices Architecture in Banking","Microservices architecture has become the standard approach for building modern banking systems. Unlike monolithic applications, microservices break down complex banking operations into small, independent services that can be developed, deployed, and scaled individually.\n\nIn a typical banking microservices system, you might have separate services for account management, transaction processing, fraud detection, and customer notifications. Each service has its own database and communicates with others through APIs or message brokers like Apache Kafka.\n\nThis architecture offers several advantages for banking applications. First, it enables teams to work independently on different services, speeding up development. Second, if the fraud detection service experiences high load, it can be scaled without affecting other services. Third, if one service fails, the others continue to operate, improving system reliability.\n\nHowever, microservices also introduce challenges. Managing distributed transactions across services requires careful design. Monitoring and debugging become more complex when requests flow through multiple services. Despite these challenges, the benefits of flexibility, scalability, and resilience make microservices the preferred choice for modern banking platforms.","Backend Development",'[{"q":"What is the main advantage of microservices over monolithic applications?","options":["Lower cost","Independent development and scaling","Simpler debugging","Less code"],"answer":1},{"q":"How do banking microservices typically communicate?","options":["Direct database access","Shared memory","APIs or message brokers like Kafka","File transfer"],"answer":2},{"q":"What is a challenge of microservices architecture?","options":["Cannot scale","Too simple","Managing distributed transactions","Only works for small apps"],"answer":2}]',1],
    ["Docker and CI/CD in Software Development","Docker has revolutionized how software teams deploy applications. A Docker container packages an application with all its dependencies, ensuring it runs consistently across different environments - from a developer's laptop to production servers.\n\nIn a typical CI/CD pipeline, when a developer pushes code to the repository, Jenkins automatically triggers a build process. The pipeline compiles the code, runs unit tests, builds a Docker image, and deploys it to a staging environment. If all tests pass, the image is promoted to production.\n\nThis automated workflow eliminates the classic 'it works on my machine' problem. Every environment uses the same Docker image, so if code works in testing, it will work in production. Teams can deploy multiple times per day with confidence.\n\nDocker Compose allows developers to define multi-container applications. For example, a development setup might include containers for the Java application, PostgreSQL database, Redis cache, and Kafka message broker, all defined in a single docker-compose.yml file.","DevOps",'[{"q":"What problem does Docker solve?","options":["Slow internet","Inconsistent environments","Database design","Code writing"],"answer":1},{"q":"What tool is mentioned for CI/CD automation?","options":["Docker","Git","Jenkins","Kubernetes"],"answer":2},{"q":"What is Docker Compose used for?","options":["Single container apps","Multi-container applications","Code compilation","Database backup"],"answer":1}]',2],
    ["REST API Design Best Practices","Designing a well-structured REST API is essential for building scalable web services. REST (Representational State Transfer) uses standard HTTP methods to perform operations on resources.\n\nThe key principles include using nouns for endpoints (GET /users instead of GET /getUsers), proper HTTP status codes (200 for success, 404 for not found, 500 for server errors), and consistent response formats using JSON.\n\nVersion your API using URL paths like /api/v1/users to maintain backward compatibility. Implement pagination for endpoints that return large datasets. Use query parameters for filtering and sorting: GET /api/v1/transactions?status=completed&sort=date.\n\nAuthentication should use industry standards like JWT (JSON Web Tokens) or OAuth 2.0. Always validate input data on the server side to prevent security vulnerabilities like SQL injection. Document your API using tools like Swagger/OpenAPI, which generates interactive documentation that other developers can use to test endpoints.","Backend Development",'[{"q":"What naming convention should REST endpoints use?","options":["Verbs","Nouns","Adjectives","Numbers"],"answer":1},{"q":"What HTTP status code indicates a resource was not found?","options":["200","301","404","500"],"answer":2},{"q":"What tool is recommended for API documentation?","options":["Word document","Swagger/OpenAPI","Email","Spreadsheet"],"answer":1}]',3]
  ];

  for (const r of readings) {
    await query('INSERT INTO reading_passages (title, content, category, questions, day_number) VALUES (?, ?, ?, ?, ?)', r);
  }

  // Seed listening dialogues
  const dialogues = [
    ["Daily Standup Meeting","Dev Lead: Good morning everyone. Let's start our daily standup. John, would you like to go first?\n\nJohn: Sure. Yesterday I finished the REST API for the payment module. I wrote unit tests and they all pass. Today I'll work on integrating Kafka for async transaction processing. No blockers.\n\nDev Lead: Great progress. Sarah?\n\nSarah: I spent yesterday debugging a performance issue in the database queries. The query for fetching user transactions was taking over 3 seconds. I added a composite index and now it runs in under 200 milliseconds. Today I'll work on the data migration script. I might need help reviewing the schema changes.\n\nDev Lead: Nice optimization! I can review your schema changes after this meeting. Mike?\n\nMike: I deployed the Docker containers to staging yesterday and ran the integration tests. Found two failing tests related to the Redis cache invalidation. I fixed one and I'm still investigating the other. I'll also update the Jenkins pipeline to include the new microservice.\n\nDev Lead: Sounds good. Let's sync up about the Redis issue after standup.","Team Communication",'[{"q":"What did John complete yesterday?","options":["Database optimization","REST API for payment module","Docker deployment","Jenkins configuration"],"answer":1},{"q":"How much did Sarah improve the query performance?","options":["From 3s to 200ms","From 5s to 1s","From 10s to 3s","No improvement"],"answer":0},{"q":"What issue is Mike still investigating?","options":["Docker build failure","Jenkins error","Redis cache invalidation","Kafka connection"],"answer":2}]',1],
    ["Technical Interview Discussion","Interviewer: Can you describe your experience with microservices architecture?\n\nCandidate: In my previous role, I worked on a banking system where we migrated from a monolithic Java application to microservices. I was responsible for designing the transaction processing service using Spring Boot. We used Kafka as our message broker for async communication between services and Redis for caching frequently accessed data.\n\nInterviewer: How did you handle distributed transactions?\n\nCandidate: We implemented the Saga pattern using choreography. Each service publishes events to Kafka when it completes its local transaction. If any step fails, compensating transactions are triggered to roll back the changes. For example, if the payment deduction succeeds but the order confirmation fails, a compensating event reverses the payment.\n\nInterviewer: That's a solid approach. How did you ensure data consistency?\n\nCandidate: We used eventual consistency with idempotent consumers. Each Kafka consumer tracks processed message IDs in the database to prevent duplicate processing. We also implemented a dead letter queue for messages that fail after multiple retries.","Interview Preparation",'[{"q":"What pattern did the candidate use for distributed transactions?","options":["Two-phase commit","Saga pattern","CQRS","Event sourcing"],"answer":1},{"q":"What was used to prevent duplicate message processing?","options":["Locks","Timestamps","Idempotent consumers tracking message IDs","Random delays"],"answer":2}]',2]
  ];

  for (const d of dialogues) {
    await query('INSERT INTO listening_dialogues (title, dialogue, category, questions, day_number) VALUES (?, ?, ?, ?, ?)', d);
  }

  // Seed grammar exercises
  const grammar = [
    ["We need ___ the algorithm to improve performance.",'["optimize","to optimize","optimizing","optimized"]',"to optimize","'need to + verb' is the correct pattern. 'We need to optimize...'","Infinitives",1],
    ["The database ___ updated before we can deploy.",'["must be","must","must being","must to be"]',"must be","Passive voice with modal: 'must be + past participle'","Passive Voice",1],
    ["If the CPU usage ___ 90%, the auto-scaler will add more instances.",'["exceed","exceeds","exceeded","exceeding"]',"exceeds","First conditional: if + present simple, will + base form","Conditionals",1],
    ["The team ___ on this feature since last Monday.",'["works","worked","has been working","is working"]',"has been working","Present perfect continuous for actions started in the past and continuing","Tenses",1],
    ["Neither the frontend ___ the backend was ready for deployment.",'["or","and","nor","but"]',"nor","'Neither...nor' is the correct correlative conjunction","Conjunctions",2],
    ["The bug, which ___ by the QA team, caused data corruption.",'["was discovered","discovered","has discovered","discovering"]',"was discovered","Relative clause with passive voice in past tense","Relative Clauses",2],
    ["I suggest ___ the code before pushing to production.",'["review","to review","reviewing","reviewed"]',"reviewing","'suggest + gerund' is the correct pattern","Gerunds",2],
    ["The server ___ crashed if we had implemented proper error handling.",'["wouldn\'t have","won\'t have","wouldn\'t","won\'t"]',"wouldn't have","Third conditional: if + past perfect, would have + past participle","Conditionals",2],
    ["Each microservice ___ its own database and API endpoints.",'["have","has","having","had"]',"has","'Each' takes a singular verb","Subject-Verb Agreement",3],
    ["The deployment ___ completed by the time the client arrives.",'["will be","will have been","was","is being"]',"will have been","Future perfect passive: will have been + past participle","Tenses",3],
    ["We should ___ the Redis cache to improve response time.",'["implement","implementing","implemented","to implement"]',"implement","'should + base form' - modal verb pattern","Modals",3],
    ["The API ___ returns JSON or XML, depending on the Accept header.",'["both","either","neither","none"]',"either","'either...or' for two options","Correlative Conjunctions",3],
    ["Had we known about the bug earlier, we ___ it before release.",'["would fix","would have fixed","will fix","fixed"]',"would have fixed","Inverted third conditional with 'Had'","Conditionals",4],
    ["The data ___ be encrypted before storing in the database.",'["has","must","is","does"]',"must","'must + base form' for obligation/requirement","Modals",4],
    ["By next month, we ___ three new microservices.",'["will deploy","will have deployed","deployed","are deploying"]',"will have deployed","Future perfect for completed actions by a future time","Tenses",4]
  ];

  for (const g of grammar) {
    await query('INSERT INTO grammar_exercises (question, options, correct_answer, explanation, grammar_topic, day_number) VALUES (?, ?, ?, ?, ?, ?)', g);
  }

  // Seed writing tasks
  const writing = [
    ["Describe Your Project Experience","Write about a software project you worked on. Include: the project name, your role, the technologies used (e.g., Java, Spring Boot, PostgreSQL, Docker), the main challenges, and how you solved them. Use past tense and professional language.","In my previous role, I worked on a banking transaction processing system. As a backend developer, I was responsible for designing and implementing the payment service using Java and Spring Boot. The system used PostgreSQL for data storage and Redis for caching.\n\nThe main challenge was handling high transaction volumes during peak hours. The system needed to process over 10,000 transactions per minute while maintaining data consistency. To solve this, I implemented asynchronous processing using Apache Kafka as a message broker. Each transaction was published as an event and processed by dedicated consumer services.\n\nI also optimized the database queries by adding composite indexes and implementing connection pooling, which reduced response times by 60%. The project was successfully deployed using Docker containers and a Jenkins CI/CD pipeline.","Project Experience",180,1],
    ["Write a Technical Email to a Client","Write an email to an international client explaining a deployment delay. Include: the reason for the delay, the impact, and the new timeline. Use professional and polite language.","Subject: Update on Payment Module Deployment\n\nDear Mr. Johnson,\n\nI am writing to provide an update regarding the deployment of the payment processing module, originally scheduled for March 15th.\n\nDuring our final round of integration testing, we identified a critical issue with the transaction reconciliation feature. Specifically, the system was not correctly handling concurrent transactions during peak load periods, which could potentially lead to data inconsistencies.\n\nOur development team has already identified the root cause and implemented a fix. We are currently running comprehensive regression tests to ensure the fix does not introduce any side effects. The estimated time for completing these tests is three business days.\n\nTherefore, we would like to propose a revised deployment date of March 20th. This will give us sufficient time to thoroughly validate the fix and ensure system stability.\n\nI sincerely apologize for any inconvenience this delay may cause. Please feel free to reach out if you have any questions or concerns.\n\nBest regards,\n[Your Name]","Client Communication",180,2],
    ["Explain a Technical Concept","Write a clear explanation of how REST APIs work for a non-technical team member. Include: what REST is, how HTTP methods work (GET, POST, PUT, DELETE), and provide a simple example.","REST API stands for Representational State Transfer Application Programming Interface. It is a standard way for different software systems to communicate with each other over the internet, similar to how websites work in your browser.\n\nThink of a REST API as a waiter in a restaurant. The client (your application) places an order (sends a request), and the waiter (API) brings back the food (returns data) from the kitchen (server).\n\nREST APIs use standard HTTP methods, each serving a specific purpose:\n- GET: Retrieves data (like viewing a customer's account details)\n- POST: Creates new data (like registering a new customer)\n- PUT: Updates existing data (like changing a customer's email address)\n- DELETE: Removes data (like deleting an expired promotion)\n\nFor example, to get a list of all customers, the system sends a GET request to /api/customers, and the server responds with the customer data in JSON format. This standardized approach makes it easy for different systems to work together.","Technical Writing",180,3]
  ];

  for (const w of writing) {
    await query('INSERT INTO writing_tasks (title, prompt, sample_answer, category, word_limit, day_number) VALUES (?, ?, ?, ?, ?, ?)', w);
  }

  // Seed speaking prompts
  const speaking = [
    ["Introduce yourself as a Software Developer","Practice introducing yourself for a job interview. Mention your experience, main technologies, and what you're looking for in your next role.","Hi, my name is [Name]. I'm a software developer with over 4 years of experience in Java backend and full-stack development. I've worked on various projects in banking, logistics, and microservices systems. My main technologies include Java, Spring Boot, ReactJS, PostgreSQL, and Docker. I'm currently looking for a challenging role where I can contribute to building scalable distributed systems.","self-introduction|experience|technologies|career goals","Interview",1],
    ["Describe a technical challenge you solved","Talk about a difficult technical problem you encountered at work and how you resolved it.","One of the most challenging problems I faced was optimizing a slow database query in our banking transaction system. The query was taking over 5 seconds to return results because it was scanning millions of records without proper indexing. I analyzed the query execution plan, identified the bottleneck, and created a composite index on the frequently queried columns. I also implemented query result caching using Redis with a 5-minute TTL. After these optimizations, the response time dropped from 5 seconds to under 200 milliseconds.","problem identification|analysis|solution|results","Interview",2],
    ["Explain your experience with microservices","Describe a microservices project you worked on, the technologies used, and the benefits you observed.","In my previous role at a banking company, I was part of a team that migrated a monolithic application to a microservices architecture. We used Spring Boot for the services, Apache Kafka for asynchronous communication, and Docker for containerization. The main benefit was that each team could develop and deploy their service independently. We also gained better scalability - during peak hours, we could scale the transaction processing service without affecting other services. The CI/CD pipeline with Jenkins automated our deployment process, allowing us to deploy multiple times per day.","architecture|technologies|benefits|team collaboration","Interview",3]
  ];

  for (const s of speaking) {
    await query('INSERT INTO speaking_prompts (prompt, sample_answer, key_phrases, category, day_number) VALUES (?, ?, ?, ?, ?)',
      [s[0], s[2], s[3], s[4], s[5]]);
  }

  // Seed companies
  const companies = [
    ['FPT Software','$800 - $2,500/mo',3.8,'Java,Spring Boot,AWS,Outsource','Công ty outsource lớn nhất VN, nhiều cơ hội đi onsite.'],
    ['VNG Corporation','$1,200 - $4,000/mo',4.2,'Java,Go,Microservices,Gaming','Product company hàng đầu, văn hóa startup.'],
    ['Tiki','$1,000 - $3,500/mo',4.0,'Java,ReactJS,Kafka,E-commerce','E-commerce lớn, nhiều bài toán scale.'],
    ['Shopee Vietnam','$1,500 - $5,000/mo',4.1,'Java,Go,Redis,Docker','Lương top thị trường, interview competitive.'],
    ['NashTech','$900 - $2,800/mo',3.9,'Java,.NET,Angular,Agile','Outsource UK, môi trường chuyên nghiệp, yêu cầu English cao.'],
    ['KMS Technology','$1,000 - $3,200/mo',4.3,'Java,ReactJS,AWS,Healthcare','Văn hóa tốt, focus healthcare domain.'],
    ['Momo','$1,200 - $4,500/mo',4.0,'Java,Kafka,Redis,Fintech','Fintech top VN, bài toán transaction processing hay.'],
    ['Axon Active','$1,100 - $3,000/mo',4.4,'Java,Agile,TDD,Swiss quality','Outsource Thụy Sĩ, chất lượng code cao, work-life balance tốt.'],
    ['TMA Solutions','$800 - $2,300/mo',3.7,'Java,C++,Embedded,Telecom','Outsource lâu đời, ổn định, training tốt cho junior.'],
    ['Grab Vietnam','$2,000 - $6,000/mo',4.3,'Go,Java,Kafka,Microservices','Big tech, lương rất cao, interview cực kỳ competitive.'],
    ['Techcombank','$1,500 - $4,000/mo',3.9,'Java,Spring,Oracle,Banking','Digital banking, dự án core banking transformation.'],
    ['VNPAY','$1,000 - $3,500/mo',3.8,'Java,Spring Boot,PostgreSQL,Payment','Payment gateway lớn nhất VN, nhiều bài toán real-time.']
  ];

  for (const c of companies) {
    await query('INSERT INTO companies (name, salary_range, rating, tags, description) VALUES (?, ?, ?, ?, ?)', c);
  }

  // Seed sample community reviews
  const reviews = [
    [1,null,'Nguyễn Văn A',0,'Can you explain the four pillars of OOP?','The four pillars are: Encapsulation – bundling data with methods, Abstraction – hiding complex details, Inheritance – creating child classes from parent classes, and Polymorphism – objects behaving differently based on their type.','Medium','Java Developer','Passed'],
    [1,null,'Ẩn danh',1,'Write a SQL query to find the second highest salary.','SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees). You can also use DENSE_RANK() window function.','Medium','Backend Developer','Passed'],
    [2,null,'Trần Thị B',0,'Design a URL shortening service like bit.ly.','Use a hash function to generate short codes. Store mapping in a distributed database. Consider using Base62 encoding for the short URL. Add caching with Redis for hot URLs.','Hard','Senior Developer','Passed'],
    [2,null,'Ẩn danh',1,'Explain the CAP theorem with a real-world example.','CAP theorem states a distributed system can only guarantee two of three: Consistency, Availability, and Partition tolerance. For example, MongoDB prioritizes Consistency and Partition tolerance, while Cassandra prioritizes Availability and Partition tolerance.','Hard','Backend Developer','Failed'],
    [4,null,'Ẩn danh',1,'Implement an LRU cache in Java.','Use a LinkedHashMap with access order set to true and override removeEldestEntry method. Or implement using a doubly linked list and HashMap for O(1) operations.','Hard','Software Engineer','Passed'],
    [4,null,'Phạm Minh C',0,'How would you design a payment system to handle millions of transactions?','Use event-driven architecture with Kafka for async processing. Implement idempotency keys to prevent duplicate charges. Use database sharding by merchant ID. Add circuit breakers for downstream services.','Hard','Senior Backend','Passed'],
    [7,null,'Ẩn danh',1,'How do you handle concurrent transactions in a digital wallet?','Use optimistic locking with version numbers. Implement the Saga pattern for distributed transactions. Use Redis distributed locks for critical sections. Always validate balance before deduction with SELECT FOR UPDATE.','Hard','Backend Developer','Passed'],
    [10,null,'Ẩn danh',1,'Design a ride-sharing system like Grab.','Key components: Real-time location service using WebSocket, matching algorithm using geospatial indexing, pricing engine with surge pricing, payment processing with multiple providers. Use event sourcing for trip lifecycle management.','Hard','Senior Engineer','Failed'],
    [10,null,'Lê Văn D',0,'Explain consistent hashing and its use cases.','Consistent hashing distributes data across nodes using a hash ring. When a node is added/removed, only K/n keys need redistribution. Used in: distributed caching (Redis Cluster), database sharding, load balancing.','Medium','Software Engineer','Passed'],
    [6,null,'Ẩn danh',1,'Tell me about yourself and your experience.','I am a Java developer with 3 years of experience in building microservices for healthcare applications. I have worked with Spring Boot, PostgreSQL, and AWS services. My recent project involved building a patient management system processing 100K records daily.','Easy','Java Developer','Passed'],
    [3,null,'Hoàng Thị E',0,'How would you optimize a slow database query?','First, use EXPLAIN ANALYZE to identify bottlenecks. Add appropriate indexes (composite if needed). Consider query rewriting to avoid full table scans. Implement caching for frequently accessed data. Consider database partitioning for large tables.','Medium','Backend Developer','Passed'],
    [5,null,'Ẩn danh',1,'Explain SOLID principles with examples.','S: Single Responsibility - one class, one job. O: Open/Closed - open for extension, closed for modification. L: Liskov Substitution - subtypes must be substitutable. I: Interface Segregation - many specific interfaces. D: Dependency Inversion - depend on abstractions.','Medium','Full Stack Developer','Passed']
  ];

  for (const r of reviews) {
    await query('INSERT INTO company_reviews (company_id, user_id, display_name, is_anonymous, interview_question, suggested_answer, difficulty, position, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', r);
  }

  console.log('✅ Database seeded successfully!');
  console.log(`  - ${allVocab.length} vocabulary words`);
  console.log(`  - ${readings.length} reading passages`);
  console.log(`  - ${dialogues.length} listening dialogues`);
  console.log(`  - ${grammar.length} grammar exercises`);
  console.log(`  - ${writing.length} writing tasks`);
  console.log(`  - ${speaking.length} speaking prompts`);
  console.log(`  - ${companies.length} companies`);
  console.log(`  - ${reviews.length} community reviews`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
