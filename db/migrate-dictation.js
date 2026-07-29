require('dotenv').config();
const { query } = require('./database');

async function migrateDictation() {
  try {
    await query(`CREATE TABLE IF NOT EXISTS dictation_exercises (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) DEFAULT 'short-stories',
      level VARCHAR(50) DEFAULT 'beginner',
      sentences JSON NOT NULL,
      topic_id INT,
      day_number INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('✅ Created dictation_exercises table');

    // Seed dictation exercises
    const exercises = [
      // SHORT STORIES - Beginner
      { title: 'First Day at Work', category: 'short-stories', level: 'beginner', day_number: 1,
        sentences: [
          "Today is my first day at the new company.",
          "I woke up early and put on my best shirt.",
          "The office is on the fifth floor of a tall building.",
          "My manager showed me around and introduced me to the team.",
          "Everyone was very friendly and welcoming.",
          "I set up my computer and email account.",
          "For lunch, I went to a small restaurant nearby.",
          "After lunch, I had a meeting with my team leader.",
          "She explained my responsibilities and goals.",
          "I went home feeling excited about the new job."
        ]
      },
      { title: 'The Coffee Shop', category: 'short-stories', level: 'beginner', day_number: 2,
        sentences: [
          "There is a nice coffee shop near my house.",
          "I go there every morning before work.",
          "The barista knows my name and my favorite drink.",
          "I usually order a large cappuccino with extra milk.",
          "Sometimes I buy a chocolate muffin too.",
          "I sit by the window and read the news on my phone.",
          "The coffee shop has free wifi and comfortable chairs.",
          "Many students come here to study in the afternoon.",
          "On weekends it gets very crowded and noisy.",
          "But I still love this place because the coffee is excellent."
        ]
      },
      { title: 'Weekend Plans', category: 'short-stories', level: 'beginner', day_number: 3,
        sentences: [
          "This weekend I am going to visit my parents.",
          "They live in a small town about two hours away.",
          "My mother is going to cook my favorite dish.",
          "My father wants to take me fishing at the lake.",
          "I need to buy some gifts before I go.",
          "I think I will get flowers for my mother.",
          "And maybe a book for my father.",
          "I haven't seen them in three months.",
          "I really miss them and my old room.",
          "I plan to stay until Sunday evening."
        ]
      },
      // CONVERSATIONS - Intermediate
      { title: 'Job Interview Practice', category: 'conversations', level: 'intermediate', day_number: 4,
        sentences: [
          "Thank you for coming in today. Please have a seat.",
          "Can you tell me a little about yourself and your background?",
          "I graduated from university with a degree in computer science.",
          "I have been working as a software developer for three years.",
          "What would you say is your greatest professional strength?",
          "I am very good at solving complex problems under pressure.",
          "I also have strong communication skills and work well in teams.",
          "Why are you interested in this position at our company?",
          "I admire your innovative products and company culture.",
          "When would you be available to start if we offered you the position?"
        ]
      },
      { title: 'At the Doctor', category: 'conversations', level: 'intermediate', day_number: 5,
        sentences: [
          "Good morning. What seems to be the problem today?",
          "I have had a terrible headache for the past three days.",
          "I also feel dizzy when I stand up too quickly.",
          "Have you been taking any medication for the pain?",
          "I took some aspirin but it did not help much.",
          "Let me check your blood pressure and temperature.",
          "Your blood pressure is slightly higher than normal.",
          "I am going to prescribe some stronger medication.",
          "You should also get plenty of rest and drink lots of water.",
          "If the symptoms do not improve, please come back next week."
        ]
      },
      // IT / TECH - Advanced
      { title: 'Sprint Planning Meeting', category: 'tech-conversations', level: 'advanced', day_number: 6,
        sentences: [
          "Let us review the backlog items for the next sprint.",
          "The authentication module needs to be refactored completely.",
          "We should implement two-factor authentication using JSON web tokens.",
          "The estimated effort for this feature is about eight story points.",
          "We also need to optimize the database queries for the dashboard.",
          "The current response time is over three seconds which is unacceptable.",
          "I suggest we add proper indexing and implement caching with Redis.",
          "Can we also allocate time for writing unit tests and documentation?",
          "Each developer should aim for at least eighty percent code coverage.",
          "Let us schedule the sprint review for next Friday afternoon."
        ]
      },
      { title: 'Code Review Discussion', category: 'tech-conversations', level: 'advanced', day_number: 7,
        sentences: [
          "I noticed you are using a synchronized block in this method.",
          "Have you considered using a concurrent hash map instead?",
          "That would reduce thread contention and improve overall performance.",
          "Also this function is doing too many things at once.",
          "We should break it down following the single responsibility principle.",
          "I agree. I will create separate methods for validation and processing.",
          "Another thing, the error handling here could be more specific.",
          "Instead of catching the generic exception, we should handle each type separately.",
          "Good point. I will also add proper logging for debugging purposes.",
          "Please make these changes and request another review when you are ready."
        ]
      },
      { title: 'Daily Standup Update', category: 'tech-conversations', level: 'intermediate', day_number: 8,
        sentences: [
          "Good morning everyone. Let me give my update from yesterday.",
          "I finished the API integration for the payment module.",
          "I wrote fifteen unit tests and all of them are passing now.",
          "Today I will start working on the notification service.",
          "I need to integrate with the email provider and push notification system.",
          "I do not have any blockers at the moment.",
          "However I might need help with the deployment configuration later.",
          "The staging environment needs to be updated with the latest changes.",
          "I will push my code to the development branch this afternoon.",
          "Does anyone have questions or dependencies on my work?"
        ]
      },
      // NEWS - Intermediate
      { title: 'Technology News Update', category: 'news', level: 'intermediate', day_number: 9,
        sentences: [
          "A major technology company announced its latest artificial intelligence model today.",
          "The new system can understand and generate human language with remarkable accuracy.",
          "Experts say this could transform how we interact with computers.",
          "In other news, a cybersecurity firm discovered a critical vulnerability.",
          "The flaw affects millions of devices running the popular operating system.",
          "Users are strongly advised to update their software immediately.",
          "Meanwhile, a startup has raised fifty million dollars in funding.",
          "They plan to build autonomous delivery robots for urban areas.",
          "The company expects to begin testing in three major cities next year.",
          "Industry analysts predict that automation will continue to grow rapidly."
        ]
      },
      { title: 'Business English Meeting', category: 'business', level: 'advanced', day_number: 10,
        sentences: [
          "I would like to discuss our quarterly performance and future strategy.",
          "Revenue increased by fifteen percent compared to the previous quarter.",
          "Customer acquisition costs have decreased thanks to our digital marketing efforts.",
          "However, we need to address the rising operational expenses.",
          "I propose we invest more in automation to reduce manual processes.",
          "Our competitors have already implemented similar solutions with great results.",
          "We should also consider expanding into the Southeast Asian market.",
          "The preliminary market research shows significant growth potential there.",
          "I recommend we form a task force to evaluate this opportunity.",
          "Let us schedule a follow-up meeting to review the detailed proposal."
        ]
      }
    ];

    for (const ex of exercises) {
      const existing = await query('SELECT id FROM dictation_exercises WHERE title = ?', [ex.title]);
      if (!existing.length) {
        await query('INSERT INTO dictation_exercises (title, category, level, sentences, day_number) VALUES (?,?,?,?,?)',
          [ex.title, ex.category, ex.level, JSON.stringify(ex.sentences), ex.day_number]);
        console.log(`  📝 ${ex.title} (${ex.level})`);
      }
    }

    console.log('✅ Dictation exercises seeded!');
    process.exit(0);
  } catch (e) { console.error('Error:', e); process.exit(1); }
}

migrateDictation();
