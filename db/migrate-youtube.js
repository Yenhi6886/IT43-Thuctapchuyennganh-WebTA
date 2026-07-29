require('dotenv').config();
const { query } = require('./database');

async function translateText(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data[0].map(x => x[0]).join('');
}

async function fetchAndTranslateYT(videoId) {
  const payload = { context: { client: { clientName: "ANDROID", clientVersion: "20.10.38" } }, videoId };
  const headers = { "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)", "Content-Type": "application/json" };
  
  const res = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", { method: "POST", headers, body: JSON.stringify(payload) });
  const data = await res.json();
  const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!tracks) throw new Error("No caption tracks available for this video: " + videoId);

  const enTrack = tracks.find(t => t.languageCode === 'en' || t.languageCode.startsWith('en')) || tracks[0];
  const enRes = await fetch(enTrack.baseUrl, { headers });
  const xml = await enRes.text();

  const regex = /<p[^>]*t="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let match, lines = [];
  while ((match = regex.exec(xml)) !== null) {
    const timeMs = parseInt(match[1]);
    let rawText = match[2].replace(/<[^>]+>/g, '').replace(/\n/g, ' '); 
    rawText = unescapeXml(rawText).trim();
    if (rawText && !rawText.includes('[Music]') && !rawText.includes('[Applause]')) {
      lines.push({ time: Math.floor(timeMs / 1000), text: rawText });
    }
  }

  let uniqueLines = [], lastTime = -1, currentText = '';
  for (let l of lines) {
    if (l.time > lastTime + 2) {
      if (currentText) uniqueLines.push({ time: lastTime, text: currentText.trim() });
      lastTime = l.time; currentText = l.text;
    } else {
      if (!currentText.includes(l.text)) currentText += ' ' + l.text;
    }
  }
  if (currentText) uniqueLines.push({ time: lastTime, text: currentText.trim() });
  
  uniqueLines = uniqueLines.slice(0, 150); // limit for free translate

  const batchSize = 10;
  for (let i = 0; i < uniqueLines.length; i += batchSize) {
    const chunk = uniqueLines.slice(i, i + batchSize);
    const chunkText = chunk.map(l => l.text).join(' ||| '); 
    try {
      const translation = await translateText(chunkText);
      const viLines = translation.split(/\s*\|\|\|\s*/);
      chunk.forEach((l, idx) => { l.vi = viLines[idx]?.trim() || ''; });
    } catch (e) {
      console.error(`  ⚠️ translation fail chunk ${i}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 1000)); 
  }

  return uniqueLines;
}

function unescapeXml(str) {
  return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

async function seedYouTube() {
  try {
    await query('DELETE FROM youtube_listening');
    
    const videos = [
      { id: 'lCAg8Ybm2us', title: 'Real English Conversation Mastery', cat: 'conversation', level: 'intermediate', day: 1, dur: '10:00' },
      { id: 'juKd26qkNAw', title: 'Daily English Conversation - Office & Work', cat: 'conversation', level: 'beginner', day: 3, dur: '3:45' },
      { id: 'XKu_SEDAykw', title: 'Google Coding Interview Example', cat: 'tech-interview', level: 'advanced', day: 5, dur: '30:00' },
      { id: 'bBTPZ9NdSk8', title: 'System Design Interview Preparation', cat: 'tech-interview', level: 'advanced', day: 8, dur: '20:00' },
      { id: 'UF8uR6Z6KLc', title: 'Steve Jobs - Stanford Speech', cat: 'business', level: 'advanced', day: 10, dur: '15:00' },
      { id: 'KVpq8EE0q0U', title: 'Daily Standup Dialogues', cat: 'conversation', level: 'intermediate', day: 12, dur: '45:00' },
      { id: 'o8NPllzkFhE', title: 'Linus Torvalds: The Mind Behind Linux', cat: 'tech-conversation', level: 'intermediate', day: 15, dur: '21:00' },
      { id: 'MsxcpZr1LpM', title: 'English for Developers: Real Daily Stand-up Meeting (EnglishNotNull)', cat: 'tech-conversation', level: 'intermediate', day: 16, dur: '12:00' },
      { id: 'GOmQzWShGvs', title: 'Kafka Deep Dive - Technical Discussions | Speaking Practice (EnglishNotNull)', cat: 'tech-conversation', level: 'advanced', day: 18, dur: '14:00' },
      { id: '3AZTKsz_jJ4', title: 'Slow English Podcast | Future of AI in Software Development (EnglishNotNull)', cat: 'tech-conversation', level: 'intermediate', day: 20, dur: '22:00' },
      { id: 'IpwdY54SaZE', title: 'Advanced Docker Concepts', cat: 'technical code', level: 'advanced', day: 22, dur: '18:00' },
      { id: 'keMf59PV6Zw', title: 'Slow English Podcast | Apache Kafka Deep Dive for Developers (EnglishNotNull)', cat: 'tech-conversation', level: 'intermediate', day: 24, dur: '15:00' },
      { id: 'XORccKyFBC0', title: 'Coding Skills Not Enough? How English Unlocks High-Paying Tech Jobs (EnglishNotNull)', cat: 'business', level: 'beginner', day: 25, dur: '1:00' },
      { id: '_4DcPQbQPZU', title: 'Stuck Working Overtime? English for Dev Life (EnglishNotNull)', cat: 'conversation', level: 'beginner', day: 26, dur: '1:00' }
    ];

    for (const v of videos) {
      console.log(`⏳ Fetching & Translating: ${v.title} (${v.id})...`);
      try {
        const transcript = await fetchAndTranslateYT(v.id);
        await query('INSERT INTO youtube_listening (title, youtube_id, category, level, duration, transcript, day_number) VALUES (?,?,?,?,?,?,?)',
          [v.title, v.id, v.cat, v.level, v.dur, JSON.stringify(transcript), v.day]);
        console.log(`  ✅ Inserted ${transcript.length} synced bilingual lines.`);
      } catch (e) { console.error(`  ❌ Failed ${v.id}: ${e.message}`); }
    }
    console.log('\n✅ Extraction & translation complete!');
    process.exit(0);
  } catch (e) { console.error('Error:', e); process.exit(1); }
}

seedYouTube();
