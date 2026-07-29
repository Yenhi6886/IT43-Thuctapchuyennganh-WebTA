const { translate } = require('@vitalets/google-translate-api');

async function getCaptionsInnerTube(videoId) {
  const payload = {
    context: {
      client: {
        clientName: "ANDROID",
        clientVersion: "20.10.38"
      }
    },
    videoId: videoId
  };

  const headers = {
    "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
    "Content-Type": "application/json"
  };

  const res = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
    method: "POST", headers, body: JSON.stringify(payload)
  });

  const data = await res.json();
  const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!tracks) return null;

  const enTrack = tracks.find(t => t.languageCode === 'en' || t.languageCode.startsWith('en')) || tracks[0];
  
  const enRes = await fetch(enTrack.baseUrl, { headers });
  const xml = await enRes.text();

  // Parse XML lines
  const regex = /<p[^>]*t="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let match;
  let lines = [];
  while ((match = regex.exec(xml)) !== null) {
    const timeMs = parseInt(match[1]);
    let rawText = match[2].replace(/<[^>]+>/g, '').replace(/\n/g, ' '); // Strip `<s>` tags
    rawText = unescapeXml(rawText).trim();
    if (rawText) {
      lines.push({ time: Math.floor(timeMs / 1000), text: rawText });
    }
  }

  // Deduplicate times (sometimes captions have multiple lines per timestamp due to word highlighting)
  let uniqueLines = [];
  let lastTime = -1;
  let currentText = '';
  for (let l of lines) {
    if (l.time > lastTime + 1) {
      if (currentText) uniqueLines.push({ time: lastTime, text: currentText.trim() });
      lastTime = l.time;
      currentText = l.text;
    } else {
      // Append if not exact duplicate
      if (!currentText.includes(l.text)) currentText += ' ' + l.text;
    }
  }
  if (currentText) uniqueLines.push({ time: lastTime, text: currentText.trim() });

  // Now uniqueLines has clean EN lines. Let's translate them!
  console.log(`Extracted ${uniqueLines.length} EN lines. Translating...`);

  // Batch translate (batch up to 50 lines per request)
  const batchSize = 50;
  for (let i = 0; i < uniqueLines.length; i += batchSize) {
    const chunk = uniqueLines.slice(i, i + batchSize);
    const chunkText = chunk.map(l => l.text).join(' \n|||\n ');
    
    try {
      const { text } = await translate(chunkText, { to: 'vi' });
      const viLines = text.split('|||').map(s => s.trim());
      
      chunk.forEach((l, idx) => {
        l.vi = viLines[idx] || '';
      });
    } catch (e) {
      console.error("Translation error:", e.message);
    }
  }

  console.log(uniqueLines.slice(0, 5));
  return uniqueLines;
}

function unescapeXml(str) {
  return str.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

getCaptionsInnerTube('juKd26qkNAw');
